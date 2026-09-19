#!/usr/bin/env python3
"""Historical R5 KiCad checks only; R6 uses tools/verify_r6_electronics.py.

This script never updates the current R6 verification report.
"""

import hashlib
import json
import math
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

import pcbnew

ROOT = Path(__file__).resolve().parent
manifest = json.loads((ROOT / "assembly.json").read_text())
pad_data = json.loads((ROOT / "pcb-pads.json").read_text())["pads"]
source = ROOT / manifest["board"]["source"]
assert hashlib.sha256(source.read_bytes()).hexdigest() == manifest["board"]["sha256"]
board = pcbnew.LoadBoard(str(source))
actual = []
for fp in board.GetFootprints():
    for pad in fp.Pads():
        actual.append(
            [
                fp.GetReference(),
                pad.GetNumber(),
                pad.GetNetname(),
                round(pcbnew.ToMM(pad.GetPosition().x) - 4, 3),
                round(pcbnew.ToMM(pad.GetPosition().y) - 4, 3),
                round(pcbnew.ToMM(pad.GetDrillSize().x), 3),
            ]
        )
assert sorted(actual) == sorted(pad_data)
footprints = {fp.GetReference(): fp for fp in board.GetFootprints()}
assert {item["ref"] for item in manifest["components"]} == set(footprints)
for item in manifest["components"]:
    fp = footprints[item["ref"]]
    assert item["value"] == fp.GetValue()
    assert item["footprint"] == str(fp.GetFPID().GetLibItemName())
    assert item["rotation_deg"] == fp.GetOrientationDegrees()

for ref, number, net, x, y in manifest["remote_button"]["pcb_endpoints"]:
    assert any(p[:5] == [ref, number, net, x, y] for p in actual)
assert not next(c for c in manifest["components"] if c["ref"] == "SW")["installed"]
assert {p[1]: p[2] for p in actual if p[0] == "J1"} == {
    "1": "OUT+",
    "2": "VSW",
    "3": "GND",
    "4": "GATE",
    "5": "SENSE",
    "6": "GND",
}
layout = json.loads((ROOT / "driver-layout.json").read_text())
parents = {}


def root(hole):
    parents.setdefault(hole, hole)
    if parents[hole] != hole:
        parents[hole] = root(parents[hole])
    return parents[hole]


def xy(hole):
    row, col = ord(hole[0]) - 65, int(hole[1:]) - 1
    assert 0 <= row < 5 and 0 <= col < 13
    return (2.26 + 2.54 * col, 2.42 + 2.54 * row)


occupied = []
bodies = []
for group in layout["groups"]:
    for h1, h2 in group["jumpers"]:
        parents[root(h1)] = root(h2)
    for prefix in ("Q", "Rg", "Rp"):
        holes = list(group[prefix + "_holes"].values())
        occupied.extend(holes)
        for hole in holes:
            xy(hole)
    qx, qy = group["Q_body_center_mm"]
    bodies.append((group["Q"], qx, qy, 3.7, 4.8))
    for prefix in ("Rg", "Rp"):
        x, y = xy(group[prefix + "_holes"]["a_body"])
        bodies.append((group[prefix], x, y, 2.5, 2.5))
assert len(occupied) == len(set(occupied)), "Two component leads share a reserved hole"
for group in layout["groups"]:
    q, rg, rp = group["Q_holes"], group["Rg_holes"], group["Rp_holes"]
    assert root(q["G"]) == root(rg["b_return"]) == root(rp["a_body"])
    assert root(q["S"]) == root(rp["b_return"]) == root("C13")
    assert len({root(q["D"]), root(q["G"]), root(q["S"]), root(rg["a_body"])}) == 4
for i, a in enumerate(bodies):
    _, x, y, w, h = a
    assert 0 <= x - w / 2 and x + w / 2 <= 35
    assert 0 <= y - h / 2 and y + h / 2 <= 15
    for b in bodies[i + 1 :]:
        assert abs(x - b[1]) >= (w + b[3]) / 2 or abs(y - b[2]) >= (h + b[4]) / 2, (
            a[0],
            b[0],
        )
gaps = []
for i, a in enumerate(bodies):
    for b in bodies[i + 1 :]:
        if a[0].startswith("R") and b[0].startswith("R"):
            gap = math.hypot(a[1] - b[1], a[2] - b[2]) - (a[3] + b[3]) / 2
        elif a[0].startswith("R") or b[0].startswith("R"):
            circle, rectangle = (a, b) if a[0].startswith("R") else (b, a)
            dx = max(0, abs(circle[1] - rectangle[1]) - rectangle[3] / 2)
            dy = max(0, abs(circle[2] - rectangle[2]) - rectangle[4] / 2)
            gap = math.hypot(dx, dy) - circle[3] / 2
        else:
            dx = max(0, abs(a[1] - b[1]) - (a[3] + b[3]) / 2)
            dy = max(0, abs(a[2] - b[2]) - (a[4] + b[4]) / 2)
            gap = math.hypot(dx, dy)
        assert gap > 0
        gaps.append(gap)
for svg in ROOT.glob("*.svg"):
    document = ET.parse(svg)
    assert document.getroot().tag == "{http://www.w3.org/2000/svg}svg"
    assert document.find(".//{http://www.w3.org/2000/svg}title") is not None
firmware = json.loads((ROOT / "firmware-builds.json").read_text())
firmware_zip = ROOT / "dark-moth-r5-firmware.zip"
assert (
    hashlib.sha256(firmware_zip.read_bytes()).hexdigest()
    == firmware["firmware_zip_sha256"]
)
firmware_root = ROOT.parent / "firmware"
if not firmware_root.is_dir():
    firmware_root = ROOT.parents[1] / "firmware"
with zipfile.ZipFile(firmware_zip) as archive:
    assert archive.testzip() is None
    for filename, expected in firmware["source_sha256"].items():
        source_bytes = (firmware_root / "dark_moth_ble_v3" / filename).read_bytes()
        assert hashlib.sha256(source_bytes).hexdigest() == expected
        assert archive.read("dark_moth_ble_v3/" + filename) == source_bytes
report = {
    "revision": "R5",
    "pcb_sha256": manifest["board"]["sha256"],
    "source_footprints": len(list(board.GetFootprints())),
    "source_pads": len(actual),
    "exact_pad_coordinates_and_nets_match": True,
    "remote_switch_unpopulated": True,
    "driver_component_leads": len(occupied),
    "driver_nominal_bodies": len(bodies),
    "driver_nominal_body_minimum_gap_mm": round(min(gaps), 3),
    "driver_nominal_assembled_height_mm": 9.2,
    "driver_gate_source_pwm_drain_nodes_isolated": True,
    "physical_validation": False,
    "firmware_zip_matches_compiled_source": True,
    "limitations": [
        "Nominal body clearance excludes bent leads and solder",
        "Purchased parts and wire routes unmeasured",
        "Electrical load and thermal behavior untested",
    ],
}
(ROOT / "verification-r5-historical.json").write_text(
    json.dumps(report, indent=2) + "\n"
)
print(json.dumps(report))
