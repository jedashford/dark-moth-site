"""Repeatable partial collision audit of actual GLB geometry versus printed CAD.

Non-solid module surfaces are listed as exclusions. Wire tubes are closed only
at planar open ends that match their declared endpoints. That preserves their
exported surface while making solid intersections possible; no wire path is
regenerated from metadata. Does not validate supplier fit or electrical behavior.
"""

import hashlib
import json
import sys
from datetime import datetime, timezone
from functools import reduce
from pathlib import Path

import numpy as np
import trimesh
from assembly_mesh import Export
from verify import solid

ROOT = Path(__file__).resolve().parents[1]
PARTS = ("body", "lid", "rail", "button", "switch_carrier", "diffuser")
TOLERANCE = 0.01


def close_wire_ends(mesh, endpoints):
    """Cap only convex, planar end rings; refuse arbitrary mesh repair."""
    _, inverse, counts = np.unique(
        mesh.edges_sorted, axis=0, return_inverse=True, return_counts=True
    )
    boundary = mesh.edges[counts[inverse] == 1]
    if len(boundary) == 0:
        return mesh, 0
    following = dict(boundary.tolist())
    if len(following) != len(boundary) or len(set(following.values())) != len(boundary):
        raise ValueError("Ambiguous wire boundary; not an isolated end ring")
    vertices, faces, caps = mesh.vertices.tolist(), mesh.faces.tolist(), 0
    while following:
        first = next(iter(following))
        ring, current = [], first
        while current in following:
            ring.append(current)
            current = following.pop(current)
        if current != first or len(ring) < 3:
            raise ValueError("Wire boundary is not a closed polygon")
        points = mesh.vertices[ring]
        center = points.mean(axis=0)
        distance = np.linalg.norm(np.asarray(endpoints) - center, axis=1).min()
        _, _, vectors = np.linalg.svd(points - center)
        planar_error = abs((points - center) @ vectors[-1]).max()
        if (
            distance > 0.02
            or planar_error > 0.002
            or np.linalg.norm(points - center, axis=1).max() > 0.6
        ):
            raise ValueError(
                "Open wire boundary does not match a declared planar endpoint"
            )
        index = len(vertices)
        vertices.append(center.tolist())
        faces.extend(
            (ring[(i + 1) % len(ring)], ring[i], index) for i in range(len(ring))
        )
        caps += 1
    closed = trimesh.Trimesh(vertices, faces, process=True)
    if not closed.is_watertight:
        raise ValueError("Wire remains non-solid after closing its end rings")
    return closed, caps


def main():
    glb_path = ROOT / "preview/full-assembly.glb"
    catalog_path = ROOT / "preview/assembly-parts.json"
    model, catalog = Export(glb_path), json.loads(catalog_path.read_text())
    obstacles = {
        name: solid(trimesh.load_mesh(ROOT / "build/assembly" / f"{name}.stl"))
        for name in PARTS
    }
    report = {
        "tested": [],
        "skipped": [],
        "intersections": [],
        "wire_end_caps_added": 0,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "tolerance_mm3": TOLERANCE,
        "method": "Manifold intersections of exported solid GLB shells against assembly STLs; wire end rings capped",
        "limitations": [
            "Partial audit: non-solid component surfaces are explicitly skipped, not certified clear.",
            "Only contacts with printed parts are checked; module-to-module and conductor-to-conductor contacts are excluded.",
            "Nominal module dimensions and polyline wire bends are unmeasured; supplier fit and bend radii require physical checks.",
        ],
    }
    for key, meta in catalog.items():
        if meta["category"] == "enclosure" or not meta.get("default_visible", True):
            continue
        fragments = [
            trimesh.Trimesh(points, faces, process=True)
            for points, faces in zip(model.points[key], model.faces[key], strict=True)
        ]
        if meta["category"] == "wiring":
            endpoints = [
                p for path in meta["wire_points_mm"] for p in (path[0], path[-1])
            ]
            closed = []
            for fragment in fragments:
                try:
                    value, caps = close_wire_ends(fragment, endpoints)
                    closed.append(value)
                    report["wire_end_caps_added"] += caps
                except ValueError as error:
                    report["skipped"].append(
                        {"part": key, "reason": str(error), "wire": True}
                    )
            shells = closed
        else:
            combined = trimesh.util.concatenate(fragments)
            combined.merge_vertices()
            shells = combined.split(only_watertight=False, repair=False)
        usable = [
            mesh
            for mesh in shells
            if mesh.is_watertight and abs(mesh.volume) > 0.000001
        ]
        if len(usable) != len(shells):
            report["skipped"].append(
                {"part": key, "non_solid_components": len(shells) - len(usable)}
            )
        values = []
        for mesh in usable:
            if mesh.volume < 0:
                mesh.invert()
            try:
                values.append(solid(mesh))
            except ValueError as error:
                report["skipped"].append({"part": key, "reason": str(error)})
        if not values:
            continue
        value = reduce(lambda a, b: a + b, values)
        report["tested"].append(key)
        for name, obstacle in obstacles.items():
            overlap = value ^ obstacle
            if overlap.volume() > TOLERANCE:
                finding = {
                    "part": key,
                    "case_part": name,
                    "overlap_mm3": overlap.volume(),
                    "bounds_mm": list(overlap.bounding_box()),
                }
                report["intersections"].append(finding)
                print(finding, flush=True)
    report["passed"] = not report["intersections"] and not any(
        row.get("wire") for row in report["skipped"]
    )
    report["coverage"] = {
        "logical_parts_tested": len(report["tested"]),
        "wire_nets_tested": sum(
            catalog[key]["category"] == "wiring" for key in report["tested"]
        ),
        "parts_with_excluded_surfaces": len({row["part"] for row in report["skipped"]}),
        "printed_obstacles": len(obstacles),
    }
    inputs = [
        glb_path,
        catalog_path,
        *(ROOT / "build/assembly" / f"{name}.stl" for name in PARTS),
    ]
    report["input_sha256"] = {
        str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest()
        for path in inputs
    }
    output = ROOT / "build/full-assembly-collision-audit.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(
        f"Partial solid audit: {report['coverage']}; {len(report['intersections'])} intersections. {output}"
    )
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
