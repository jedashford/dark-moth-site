# Dark Moth — R6 integrated prototype

R6 combines the confirmed **ESP32-C3 SuperMini**, power electronics and five LED
drivers on one **18-column × 24-row (A–X) isolated-pad carrier**. The case has a
left-side button, the original faceted moth, a removable front diffuser and a
battery bay sized around the user's **67 × 36 × 10 mm, 3000 mAh protected pack**.

[Inspect the complete product](index.html#explore) ·
[Build the carrier in 3D](perfboard.html?board=carrier#workbench) ·
[Exact wiring instructions](CARRIER_GUIDE.md) ·
[Print setup](print.html) ·
[Download the R6 pack](dark-moth-r6-print-pack.zip)

![R6 CAD assembly](preview/hero.png)

**Prototype status:** digital checks, source-linked models and firmware builds do
not establish a working physical product. Purchased-part fit, actual battery
lead ratings, low-voltage operation, charging, thermal behavior and optical output
need the bench checks in [the electrical plan](PRODUCT_ELECTRICAL_PLAN.md).
Current evidence is recorded in [VERIFICATION.md](VERIFICATION.md) and
[verification-summary.json](verification-summary.json).

## What changed together

- A removable carrier cassette and raised module supports replace the old
  manufactured latch PCB and separate floor-mounted modules.
- The user's UMLIFE mini USB-C charger, separate regulated 5 V/12 V converters,
  a low-voltage supervisor and low-gate-voltage MOSFETs replace the earlier power arrangement.
  **New parts are required**; use the carrier guide's exact purchasing list.
- Five identical driver groups align on rows C/G/K/O/S. The underside carries
  insulated connections; the guide identifies every solder window and hole.
- The external harness uses **BATTERY 2-pin, BUTTON 2-pin and LIGHTS 6-pin**.
  The light connector is +12 V, green, red, blue, warm white, cool white.
- The ground-contact button uses an isolated active-LOW input. R6 firmware and
  R5 button wiring are incompatible. Flash only the revision you assembled.
- The case retains the original moth and **104 × 28 × 3 mm** removable diffuser.
  A removable insert supports the smaller **42 × 25 × 10 mm** battery.

## Build in this order

1. Read the [carrier guide](CARRIER_GUIDE.md) and check the actual board, module
   markings, battery and connector sizes. The blank is nominally 47.78 × 63.02 mm;
   the user confirmed the hole count, not the measured board outline.
2. Obtain the listed replacements and assemble one board first. Use the 3D
   inspector, hole tables and underside net view together. Shared ground means
   one electrically continuous network; unrelated positive rails and LED returns
   remain separate.
3. Follow the staged, current-limited electrical bring-up before connecting the
   battery. Do not build a batch from an untested first unit.
4. Load [R6 C3 firmware](FIRMWARE_GUIDE.md). Remove the internal 5 V service shunt
   before attaching the ESP's programming USB. The separate charging port faces
   the outside; programming access is with the lid removed.
5. Print and test the [coupon](prints/coupon.stl), then follow the
   [per-part print instructions](PRINT_GUIDE.md). All STL units are millimetres;
   exported files already have their intended bed orientation.
6. Install the carrier, battery restraint, remote button, three plug pairs and
   diffuser. Check the physical wiring and clearances before closing the lid.

## Battery and connectors

The user's battery has a factory 1.25 mm connector. The selected build replaces
only that connector with the kit's two-pin XH-style plug while retaining the
factory wires, protection circuit and sealed pouch. Change one conductor at a
time and insulate its completed contact before cutting the other. Use recessed
contacts on the battery side. Measure polarity before mating; wire colors and
housing orientation do not prove polarity.

The kit marked XH2.54 is not automatically the same geometry or rating as genuine
JST XH (2.5 mm). Use matched contacts/housings from the same kit and confirm their
fit and wire range. The connector model is a nominal fit allowance. Battery and
button are both two-pin: label both mating halves and keep them in their separate
case locations. Never swap them.

## Charge with the device off

Hold the side button for two seconds until the red cue, then release to shut
both regulated rails and the controller down. Only then connect charging USB.
Leave the button alone while charging; disconnect USB before switching the
device on again. A short tap or a Bluetooth "off" command only blacks out the
LEDs and is not the complete shutdown required for charging.

The smaller charger has no implemented automatic USB lockout or system
power-sharing circuit. This is the user-selected **off-while-charging** build.
Its battery terminals B+/B− and system terminals OUT+/OUT− have distinct roles;
the complete carrier ground goes to OUT−, never across the protection path.

Use the electrical guide's supervised open-case first-charge checks. Identify
and measure the actual charge setting, cell temperature, termination and
low-voltage cutoff before enclosing a unit. No pack-temperature sensor is
connected to this generic charger. [The charger review](CHARGER_REVIEW.md)
records the supplied module and limits.

## Print and service

[PRINT_GUIDE.md](PRINT_GUIDE.md) lists supports and orientation for every part.
[cad/parts.json](cad/parts.json) is the printable inventory. The downloadable
native support projects are unsliced reference setups; choose your real printer,
material and nozzle and inspect generated support paths before printing.

The diffuser is **purchased smoked acrylic**. `diffuser.stl` is its cutting/fit
template, not a recommendation to block the light with opaque black PETG.
Remove the two front rail screws to withdraw the sheet without opening the
main electronics lid. The dark stock previously described for the older case
was only about 94.8 mm wide; confirm the actual sheet before cutting 104 mm.

Disconnect battery and charging USB before lifting the electronics cassette.
Printed supports and the insulating liner must never press exposed solder joints
against metal hardware or the battery pouch. Wires need service slack and
strain relief at the plug saddles.

## Reproduce the design

Run from `v3-button/enclosure/`, or the extracted `dark-moth-r6/` directory.
Install OpenSCAD, Blender, Bambu Studio, Arduino CLI/ESP32 core and the Python
requirements. Geometry, slicing, firmware and browser checks use local temporary
workspaces; no command below uploads firmware or sends a print job.

```sh
python tools/build_perfboard_layout.py
python tools/build_perfboard_worksheets.py
python tools/verify_r6_electronics.py
python tools/build_firmware.py
python tools/build.py
python tests/verify.py
python tests/verify_variants.py
python tests/test_printability.py
python tools/slice_check.py
python tools/build_print_project.py
python tools/build_guide.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/render.py
python tests/test_full_assembly.py
python tests/audit_full_assembly.py
node --test tests/test_*.mjs
python tools/package.py
python -m unittest discover -s tests -p 'test_*.py'
```

The browser test requires Playwright and Chromium; set `PLAYWRIGHT_MODULE` if
using an existing installation. The release pack includes the exact compiled
firmware source and rejects stale source hashes or missing verification.

Run `python site/serve.py --port 8000` and open
[the local website](http://localhost:8000/). The deployed site is
[Dark Moth](https://jedashford.github.io/dark-moth-site/).

Historical KiCad files and earlier latch/driver worksheets are reference inputs
only. **CARRIER_GUIDE.md, the R6 carrier data and R6 firmware define this build.**
