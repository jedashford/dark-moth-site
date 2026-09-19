# Dark Moth R6 — design review

R6 integrates the 18 × 24 carrier, selected C3, compact UMLIFE charger, two
regulated supplies and three removable plugs into the Dark Moth case. The
original faceted moth, side button and removable smoked diffuser are retained.
The larger protected battery has a dedicated bay, smooth pad, removable bridge
and an optional insert for the smaller pack.

## Mechanical decisions

<!-- markdownlint-disable MD013 -->

| Requirement                                         | Implemented R6 decision                                                                                                                   |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Preserve the original appearance                    | Original 44-path moth, 44 mm wide and 0.5 mm recessed; dark case and smoked front sheet.                                                  |
| Fit the integrated carrier                          | Removable tray, insulating liner and rear keeper for the nominal 47.78 × 63.02 × 1.6 mm board; no invented carrier mounting holes.        |
| Fit the selected modules above the discrete circuit | Open insulating tier with individual rims and removable clamps; PCB undersides 12 mm above the carrier top.                               |
| Use the user's compact charger                      | Nominal UMLIFE 18 × 14 × 5 mm envelope, left-facing USB, compact holder. Full device must be off while charging.                          |
| Fit the larger protected pack                       | 67 × 36 × 10 mm nominal pack with 1 mm smooth pad, restraint screws outside the pouch and rear lead clearance.                            |
| Make external connections removable                 | Two-pin battery, two-pin button and six-pin LED plug pairs, each labeled and retained in a saddle.                                        |
| Keep the side control serviceable                   | Captive key centered at Y97, Z15.5; 0.35 mm nominal travel and a separate retained switch daughterboard.                                  |
| Replace the diffuser independently                  | 104 × 28 × 3 mm sheet in side grooves and a lower stop; remove two front screws and the rail.                                             |
| Avoid a long printed front bridge                   | Open-top body window; the removable rail supplies its lintel.                                                                             |
| Show every specified assembly item                  | One canonical model inventory with 169 selectable groups, including 33 carrier assemblies, 28 screws, six plug halves and 55 wire groups. |
| Keep print exports and rendering consistent         | Import exact assembly STLs into the full model; shared `cad/parts.json` drives print and assembled-part inventories.                      |

<!-- markdownlint-enable MD013 -->

The case is 111 × 115 × 40 mm outside. The original 9.2 mm LED-to-acrylic gap
is retained without claiming optical uniformity. The side charger window is
16 × 9 mm; ESP programming USB is reached with the lid off and service shunt
removed. [The mechanical plan](PRODUCT_MECHANICAL_PLAN.md) records placements,
fixture details and outstanding measurements.

## Electrical representation

The current source is the integrated carrier in `electronics/perfboard-layout.json`.
The model contains its 432 drilled isolated pads, all 33 placed component
assemblies and their leads, 17 underside conductors, and all 39 intermediate
solder joints. The seven added riser wires are distinct from the 32 retained
component leads. A low-battery supervisor and nonpolar bypass capacitor are
included in the revised carrier.

The current build no longer uses the manufactured KiCad main PCB, BQ25185
charger, its NTC arrangement, or the former TP4056/MT3608 placement. The UMLIFE
module has distinct battery and output negative nodes; the model and guide
preserve that distinction. The authoritative instructions are
[CARRIER_GUIDE.md](CARRIER_GUIDE.md) and
[PRODUCT_ELECTRICAL_PLAN.md](PRODUCT_ELECTRICAL_PLAN.md).

Purchased modules, connector housings, screws and wiring are nominal models.
The C3 details are illustrative clone geometry; the charger and regulator
models do not invent unidentified chips or physical pad coordinates. Module
wire ends are explicitly marked unresolved and parked loose above each module
until the actual labeled pads are identified. The complete device must be
switched off before charging; no automatic charging lockout is claimed.

The full model preserves every wire. The Inside view hides wiring to expose
the mechanical arrangement, while the wiring and exploded views retain it.
The exploded stack is checked so modules appear above their tier and clamps
above the modules. Rendered smoke/transmission and other materials are
illustrative; the views are unlit geometry evidence.

## Verification and physical boundary

Current compact-charger checks pass: 734 default geometry checks, 979 parameter
checks, 17 actual slices and three support-project round-trips. Ten GLB tests
inspect actual mesh buffers for inventory, placement, drill rings, component
leads, solder-joint contacts and the exploded order.

The solid collision audit checks 153 logical groups, including **all 55 wire
groups**, against all 15 installed printed parts, with zero intersections above
0.01 mm³. Seven items contain excluded label/emitter surface fragments; no wire
is skipped. This is a partial check against printed obstacles, not a supplier
fit or conductor-to-conductor clearance certificate.

All 17 printable exports are connected solids with connected first layers.
[Printability](PRINTABILITY.md) identifies the three support-bearing parts and
[Verification](VERIFICATION.md) links the reports. Actual carrier outline,
module projections, connector dimensions, screw forms, acrylic thickness and
battery seams/lead exit still require measurement and dry fit. The retained
nominal carrier outline must not be inferred solely from the 18 × 24 hole count.

No physical print or operating electrical prototype has been qualified.
Charging, cutoff behavior, temperature, switch feel, connector retention,
support removal and light output require the staged physical checks in the
build guides. This release supplies a digitally checked prototype for that
first-build process.
