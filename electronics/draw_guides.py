#!/usr/bin/env python3
"""Draw diagrams from the reviewed manifest; no CAD or purchased-part measurements implied."""

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
assembly = json.loads((ROOT / "assembly.json").read_text())
pad_rows = json.loads((ROOT / "pcb-pads.json").read_text())["pads"]
wiring = json.loads((ROOT / "interconnects.json").read_text())
COLORS = {
    "OUT+": "#b74623",
    "VSW": "#ae5811",
    "GND": "#254854",
    "GATE": "#824ab4",
    "SENSE": "#007c9e",
    "BTN_N": "#bc3458",
}


def text(x, y, label, size=16, color="#223840", anchor="start"):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" text-anchor="{anchor}">{html.escape(str(label))}</text>'


def rect(x, y, w, h, fill="#fff", stroke="#c2cecf", radius=8):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'


def line(points, color="#60757c", width=3):
    return f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="{width}"/>'


def save(name, width, height, content, title):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title"><title id="title">{html.escape(title)}</title><g font-family="Arial,Helvetica,sans-serif">{rect(0, 0, width, height, "#f5f3eb", "#f5f3eb", 0)}{"".join(content)}</g></svg>\n'
    (ROOT / name).write_text(svg)


def placement():
    parts = [
        text(50, 48, "R5 · CORRECTED POWER-LATCH PCB", 27),
        text(
            50,
            78,
            "Component side • 94 × 60 mm • coordinates from upper-left board edge",
            17,
        ),
    ]
    x0, y0, scale = 50, 120, 9
    parts += [rect(x0, y0, 94 * scale, 60 * scale, "#dae6d8", "#77957a", 6)]
    for comp in assembly["components"]:
        ref = comp["ref"]
        cx, cy = comp["center_mm"]
        x, y = x0 + scale * cx, y0 + scale * cy
        if ref.startswith("H"):
            parts += [
                f'<circle cx="{x}" cy="{y}" r="12" fill="#f5f3eb" stroke="#587361"/>',
                text(x, y - 19, ref, 12, anchor="middle"),
            ]
            continue
        if ref.startswith("R") or ref == "Db":
            rows = [p for p in pad_rows if p[0] == ref]
            parts += [
                line(
                    f"{x0 + scale * rows[0][3]},{y} {x0 + scale * rows[1][3]},{y}",
                    "#657875",
                    4,
                )
            ]
            w = 56 if ref.startswith("R") else 36
            parts += [
                rect(
                    x - w / 2,
                    y - 10,
                    w,
                    20,
                    "#86b8c7" if ref.startswith("R") else "#d59b70",
                    "#55737a",
                    4,
                )
            ]
            if ref == "Db":
                parts += [rect(x - w / 2 + 4, y - 10, 5, 20, "#2b3336", "#2b3336", 0)]
        elif ref in ("QL", "QP"):
            parts += [rect(x - 22, y - 28, 44, 31, "#333d43", "#24323c", 10)]
        elif ref == "J1":
            parts += [rect(x - 74, y - 11, 148, 22, "#374850", "#293b40", 2)]
        else:
            parts += [rect(x - 32, y - 29, 64, 58, "#fff1ec", "#bc3458", 2)]
        value = "OMIT SWITCH" if ref == "SW" else comp["value"]
        if ref == "J1":
            value = ""
        parts += [
            text(x, y - 36, ref, 17, anchor="middle"),
            text(x, y + 38, value, 14, anchor="middle"),
        ]
        if ref in ("QP", "QL"):
            parts += [
                text(
                    x,
                    y + 61,
                    "1E 2B 3C" if ref == "QP" else "1D 2G 3S",
                    13,
                    anchor="middle",
                )
            ]
    for ref, num, net, px, py, drill in pad_rows:
        if not net:
            continue
        x, y = x0 + px * scale, y0 + py * scale
        color = COLORS.get(net, "#7a673a")
        parts += [
            f'<circle cx="{x}" cy="{y}" r="6.5" fill="{color}" stroke="#fff" stroke-width="1.5"/>'
        ]
        if ref == "J1":
            parts += [text(x, y + 38, num, 14, anchor="middle")]
        if ref == "SW":
            parts += [
                text(
                    x + (-10 if net == "OUT+" else 10),
                    y - 7,
                    net,
                    12,
                    color,
                    "end" if net == "OUT+" else "start",
                )
            ]
    parts += [text(935, 146, "J1 · left to right", 22)]
    j1 = [r for r in pad_rows if r[0] == "J1"]
    for i, r in enumerate(j1):
        parts += [
            text(940, 187 + i * 34, f"{r[1]}   {r[2]}", 19, COLORS.get(r[2], "#223840"))
        ]
    notes = [
        "QP pads: E / B / C",
        "QL pads: D / G / S",
        "Verify actual transistor leads.",
        "Db stripe → pad 1 / BTN_DIO",
        "Resistors have no polarity.",
        "Rbtn is 1k in this PCB.",
    ]
    for i, note in enumerate(notes):
        parts += [text(935, 440 + i * 29, note, 16)]
    parts += [text(50, 710, "REMOTE BUTTON · two wires to existing SW holes", 22)]
    for i, s in enumerate(
        [
            "OUT+ → upper-left SW hole: local (34.0, 45.0); KiCad (38.0, 49.0)",
            "BTN_N → upper-right SW hole: local (40.5, 45.0); KiCad (44.5, 49.0)",
            "These are both numbered 1 in the footprint. Select by coordinate + net, not number alone.",
            "Leave the four-leg PCB switch unpopulated. Its repeated pad-number groups conflict with these nets.",
            "Fitted remote switch must be open released, closed only when pressed; connect through an inline 2-pin plug.",
        ]
    ):
        parts += [text(50, 749 + i * 28, s, 17)]
    parts += [
        text(
            50,
            928,
            "DRC-clean copper layout ≠ tested electronics. Nominal component bodies are illustrative.",
            16,
            "#655c4d",
        )
    ]
    save(
        "pcb-placement.svg",
        1310,
        960,
        parts,
        "R5 PCB placement and exact detachable button solder pads",
    )


def overview():
    p = [
        text(45, 48, "R5 · MODULE WIRING", 28),
        text(
            45,
            80,
            "Use C3 pin numbers throughout, or S3 throughout. Module pad positions vary; match printed labels.",
            17,
        ),
    ]
    boxes = [
        (45, 140, 210, 180, "BATT · 1S LiPo"),
        (310, 140, 250, 250, "CHG · protected TP4056"),
        (650, 140, 280, 390, "PCB · J1 + SW holes"),
        (1030, 140, 255, 250, "BOOST · MT3608"),
        (650, 575, 280, 225, "ESP · SuperMini"),
        (45, 520, 510, 210, "REMOTE BUTTON · detachable"),
    ]
    for x, y, w, h, title in boxes:
        p += [rect(x, y, w, h), text(x + 18, y + 33, title, 18)]
    p += [
        text(65, 215, "+  → BAT+", 18, "#b74623"),
        text(65, 270, "−  → BAT− ONLY", 18, "#254854"),
    ]
    p += [line("255,210 310,210", "#b74623"), line("255,265 310,265", "#254854")]
    for i, t in enumerate(
        [
            "BAT+     OUT+",
            "BAT−     OUT−",
            "Keep BAT− and OUT− separate",
            "Verify protection is fitted",
        ]
    ):
        p += [text(330, 210 + i * 48, t, 15)]
    p += [
        line("560,210 650,210", "#b74623"),
        line("560,258 610,258 610,320 650,320", "#254854"),
    ]
    for i, t in enumerate(
        [
            "1 OUT+ ← CHG.OUT+",
            "2 VSW → BOOST.VIN+ + ESP.5V",
            "3 GND ← CHG.OUT−",
            "4 GATE → latch GPIO",
            "5 SENSE → button ADC GPIO",
            "6 GND → common load return",
        ]
    ):
        p += [text(668, 212 + i * 47, t, 15)]
    p += [
        line("930,258 1030,258", "#ae5811"),
        line("930,447 985,447 985,307 1030,307", "#254854"),
    ]
    for i, t in enumerate(
        [
            "VIN+ ← VSW",
            "VIN− / VOUT− → GND",
            "VOUT+ → LED +12V",
            "Set 12.0 V before LED connection",
        ]
    ):
        p += [text(1048, 210 + i * 45, t, 15)]
    p += [
        text(668, 507, "SW holes: OUT+ / BTN_N", 16, "#bc3458"),
        line("790,530 790,575", "#824ab4"),
        text(808, 558, "J1 harness", 14),
    ]
    for i, row in enumerate(
        [("Role", "C3", "S3"), ("Latch", "3", "9"), ("Button ADC", "4", "8")]
    ):
        p += [
            text(669, 632 + i * 33, row[0], 16),
            text(820, 632 + i * 33, row[1], 16),
            text(875, 632 + i * 33, row[2], 16),
        ]
    p += [
        text(669, 731, "5V ← VSW · GND ← OUT−", 16),
        text(669, 764, "Battery ADC omitted by default", 16),
    ]
    for i, t in enumerate(
        [
            "SW left upper hole → OUT+ lead",
            "SW right upper hole → BTN_N lead",
            "PCB ── keyed inline 2-pin plug ── remote NO contacts",
            "Press closes OUT+ to BTN_N. No GND button wire.",
            "PCB four-leg switch remains unpopulated.",
        ]
    ):
        p += [text(65, 580 + i * 29, t, 16)]
    p += [line("555,645 592,645 592,507 650,507", "#bc3458")]
    p += [rect(1030, 510, 255, 290), text(1050, 548, "LED / DRIVER", 20)]
    for i, t in enumerate(
        [
            "+12V common → strip +12V",
            "Strip R/G/B/WW/CW returns",
            "→ corresponding Q drains",
            "All Q sources → GND",
            "GPIO → 100Ω → Q gate",
            "Q gate → 10k → GND",
        ]
    ):
        p += [text(1048, 591 + i * 32, t, 15)]
    p += [
        text(
            45,
            855,
            "SYSTEM GND = CHG.OUT−, J1.3/J1.6, ESP.GND, BOOST.VIN−/VOUT− and all driver sources.",
            18,
        )
    ]
    p += [
        text(
            45,
            891,
            "CELL− = battery negative and CHG.BAT− only. Do not bridge it to system GND.",
            18,
            "#b74623",
        )
    ]
    p += [
        text(
            45,
            937,
            "GPIO pads are not 12 V tolerant. Disconnect external power harness before USB firmware flashing.",
            16,
        )
    ]
    save(
        "wiring.svg",
        1330,
        970,
        p,
        "R5 protected charger, latch PCB, detachable button and module wiring",
    )


def channels():
    p = [
        text(40, 45, "R5 · FIVE IDENTICAL LED CHANNELS", 27),
        text(
            40,
            78,
            "Separate hand-wired perfboard; these are circuit references, not pads on the 94 × 60 latch PCB.",
            17,
        ),
    ]
    for i, c in enumerate(wiring["channels"]):
        y = 150 + i * 145
        p += [
            rect(35, y - 32, 1210, 125),
            text(55, y, c["channel"], 22),
            text(55, y + 31, f"C3 GPIO{c['C3_GPIO']} / S3 GPIO{c['S3_GPIO']}", 15),
        ]
        p += [
            text(295, y, f"{c['series']} · 100Ω", 18),
            text(660, y, f"{c['Q']} · BS170", 19),
            text(985, y, f"LED {c['channel']} return", 18),
        ]
        p += [
            line(f"245,{y + 25} 310,{y + 25}"),
            rect(310, y + 15, 88, 20, "#8bb8cb"),
            line(f"398,{y + 25} 668,{y + 25}"),
            text(638, y + 17, "G", 16),
        ]
        p += [
            rect(670, y + 9, 48, 43, "#33434c"),
            text(730, y + 21, "D", 15),
            text(730, y + 50, "S", 15),
        ]
        p += [
            line(f"751,{y + 18} 975,{y + 18}"),
            line(f"751,{y + 48} 840,{y + 48} 840,{y + 75}"),
            text(850, y + 81, "GND", 15),
        ]
        p += [
            line(f"525,{y + 25} 525,{y + 64} 800,{y + 64} 800,{y + 75} 840,{y + 75}"),
            rect(555, y + 55, 70, 18, "#8bb8cb"),
            text(525, y + 88, f"{c['pulldown']} · 10k", 14),
        ]
    p += [
        text(
            40,
            910,
            "Keep each Q/Rg/Rp group together. Verify MOSFET D/G/S with the actual manufacturer datasheet.",
            17,
        ),
        text(
            40,
            942,
            "Proposed 35 × 15 mm isolated-pad placement is in driver-perfboard.svg; physical assembly remains unverified.",
            17,
        ),
    ]
    save(
        "led-driver.svg",
        1280,
        970,
        p,
        "Exact five-channel MOSFET resistor and GPIO wiring",
    )


if __name__ == "__main__":
    placement()
    overview()
    channels()
    print("Wrote PCB placement, module wiring and LED driver SVGs")
