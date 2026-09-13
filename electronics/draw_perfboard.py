#!/usr/bin/env python3
"""Draw the exact proposed isolated-pad driver layout from its manifest."""

import json
from pathlib import Path

from draw_guides import line, rect, save, text

ROOT = Path(__file__).resolve().parent
layout = json.loads((ROOT / "driver-layout.json").read_text())


def pos(hole):
    row, col = ord(hole[0]) - 65, int(hole[1:]) - 1
    return 115 + col * 65, 165 + row * 65


def make():
    content = [
        text(45, 45, "R5 · DRIVER PERFBOARD HOLE MAP", 27),
        text(
            45,
            78,
            "Component side • isolated pads • 35 × 15 mm • 2.54 mm pitch • nominal bodies, unmeasured",
            17,
        ),
    ]
    content += [rect(55, 105, 945, 380, "#e5d6b3", "#a39065")]
    for col in range(1, 14):
        content += [text(pos(f"A{col}")[0], 128, col, 15, anchor="middle")]
    for row in "ABCDE":
        content += [text(74, pos(row + "1")[1] + 5, row, 16)]
        for col in range(1, 14):
            x, y = pos(f"{row}{col}")
            content += [
                f'<circle cx="{x}" cy="{y}" r="8" fill="#ba9650" stroke="#fff0cd" stroke-width="2"/>'
            ]
    colors = ["#27764c", "#b74645", "#2968a3", "#967129", "#61559f"]
    for i, g in enumerate(layout["groups"]):
        color = colors[i]
        dx, dy = pos(g["Q_holes"]["D"])
        gx, gy = pos(g["Q_holes"]["G"])
        sx, sy = pos(g["Q_holes"]["S"])
        content += [
            rect(gx - 28, gy - 37, 56, 74, "#34434a", "#223139", 9),
            text(gx, gy + 5, g["Q"], 16, "#fff", "middle"),
        ]
        content += [
            line(f"{dx},{dy} {gx},{gy - 37}", color),
            line(f"{sx},{sy} {gx},{gy + 37}", color),
            text(dx - 16, dy + 5, "D", 13),
            text(gx - 43, gy + 5, "G", 13),
            text(sx - 16, sy + 5, "S", 13),
        ]
        for prefix, name in [("Rg", g["Rg"]), ("Rp", g["Rp"])]:
            a = pos(g[f"{prefix}_holes"]["a_body"])
            b = pos(g[f"{prefix}_holes"]["b_return"])
            content += [
                line(f"{a[0]},{a[1]} {b[0]},{b[1]}", color),
                f'<circle cx="{a[0]}" cy="{a[1]}" r="20" fill="#9ec8d0" stroke="{color}" stroke-width="3"/>',
                text(a[0], a[1] + 5, name, 13, "#203c45", "middle"),
            ]
        content += [text(gx, 510, g["channel"], 18, color, "middle")]
    gx, gy = pos("C13")
    content += [text(gx + 12, gy + 6, "GND", 16)]
    content += [
        text(
            45,
            563,
            "Underside: insulated jumpers for each column c = 2, 4, 6, 8, 10",
            20,
        )
    ]
    notes = [
        "Gate: B[c] → D[c+1] → E[c+1]. Source: C[c] → E[c].",
        "Common return: C2 → C4 → C6 → C8 → C10 → C13 → system GND.",
        "GPIO input wires: D2/D4/D6/D8/D10. Strip G/R/B/WW/CW returns: A2/A4/A6/A8/A10.",
        "Rg = 100Ω, body at D[c]. Rp = 10k, body at E[c+1]. Both resistors stand upright.",
        "Do not join entire rows or columns. Insulate upright return leads and all underside crossovers.",
        "Nominal assembled height 9.2 mm; actual part body size, bent leads and wire clearance need dry-fit.",
    ]
    for i, note in enumerate(notes):
        content += [text(45, 603 + i * 31, note, 17)]
    save(
        "driver-perfboard.svg",
        1090,
        810,
        content,
        "Exact proposed R5 isolated-pad driver perfboard hole and wiring layout",
    )


if __name__ == "__main__":
    make()
