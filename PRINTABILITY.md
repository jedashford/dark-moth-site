# Dark Moth R6 — printability review

All 17 exports were checked in their supplied print orientations and actually
sliced with Bambu Studio 02.08.02.61. **Body, button and carrier tray require
normal automatic supports everywhere, including bridges.** The other fourteen
exports sliced without supports and without warnings.

The portable `black-parts.3mf` contains 16 arranged objects and no printer,
filament or process presets. The separate diffuser plate is an optional cutting/
fit template. Use the [print guide](PRINT_GUIDE.md), keep the supplied orientation,
and inspect real support extrusion in slicer Preview before printing.

## Current reference results

The isolated reference process uses bundled P1S / 0.4 mm / Generic PETG profiles,
0.20 mm layers, four walls, six top/bottom layers and 20% gyroid infill. Supports
are not restricted to the bed, critical-regions-only is off, the threshold is
30°, and bridges receive support. All 17 slices completed without slicing
warnings or effective-setting mismatches.

| Supported part | Support toolpath sections | Support extrusion moves |
| -------------- | ------------------------: | ----------------------: |
| Body           |                       201 |                   5,884 |
| Button         |                        11 |                     503 |
| Carrier tray   |                       118 |                   2,733 |

These are sections/moves in the current reference toolpath, not counts of
separate support towers. They confirm support was actually generated. A slicer
can suppress an overhang warning merely because supports are enabled; check the
paths themselves. All three delivered native reference projects were reopened
and sliced successfully using their embedded support settings. They contain no
sliced G-code. See `build/slice/report.json` and `profiles/manifest.json`.

## Features requiring inspection

The body has one 16 × 9 mm charging-USB opening in its left wall. Its roof,
the two low LED-wire passages, and the side-button cradle/opening require
support. The open cavity and ports provide removal access before electronics
are fitted. The front light aperture remains open at the top during printing;
the separate rail supplies its lintel and retains the removable acrylic.

The tray has raised board-capture lips and side wire passages. Remove support
from these features before sliding in the actual carrier. The fitted capture
assumes a 47.78 × 63.02 × 1.6 mm blank with an 18 × 24 hole grid. The purchased
blank's outside dimensions and hole offsets remain unmeasured.

The button's flange needs support even if an unsupported preview looks
connected. Clean it completely and check free return. Its nominal travel remains
0.35 mm with a 0.10 mm initial switch gap; actual tactile-switch force and stroke
require a physical trial.

The lid and coupon share the original 44 bed-facing moth recesses, exactly
0.5 mm deep. Some fine webs are about 0.30 mm wide, so a 0.4 mm nozzle can merge
or omit detail. The coupon's actual mesh sections match the delivered lid's
recess and print orientation. Its upright 3.2 / 3.4 / 3.6 mm stock slots remain
open at the top. Inspect the coupon before cutting the 104 × 28 × 3 mm acrylic.

The module tier is one connected open frame. Four separate clamps secure the
C3, compact UMLIFE charger, and two regulator PCBs. Inspect the small pilot bores,
edge keepers and ESP USB notch. PCB edge copper, solder projections and actual
module thickness remain unverified; do not clamp an occupied solder land.

The connector saddles include removable-strap paths and two pack-lead notches.
Their housing reservations are nominal for the user's kit, not an approved
JST footprint. The battery bridge prints roof-down with legs upward and screw
bores vertical. Its former side-on orientation produced a cantilever warning;
the delivered orientation slices cleanly without support. The optional small-
pack insert is removed for the selected 67 × 36 × 10 mm pack.

## Coverage and limits

All 17 STLs are watertight, single connected solids and begin at Z=0. Actual
cross-sections at Z=0.1 show one connected first-layer region per part. Geometry
checks also cover installed-part clearances, button and diffuser motion,
carrier capture/removal, nominal module boards, screw access and plate bounds.
The [mechanical plan](PRODUCT_MECHANICAL_PLAN.md) lists exact placements and
[design review](REVIEW.md) describes the complete R6 assembly.

Passing mesh and slicing checks do not certify printed surfaces, shrinkage,
support release, screw grip, wire bend radii, purchased-part fit, battery
restraint, thermal behavior or light quality. No physical print was performed.
Print the coupon, measure actual stock and dry-fit before wiring the closed case.
