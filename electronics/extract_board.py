#!/usr/bin/env python3
"""Extract physical pad data from the copied KiCad source; run with KiCad Python."""

import hashlib
import json
from pathlib import Path

import pcbnew

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source/power_button_fixed.kicad_pcb"
board = pcbnew.LoadBoard(str(SOURCE))
components = []
rows = []
for fp in sorted(board.GetFootprints(), key=lambda f: f.GetReference()):
    ref = fp.GetReference()
    pads = list(fp.Pads())
    for pad in pads:
        pos = pad.GetPosition()
        rows.append(
            [
                ref,
                pad.GetNumber(),
                pad.GetNetname(),
                round(pcbnew.ToMM(pos.x) - 4, 3),
                round(pcbnew.ToMM(pos.y) - 4, 3),
                round(pcbnew.ToMM(pad.GetDrillSize().x), 3),
            ]
        )
    center = [
        round(sum(pcbnew.ToMM(p.GetPosition()[i]) for p in pads) / len(pads) - 4, 3)
        for i in (0, 1)
    ]
    kind, body, installed = "mounting_hole", [2.7, 2.7, 0], False
    if ref.startswith("R"):
        kind, body, installed = "axial_resistor", [6.3, 2.5, 2.5], True
    elif ref in ("QP", "QL"):
        kind, body, installed = "TO92", [4.8, 3.7, 5.2], True
    elif ref == "Db":
        kind, body, installed = "axial_diode", [4.0, 2.0, 2.0], True
    elif ref == "J1":
        kind, body, installed = "header_1x6", [15.24, 2.54, 8.5], True
    elif ref == "SW":
        kind, body, installed = "tact_switch_unpopulated", [6, 6, 4.3], False
    components.append(
        {
            "ref": ref,
            "value": fp.GetValue(),
            "kind": kind,
            "footprint": str(fp.GetFPID().GetLibItemName()),
            "center_mm": center,
            "rotation_deg": fp.GetOrientationDegrees(),
            "body_mm": body,
            "installed": installed,
            "dimensions_status": "footprint nominal; purchased part unmeasured",
        }
    )
manifest = {
    "revision": "R5",
    "schema_version": 1,
    "status": "Source-derived build instructions; electrical and physical bench validation pending",
    "coordinate_system": "PCB component-side view: local origin at KiCad (4,4), X right, Y down; all dimensions mm",
    "board": {
        "source": "source/power_button_fixed.kicad_pcb",
        "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "size_mm": [94, 60, 1.6],
        "kicad_origin_mm": [4, 4],
        "pad_data": "pcb-pads.json",
    },
    "components": components,
    "modules_file": "modules.json",
    "wiring_file": "interconnects.json",
    "driver_layout_file": "driver-layout.json",
    "remote_button": {
        "pcb_switch_populated": False,
        "reason": "SW footprint repeated pad numbers span different assigned nets; do not install its matching four-leg switch",
        "pcb_endpoints": [["SW", "1", "OUT+", 34, 45], ["SW", "1", "BTN_N", 40.5, 45]],
        "connector": "Inline keyed 2-pin cable pair, not a PCB connector footprint",
        "contact_requirement": "Remote normally-open contacts: open released, continuity only while pressed",
        "nominal_switch_mm": [6, 6, 4.3],
        "daughterboard_mm": [12, 12, 1.6],
        "connector_envelope_mm": [10, 7, 6],
        "connector_dimensions_status": "routing allowance only; no purchased connector measured",
    },
    "warnings": [
        "Original hardware/power_button.kicad_pcb has real shorts; use this copied corrected source",
        "DRC verifies geometry and nets, not transistor pinout, SW contact internals, analog performance or load capacity",
        "Battery negative goes only to charger BAT-; system return goes only to protected OUT-",
        "PCB Rbtn is 1k, despite an older wiring document saying 10k",
        "100k/100k SENSE divider requires analog sensing, not a guaranteed digital HIGH",
        "Optional raw-battery telemetry divider is omitted to avoid injecting an unpowered MCU input",
        "SS8550 rail drop, 3.3V BS170 drive, clone regulator dropout and full-load temperatures need bench measurement",
    ],
}
(ROOT / "assembly.json").write_text(json.dumps(manifest, indent=2) + "\n")
(ROOT / "pcb-pads.json").write_text(
    json.dumps(
        {
            "columns": ["ref", "pad_number", "net", "x_mm", "y_mm", "drill_mm"],
            "coordinates": "PCB-local; add4 to X/Y for KiCad absolute",
            "pads": rows,
        },
        indent=2,
    )
    + "\n"
)
print(f"Extracted {len(components)} footprints and {len(rows)} pads")
