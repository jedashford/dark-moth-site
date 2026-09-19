# Dark Moth R6 — digital verification

R6 is a digitally checked **prototype**, built around the ESP32-C3 SuperMini, an integrated 18 × 24-hole carrier, protected 67 × 36 × 10 mm battery, removable side-button cable and six-pin LED cable. Physical fit, electrical load performance, charging and optical output are not certified by these checks.

[verification-summary.json](verification-summary.json) is the release record. It contains the geometry, parameter-variant, printability, slicing, electrical, firmware, browser and full-model results with their source hashes. Packaging refuses failed, missing or stale evidence. The exact current counts belong to that machine-readable record.

## What is checked

### Printable geometry and assembly

The canonical inventory is [cad/parts.json](cad/parts.json): 17 printable exports, including the optional small-battery insert and fit coupon. The diffuser STL is a template for the removable purchased acrylic sheet. All installed printed solids in the complete model come from the exported assembly STLs.

Geometry checks require watertight, consistently wound, positive-volume, single-component meshes and bed-aligned print orientations. Solid intersections check the printed assembly, module envelopes, battery, holder, screws, button travel and diffuser access. The original 44-facet moth is retained at 44 mm width and 0.5 mm recess depth. Sheet-thickness variants are generated separately, so their tests cannot overwrite the delivered default parts.

The case is nominally 111 × 115 × 40 mm. [The mechanical plan](PRODUCT_MECHANICAL_PLAN.md) records coordinates, fixture clearances, retention, screw locations and the remaining purchased-part measurements. In particular, the assumed carrier outline is not established by its hole count. Measure the actual blank and hole offsets before printing its fitted cassette.

### Actual slicing

Every delivered STL is sliced independently using the stated Bambu P1S / 0.4 mm / Generic PETG reference process. The report reads effective settings back from generated G-code and rejects geometry warnings. Support-required parts must generate positive support toolpaths and extrusion; merely enabling a support checkbox does not pass.

[PRINT_GUIDE.md](PRINT_GUIDE.md) gives supplied orientations and support settings. [PRINTABILITY.md](PRINTABILITY.md) describes the actual checks. [profiles/manifest.json](profiles/manifest.json) records unsliced native reference projects and isolated round-trip slices. No executable printer G-code is distributed. Reference slicing does not establish surface finish, support removal or dimensional fit on the user's printer.

### Complete 3D product

[The part catalog](preview/assembly-parts.json) identifies the printed parts, carrier, all canonical discrete assemblies, four purchased modules, battery, LED strip, side switch, external plug halves, insulation, screws, straps and routed conductors. Each item carries source and confidence information. Unmeasured module packages and connector envelopes are identified as nominal; they are not a supplier-certified inventory of every internal SMD.

Full-model tests decode the exported GLB buffers and compare them with the canonical inventory, actual printed meshes, drilled carrier grid, module placement and logical wiring. [The collision audit](tests/audit_full_assembly.py) checks solid GLB geometry against installed printed obstacles. Its record explicitly lists non-solid surfaces excluded from Boolean testing. It does not prove clearance between every pair of wires or purchased components, and it does not establish cable cut lengths or bend radii.

[The six-view render manifest](preview/render_manifest.json) hashes the actual CAD, model generators, electronics layout, GLBs, catalog and studio images. The website uses these same assets for assembled, exploded, internal and service views.

### Electrical consistency and firmware

[electronics/verification.json](electronics/verification.json) records independent checks of the R6 carrier. Tests cover exact roles and values, hole ownership, connected nets, separate regulated supplies, service-link isolation, adapter pin mapping, C3 pins, connector schedules, low-voltage supervision and nominal spacing. Deliberate-fault tests demonstrate rejection of wiring shorts and missing or misassigned connections. [PERFBOARD_VERIFICATION.md](PERFBOARD_VERIFICATION.md) describes the instruction and worksheet checks.

The R6 build uses the user-selected UMLIFE mini charger with complete shutdown during charging, separate regulated supplies and a voltage-supervised MOSFET latch. [PRODUCT_ELECTRICAL_PLAN.md](PRODUCT_ELECTRICAL_PLAN.md) identifies required parts and the reasons for the change. Older KiCad and historical perfboard drawings are retained as source history and do not define this build.

[electronics/firmware-builds.json](electronics/firmware-builds.json) records actual ESP32-C3 and optional ESP32-S3 compilations with Arduino-ESP32 3.3.8. Native C++ tests execute the real button/power code for cold-start release, debounce, short and long gestures, timer wraparound, shutdown on release, LED feedback, idle behavior and permanent HOLD-low shutdown. No board was flashed or bench-tested by these tools. The selected product is the C3.

The firmware ZIP contains the exact compiled source. Packaging requires the complete core source inventory and rejects missing, extra or changed source files, including nested sketch sources. Battery telemetry remains unavailable because R6 has no validated battery-sense circuit. Nominal white-channel blending is not a measured optical calibration.

### Website and delivery

[The browser record](preview/site/r6/browser-checks.json) covers actual WebGL rendering on a temporary test server, desktop/mobile layouts, whole-product modes, independent part inspection, carrier placement, drag-release stability, full vertical rotation, hole/pin instructions, module choices, load recovery and downloads. The matching [perfboard record](preview/site/perfboard/browser-checks.json) contains the same final run. Every check is tied to the tested source hashes.

Publication uses an explicit file allowlist, rejects missing or unsafe files, resolves local links, and writes a deployment manifest containing every served asset's SHA-256. The live-delivery check compares fetched bytes with that manifest. A passing deployment check proves delivery of the reviewed bytes, not hardware function.

## Reproduce

Use the dependencies in [README.md](README.md#reproduce). From the enclosure directory:

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
node tests/test_perfboard_browser.mjs
python tools/package.py
python -m unittest discover -s tests -p 'test_*.py' -v
```

The build tools never upload firmware to a board or send a print job. Browser and deployment tests use their own temporary server and staging directory. Physical first-build checks, charging restrictions and outstanding component measurements remain in the assembly guides.
