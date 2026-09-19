# Dark Moth R6 mechanical implementation

This file describes the implemented R6 CAD in `cad/`, replacing the earlier
proposal. It is a **nominal printable prototype**, not a measured fit approval.
The actual purchased perfboard outline, connector housings, C3 clone and battery
remain unmeasured. Digital checks do not certify electrical performance, battery
charging, temperature, optical diffusion, or physical print fit.

The selected UMLIFE mini USB-C charger is used with the complete device off
while charging. The charger holder and model use the seller's provisional
18 × 14 × 5 mm dimensions and 1.5 mm USB overhang. There is no modeled NTC
connection or inherited BQ25185 power-path/temperature function.

## Preserved product features

- Dark faceted moth: original 44 mm mark, 0.5 mm recess.
- Captive side button and removable switch daughterboard carrier.
- Removable 104 × 28 × 3 mm smoked acrylic. Remove the front two screws and rail
  to lift the rigid sheet; the taller rail includes a lower retaining ceiling.
- Existing front LED rib, with a second bottom wire passage on the right.

The interior is 106.2 × 110.2 × 35.2 mm. The 2.4 mm shell/floor/lid produces a
**111 × 115 × 40 mm** closed outer envelope. The extra 12 mm rear space holds
three removable plug pairs; the extra 4 mm height accommodates the module tier.
The unchanged diffuser sits at case `[1.1, -1, 3.2]`, with its 28 mm axis vertical.
The button center moves rearward to `[0, 97, 15.5]`.

## Coordinate and parts contract

Case X points right, Y rearward, Z upward; the inside floor is Z=0. Coordinates
below are millimetres. `cad/parts.json` is the common printable inventory used
by CAD exports, assembled exports, slicing, rendering, and packaging. The full
scene is `preview/full-assembly.glb`; its item metadata is
`preview/assembly-parts.json`. Actual printable STL meshes are imported unchanged
into that scene. Nominal purchased hardware is labeled separately.

<!-- markdownlint-disable MD013 -->

| Item              | Case placement / size                                | Retention and clearance                                            |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| Carrier           | PCB underside `[3,22,8.2]`; 47.78 × 63.02 × 1.6      | Removable cassette, edge ledges, rear keeper                       |
| Hole grid         | 18 columns × 24 rows, 2.54 pitch, nominal 0.9 drills | 432 isolated pads; X/Y hole origins read independently             |
| C3 SuperMini      | PCB underside `[2,23,21.8]`; 22.5 × 18 × 1.6         | Insulating rim, left keepers, removable right clamp with USB notch |
| UMLIFE charger    | PCB underside `[4,50.875,21.8]`; outline 18 × 14     | Seller envelope, nominal left USB, removable clamp                 |
| 5 V regulator     | PCB underside `[4,76,21.8]`; 13.1 × 8.1              | Separate rim and clamp                                             |
| 12 V regulator    | PCB underside `[21,76,21.8]`; 13.1 × 8.1             | Separate rim and clamp                                             |
| Protected battery | `[62,19,1]`; 36 × 67 × 10                            | Smooth 1 mm pad, loose bridge and lateral stops                    |
| Button pair       | `[21,92,3]`; reserved 18 × 10 × 8                    | Removable insulating strap through saddle slots                    |
| Battery pair      | `[43,92,3]`; reserved 18 × 10 × 8                    | Separate labeled saddle position                                   |
| LED pair          | `[69,88,3]`; reserved 20 × 20 × 8                    | Six contacts; separate labeled saddle position                     |

<!-- markdownlint-enable MD013 -->

The current board outline assumes a 2.3 mm margin to the outer hole centers.
This **does not establish the purchased blank dimensions**: an 18 × 24 hole
board may have a larger outline. Confirm outside width/length and both edge-to-
first-hole offsets before printing the fitted cassette. Update the canonical
carrier data and CAD capture dimensions together if the stock differs.

All module PCB undersides are 12 mm above the carrier component face. The C3
uses unfitted/removed long headers and insulated pigtails. This geometry does
not fit an arbitrary stack of long module headers. Carrier adapter PCBs stand
3 mm above the carrier, with their total package tops at 5.8 mm; the tallest
specified lower-tier component is the 8.6 mm service header/shunt. The W16/W17
service header sits beside the tier and must be removed before programming USB.

## Printable fixtures and assembly

The inventory contains 17 printable exports: body, lid, rail, button,
switch_carrier, diffuser template, coupon, carrier_tray, carrier_keeper,
module_tier, four module clamps, connector_saddles, battery_bridge, and
battery_insert. The insert is optional and hidden in the normal assembled view.

The tray is fixed at `[24,19]`, `[54.5,25]`, `[54.5,82]`. The carrier rests at
Z=8.2, with a removable 0.4 mm insulating liner at Z=2.2. Its canonical wiring
reserve extends from 5.3 to 1.6 mm below the carrier top, leaving 1.9 mm between
the reserved lowest point and the liner. This reserve already includes wire
radius. Remove the module tier, tray screws and cassette before sliding the
board out through the rear with its keeper removed.

The module tier mounts at `[8,19.5]`, `[46,19.5]`, `[15,87.75]`, and
`[46,87.75]`. Its open rims support PCB edge lands. Retaining lips and removable
clamps capture the edges with nominal 0.25 mm vertical play; clamp screw bosses
have 0.25 mm nominal lateral clearance to the substrate. Inspect actual copper,
solder and components before using these edge lands. The left charger USB edge
is open. Do not clamp a solder joint or place metal screws over the antenna.

The battery bridge has no screw over the pouch. Its roof underside is Z=13.5,
2.5 mm above the nominal pack. Use a smooth removable soft restraint to prevent
rattle without squeezing the pack. Screws sit outside the battery at X60/X100,
Y52. No thermistor is installed: the selected charger exposes no verified
pack-temperature input.
The optional insert positions a 42 × 25 × 10 mm smaller protected pack.
Remove it for the 67 × 36 × 10 mm pack. Pack lead exit and bend space occupy
the rear of the battery bay. Preserve the pack's factory protection and leads when
reterminating its connector, following the electrical guide.

Three mated connector pairs are included in the model. Their dimensions are
**reservations for the user's kit**, not a verified genuine JST XH footprint.
Saddles support the housings; removable insulating straps restrain the housing
rather than loading its latch. Disconnect and release the straps before lifting
the tier. Do not interchange the two similar two-pin pairs.

The model includes 28 nominal screws: four M2.5 × 10 case screws, two M2 × 8
side-switch screws, three M2 × 4 tray screws, four M2 × 6 tier screws,
two M2 × 6
keeper screws, eight M2 × 4 clamp screws, three M2 × 4 connector-saddle screws,
and two M2 × 16 battery-bridge screws. Blind pilots continue 1.8 mm into the
2.4 mm floor, retaining 0.6 mm exterior skin. Actual screw head/thread geometry
and printed pilot fit require the coupon and a trial assembly.

## USB and wiring service

The charger window is 16 × 9 mm centered at Y57.875, Z25.0 in the left wall.
Its USB mouth is provisionally at X2.5, using the seller's stated 1.5 mm
overhang. Shell height, pad locations and cable plug dimensions remain nominal.
C3 programming USB is accessed
with the lid removed, after removing the service shunt. Do not assume exterior
access to this internal right-facing connector.

The full 3D model includes carrier component leads, canonical underside jumpers,
39 intermediate solder joints (32 retained component leads and seven separate
risers), module pigtails, three connector-pair harnesses, LED wiring, battery
leads. These wires reserve volume and service slack. They do not
prove conductor-to-conductor separation or the purchased wire bend radius.
Power and common-ground harnesses use a conservative 1.6 mm outer diameter
reservation. The collision audit fails if any visible wire cannot be tested.

All charger, C3 and Pololu physical pad assignments remain unverified. Their
module harness ends are visibly parked loose above each module and
marked `physical_endpoint_unresolved`. Their logical destinations remain in the
electrical manifest. This prevents a plausible-looking model from inventing a
supplier pinout. Complete these assignments after identifying actual stock.

## Validation and print procedure

Installed tools: OpenSCAD 2026.06.12, Blender 4.5.2 LTS, Bambu Studio 02.08.02.61.
OrcaSlicer is not installed. Python uses the isolated
`/tmp/dark-moth-perfboard-venv` environment with trimesh/manifold/scipy.

The reproducible checks are:

1. `tools/build.py`: export every print and assembly STL from current CAD,
   regenerate the drilled carrier substrate, and create portable plate layouts.
2. `tests/verify.py`: solid/manifold, installed-part clashes, nominal hardware
   clearance, board/keeper motion, button travel, acrylic removal/retention,
   screw access, and portable plate bounds.
3. `tests/test_printability.py` and `tests/verify_variants.py`: orientation,
   first-layer contact, moth recess, and specified fit variants.
4. `tools/slice_check.py`: actually slice every printable part with isolated
   reference P1S / 0.4 mm / PETG / 0.2 mm profiles. Require no slicing warnings
   or effective-setting mismatches. Support is required for body, button and
   carrier_tray. The battery bridge prints roof-down with vertical bores.
5. `tools/build_print_project.py`: create and round-trip the three native
   support-bearing reference projects. Delivered projects contain no G-code.
6. `tools/render.py`, `tests/test_full_assembly.py`, and
   `tests/audit_full_assembly.py`: export real geometry, inspect GLB buffers and
   inventory/positions, audit solid hardware/wires against every installed
   printed obstacle, and render six views from the actual model.

The collision report explicitly lists excluded non-solid label/emitter
surface fragments; carrier copper pads are solid rings. It is a partial audit
against printed parts; it does not certify
module-to-module or conductor-to-conductor fit. Keep the limitations with the
reports and release. Final current results live in `build/verification.json`,
`build/slice/report.json`, `profiles/manifest.json`, `build/full-assembly-tests.json`,
and `build/full-assembly-collision-audit.json`; their hashes must match the
packaged sources.

Before printing the fitted parts, measure board outline/offsets, battery
including seam/protection/lead exit, both connector pair types, C3 USB/header
configuration, actual module underside projections, and acrylic thickness.
Print the coupon first. After fitting, verify plug insertion/removal, tier lift
with service slack, battery restraint without compression, USB access, button
return, and diffuser removal. Electrical bench qualification
is separate and is specified in `PRODUCT_ELECTRICAL_PLAN.md` and `CARRIER_GUIDE.md`.

## Verification state

The compact UMLIFE charger geometry passes 734 nominal CAD/assembly checks,
979 parameter-variant checks, all 17 actual STL slices, and all three native
support-bearing print-project round-trips. Ten actual-GLB tests verify the
169-part inventory, source positions, all 39 intermediate solder-joint contacts,
and the order of the exploded stack. The solid collision audit checks 153
logical parts, including all 55 wire groups, against all 15 installed printed
obstacles with zero intersections. Seven items have excluded label/emitter
surface fragments; no wire group is skipped.

These are digital prototype results. They do not establish the purchased blank
outline, actual connector fit, module pad identities, printer tolerances,
wire-to-wire clearance, temperature or electrical operation. No physical
prototype has been printed. The final render manifest records the current six
views and their source hashes; the release gate verifies those hashes together
with the CAD, slicing, model and browser reports before packaging.
