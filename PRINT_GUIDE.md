# Print the Dark Moth R6 case

**Body, button and carrier tray require supports.** Keep every supplied print
orientation. The portable 3MF contains geometry only; it does not enable supports.

[Download the R6 print pack](dark-moth-r6-print-pack.zip) ·
[Inspect the assembly](index.html?mode=inside#explore) ·
[Review all 17 printable parts](PRINTABILITY.md)

This is a nominal prototype. Confirm the actual perfboard outside dimensions,
charger, connector housings, battery and acrylic before printing fitted fixtures.
An 18 × 24 hole count does not establish the blank's outside size.

## 1. Open the reference projects

Support-bearing Bambu reference projects are provided for:

- [Body](profiles/body-p1s-petg.3mf)
- [Button](profiles/button-p1s-petg.3mf)
- [Carrier tray](profiles/carrier_tray-p1s-petg.3mf)

Open each **as a project**, keeping its settings. These unsliced references use
P1S, a 0.4 mm nozzle, Generic PETG and Textured PEI. Select your actual printer,
nozzle, plate and filament before slicing, then recheck the support settings.
Each project was reopened in an isolated slicer and generated real supports
from its embedded settings. No sliced machine G-code is included.

For another slicer, import the individual STLs in their supplied orientations
and use these reference process settings:

| Setting                                | Value          |
| -------------------------------------- | -------------- |
| Layer / first layer                    | 0.20 / 0.20 mm |
| Wall loops                             | 4              |
| Top / bottom shell layers              | 6 / 6          |
| Infill                                 | 20%, gyroid    |
| Supports on body, button, carrier tray | On             |
| Support type                           | Normal (auto)  |
| On build plate only                    | Off            |
| Critical regions only                  | Off            |
| Threshold angle                        | 30°            |
| Don't support bridges                  | Off            |

Use the filament manufacturer's temperatures. Enable Advanced controls if a
setting is hidden. After changing presets, inspect Preview with support/line-
type colouring. Check actual support paths under the charger-window roof, LED
wire passages, side-button cradle, button flange and tray's retaining lips.
A disappearing warning alone does not prove that support material exists.
Supports must remain accessible for removal before electronics are installed.

## 2. Print the coupon first

[Coupon](prints/coupon.stl) prints **moth-down, slot banks up**, matching the lid's
0.5 mm bed-facing recess. Leave its supports off. Use the intended lid material,
plate and layer settings, then inspect the underside after cooling. Fine webs
between the original 44 facets can merge with a 0.4 mm nozzle; inspect the sliced
first layers and the real coupon before printing the full lid.

With the slot banks nearest you, viewed from above, their widths are
**3.2 / 3.4 / 3.6 mm**, left to right. Test a deburred corner of the actual
3 mm acrylic. The case uses a 3.4 mm channel, giving 0.4 mm total nominal
clearance. Confirm sliding fit before cutting the 104 × 28 × 3 mm smoked sheet.

## 3. Print each part in its supplied orientation

<!-- markdownlint-disable MD013 -->

| Part                                              | Bed face                  | Supports / first-print check                                         |
| ------------------------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| [Body](prints/body.stl)                           | Exterior floor; cavity up | **Required.** Clear window, cradle and internal roofs.               |
| [Lid](prints/lid.stl)                             | Moth / outside face down  | Off. Inspect coupon and fine moth details.                           |
| [Front rail](prints/rail.stl)                     | Outside face down         | Off. Inspect long footprint and acrylic keeper.                      |
| [Button](prints/button.stl)                       | Visible key face down     | **Required.** Clean the flange and check free return.                |
| [Switch carrier](prints/switch_carrier.stl)       | Flat back down            | Off. Check daughterboard retaining lips.                             |
| [Coupon](prints/coupon.stl)                       | Moth down; slot banks up  | Off. Check real acrylic thickness.                                   |
| [Diffuser template](prints/diffuser.stl)          | Broad face down           | Off. Optional template; use smoked acrylic for the diffuser.         |
| [Carrier tray](prints/carrier_tray.stl)           | Broad underside down      | **Required.** Clean the board ledges, wire ports and retaining lips. |
| [Carrier keeper](prints/carrier_keeper.stl)       | Flat keeper face down     | Off. Check screw bores and rear board capture.                       |
| [Module tier](prints/module_tier.stl)             | Open frame underside down | Off. Inspect rims, keepers and small pilot bores.                    |
| [ESP clamp](prints/clamp_esp.stl)                 | Broad underside down      | Off. Preserve the USB clearance notch.                               |
| [Charger clamp](prints/clamp_charger.stl)         | Broad underside down      | Off. Fits the nominal 18 × 14 mm UMLIFE seat.                        |
| [5 V clamp](prints/clamp_reg5.stl)                | Broad underside down      | Off. Check small holes without splitting the plastic.                |
| [12 V clamp](prints/clamp_reg12.stl)              | Broad underside down      | Off. Keep distinct from the other module fixtures.                   |
| [Connector saddles](prints/connector_saddles.stl) | Broad underside down      | Off. Clear strap slots and pack-lead notches.                        |
| [Battery bridge](prints/battery_bridge.stl)       | Roof down; legs up        | Off. Keep this orientation so its bores print vertically.            |
| [Small-pack insert](prints/battery_insert.stl)    | Broad underside down      | Off. Optional; remove for the 67 × 36 × 10 mm battery.               |

<!-- markdownlint-enable MD013 -->

The black portable plate contains 16 separate objects, including the coupon and
optional small-pack insert. The diffuser template has its own plate. Enable
supports per object on **body, button and carrier tray only**. Printing parts
separately is the clearest first-build workflow. Avoid automatic reorientation.

## 4. Remove supports and dry-fit

Let the parts cool, then remove supports before installing electronics. Access
the body through its cavity, the single charging-USB opening and the side-button
cradle. Clean the tray's lips and wire passages from its open sides. Avoid
levering against thin ribs, acrylic channels or screw posts.

Clear debris from grooves and pilots. Reject cracked posts or distorted slots.
Test button press and complete release, the daughterboard capture, and acrylic
removal with the front rail off. Fit the tray to the actual blank before soldering.
Inspect module edge lands for pads or components where the clamps will bear.
Do not compress the battery pouch with its bridge or screws.

Follow [Build in this order](README.md#build-in-this-order) and the
[current carrier guide](CARRIER_GUIDE.md). Fit the side-button carrier before the
rear connector saddles. The case's left port is charging USB; ESP programming
USB is accessed with the lid removed and the service shunt removed.

The UMLIFE charger is used with the **complete device off while charging**.
Turning LEDs black is not the same as switching the device off. Follow the
[current charging procedure](README.md#charge-with-the-device-off).

## What has been checked

All 17 meshes have one connected solid, a connected first layer and warning-free
reference slices. The three native support projects were also round-trip sliced.
[Printability](PRINTABILITY.md) and [Verification](VERIFICATION.md) record the
scope. These checks do not establish support removal, surface finish, screw grip,
acrylic fit, button feel, operating temperature or electrical safety of actual
stock. No physical print has been performed or printer contacted.
