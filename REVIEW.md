# Dark Moth R5 — design review

R5 keeps the original faceted moth, moves the control to the **left side**, and makes the smoked diffuser replaceable without opening the electronics lid. It is a separate enclosure folder built from the retained v3-button hand-build layout and the earlier dark-sheet case.

## Decisions and resolved findings

| Requirement or prior problem                                  | R5 decision                                                                                                                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| The aperture symbol replaced the requested moth               | Preserve the exact 44 original path definitions, 44 mm wide and 0.5 mm debossed, without a medallion border                               |
| A central top button interrupted the lid                      | Plain lid and direct side plunger at Y=85, Z=15.5; press inward along +X                                                                  |
| Earlier captured-cap geometry obstructed its claimed travel   | Explicit 0.35 mm travel, 0.10 mm initial gap, captive release flange and carrier hard stop                                                |
| A loose switch board depended on tape                         | Side carrier has retaining lips; the body cradle closes the board's escape path when its two screws are fitted                            |
| Side-carrier installation could be blocked by a module        | Install key/carrier and both interior screws before the boost module                                                                      |
| Old diffuser stack used tape and inconsistent thicknesses     | Default 3 mm acrylic, bottom stop, side grooves and a separately screwed top keeper                                                       |
| A 100 mm window created a long printed bridge                 | Open-top body window; its lintel prints as the removable rail                                                                             |
| The remembered dark sheet had no explicit compatibility check | The old approximately 94.8 mm sheet is too narrow; R5 needs confirmed 104 × 28 × 3 mm cut stock                                           |
| Earlier renders implied optical validation                    | Use actual CAD and clearly label smoked appearance as illustrative and unlit                                                              |
| Enclosure-only models omitted assembly context                | Full specified BOM model with individual components, screws, connectors and logical wire groups; nominal commodity geometry is identified |
| Reusing the PCB switch could join incompatible pad nets       | Leave SW unpopulated; detachable remote switch uses exact OUT+/BTN_N holes by coordinates and net                                         |

The original artwork is preserved in [cad/moth.svg](cad/moth.svg), matching [branding/assets/logo_vector.svg](https://github.com/jedashford/lights/blob/main/branding/assets/logo_vector.svg). The earlier dark-sheet reference is [hardware/case_v2/case.scad](https://github.com/jedashford/lights/blob/main/hardware/case_v2/case.scad). Historical case comparison: [original v3-button CAD](https://github.com/jedashford/lights/blob/v3-button-case/v3-button/case/dark_moth_v3_button_case.scad).

## Electronics and assembly representation

The main board is freshly exported from the corrected KiCad source with actual outline, mounting holes, tracks, pads, solder mask, silkscreen and library components. A translation preserves its handedness: case X=6.1+board-local X, Y=76−board-local Y. Independent checks locate actual drill rings at the header, transistor, resistor, remote-switch solder point and a mounting hole.

The 108-group assembly includes the six case parts, the specified electronic BOM and wiring, ten screws, and an unsupported PCB-switch reference that starts hidden. It does not claim a supplier-specific inventory of every tiny component on an unidentified module. Purchased module packages, wire paths, connector envelopes and screw forms are nominal. The proposed separate driver layout uses fifteen discrete parts on 35 × 15 mm isolated-pad perfboard; its upright resistors and formed leads require a dry build.

[PCB_GUIDE.md](PCB_GUIDE.md) is the authoritative electrical assembly reference. It corrects the old battery-return and button-sense instructions, requires the PCB switch footprint to remain empty, and identifies the inherited power-path limitations. The case cannot fix regulator dropout, unknown transistor variants or an electrically unsuitable load.

## What remains to validate physically

The **344 default geometry checks, 547 parameter checks and seven successful slices** establish modeled geometry and printability in the reference slicer. They do not measure print shrink, screw grip, switch force or stroke, solder tails, purchased-module dimensions, USB cable shells or connector retention.

The actual smoked sheet remains unmeasured. R5 preserves a **9.2 mm LED-to-acrylic gap**, without a claim about hotspots or transmission. An extra opal layer is not included in the retained default stack. Light output, colour, thermal behaviour, charging and battery protection require the staged tests in the electronics guide before a closed-case operating test.

A final mesh audit found and corrected the keyed connector's overlap with the side cradle and the nominal screw-head seating planes. After correction, 101 electronics/hardware groups, including 29 wire nets, have no detected intersection with the six printed parts above 0.01 mm³. Non-solid surfaces in 24 of those groups are excluded, so this remains a partial geometry check; [verification](VERIFICATION.md) records the scope.

Print the coupon first, then dry-fit the side control and actual electronics. The replaceable rail, key and carrier make those adjustments local. Delivered models are ready for that first-print process; they are not a physically certified assembly.
