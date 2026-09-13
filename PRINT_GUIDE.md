# Print the Dark Moth case

**The body and button need supports. Keep the body floor-down, with the open cavity facing up.** The “floating cantilever” warning is reproducible when supports are off. The portable 3MF does not set up supports for you.

[Download the updated print pack](dark-moth-r5-print-pack.zip) · [Inspect the assembly in 3D](index.html?mode=inside#explore) · [Measured review of all seven parts](PRINTABILITY.md)

## 1. Set up the body

**Bambu reference projects with supports saved:** [Body — P1S / 0.4 mm / PETG](profiles/body-p1s-petg.3mf) · [Button — P1S / 0.4 mm / PETG](profiles/button-p1s-petg.3mf).

Open these **as projects**, keeping their settings, rather than importing geometry alone. They are unsliced reference projects for **P1S, 0.4 mm nozzle, Generic PETG and Textured PEI**. Select your actual printer, nozzle, plate and filament before slicing; recheck the support values below after changing presets. Each project was reopened in an isolated slicer and generated real supports using only its embedded settings. They contain standard printer profile templates but no sliced print G-code.

For another slicer or a fresh setup, import [body.stl](prints/body.stl) and [button.stl](prints/button.stl) separately, keeping their supplied orientations. Use these starting process settings:

| Setting                       | Value                        |
| ----------------------------- | ---------------------------- |
| Layer height                  | 0.20 mm; first layer 0.20 mm |
| Wall loops                    | 4                            |
| Top / bottom shell layers     | 6 / 6                        |
| Sparse infill                 | 20%, gyroid                  |
| Enable support                | On                           |
| Type                          | Normal (auto)                |
| On build plate only           | Off                          |
| Support critical regions only | Off                          |
| Threshold angle               | 30°                          |
| Don't support bridges         | Off                          |

Enable Advanced settings if a control is hidden. The reference run uses a **0.4 mm nozzle and Generic PETG**. Use your filament manufacturer's temperatures. These are starting settings; the reference P1S profile is not confirmation of your printer model.

**Slice, then inspect Preview with the line type / support colouring.** You must see actual support material beneath the two USB roofs, the LED wire-opening overhang and the side-button cradle/opening. Rotate the preview and scroll through those layers. Simply losing the warning does not prove that supports were generated: Bambu can suppress the check whenever support is enabled, even if the selected settings produce none.

Build-plate-only supports produced **zero support toolpaths** in our body test. Normal supports everywhere, with bridge support enabled, produced **186 support toolpath sections**. These are sections of sliced paths, not 186 separate support towers. Keep the supports reachable from the cavity and ports; inspect the paths before starting a print.

## 2. Print the coupon first

Use the new [coupon.stl](prints/coupon.stl). Its **moth faces the bed**, matching the lid's 0.5 mm recess and surface orientation. The three slot banks face up. Older downloads put the coupon's moth on top and could not check the lid's underside finish correctly.

Print the coupon with supports off, using the intended lid material, plate and layer settings. After cooling, turn it over to inspect the moth. Some plastic webs between facets are only **0.30 mm** wide; a 0.4 mm nozzle may merge those details. Inspect the sliced first layers and the actual coupon before printing the full lid. The artwork remains the original 44 facets.

With the slot banks nearest you and viewed from above, the slots are **3.2 / 3.4 / 3.6 mm**, left to right. Test a deburred corner or offcut of the actual 3 mm acrylic. The case uses the middle, 3.4 mm channel width: 0.4 mm total clearance around nominal 3 mm stock. Confirm sliding fit before cutting the final **104 × 28 × 3 mm** sheet.

## 3. Check every part

All meshes are supplied in their intended print orientation. Do not use automatic orientation on the whole plate.

| Part                                        | Bed face                          | Support / first-print check                                                                                                                          |
| ------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Body](prints/body.stl)                     | Flat exterior floor; cavity up    | **Required**, normal auto everywhere, bridges included. Inspect generated supports under internal roofs.                                             |
| [Lid](prints/lid.stl)                       | Moth and outside face down        | Off. Check the matching coupon first; fine webs and recessed bridges determine appearance.                                                           |
| [Front rail](prints/rail.stl)               | Outside face down                 | Off. Check the narrow retaining lip, screw seating and acrylic slide.                                                                                |
| [Button key](prints/button.stl)             | Small visible key face down       | **Required**, normal auto everywhere, bridges included. The flange projects up to 2.95 mm at its corners; inspect and remove the support underneath. |
| [Switch carrier](prints/switch_carrier.stl) | Flat back down; retaining lips up | Off. Check the small lips, board capture and screw clearance holes before assembly; the matching pilots are in the body.                             |
| [Coupon](prints/coupon.stl)                 | Moth down; slot banks up          | Off. Use the same plate and profile as the lid.                                                                                                      |
| [Diffuser template](prints/diffuser.stl)    | Broad flat face down              | Off. Optional cutting/fit template; the intended diffuser is purchased smoked acrylic.                                                               |

The supported button reference slice generated **11 support sections** beneath its flange, adding approximately **0.20 g and one minute** compared with the unsupported test. A warning-free unsupported slice does not establish a clean flange. Check that the cleaned key returns freely before final assembly.

The black portable plate contains six separate objects, including the coupon. Enable supports on **body and button only**. Support is a **per-object choice**: avoid turning it on indiscriminately for the moth recess or small clearance features. Slicing each part separately is the clearest first-print workflow.

## 4. Remove supports and dry-fit

Let the body cool, then remove supports **before installing any electronics**. The open cavity, USB openings and inboard opening of the side cradle provide access. Use small pliers and a flush cutter; avoid levering against thin ribs, the acrylic channels or screw posts.

Check that both USB openings and the side-button opening are clear. Remove debris from the cradle, grooves and screw pilots. Reject a cracked rib, split post or distorted channel. Test the button's press and complete release, slide the daughterboard into its carrier, and check the acrylic moves freely with the rail removed.

Then follow the [case assembly order](README.md#hardware-and-assembly-order) and [board assembly guide](board.html). Fit the side-button carrier before the boost module, which obstructs the lower carrier screw.

## What the review establishes

All seven meshes were checked for connected solids, a flat first layer, overhangs and reference slicing. The body warning is caused by real unsupported features; the files are not corrupt. The updated coupon now tests the same bed-facing moth as the lid. [The detailed printability record](PRINTABILITY.md) lists measured limits and the [verification record](VERIFICATION.md) identifies the generated artifacts.

Support removal, surface finish, acrylic fit and button feel still need the first physical print. No machine G-code is supplied and no printer is contacted by the validation tools.
