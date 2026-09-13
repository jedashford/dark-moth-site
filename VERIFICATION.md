# Dark Moth R5 — digital verification

**344/344 default geometry checks · 547/547 parameter checks · 7/7 reference slicer checks passed.** These results establish modeled geometry and slicing, not physical fit, electrical operation or optical performance. Evidence date: **2026-09-13**.

## Evidence and reproduction

[verification-summary.json](verification-summary.json) records counts, input hashes and effective slicing settings. [prints/manifest.json](prints/manifest.json) covers the seven STLs and two portable 3MFs. [preview/render_manifest.json](preview/render_manifest.json) identifies the six real-geometry renders, enclosure model, full assembly model, catalog and their source inputs. Packaging checks those hashes and refuses stale results.

Use the Python environment and separate CAD applications described in [README.md](README.md#reproduce). Run model verification before packaging, then run the delivered-site tests after the ZIP exists. KiCad validation uses its bundled Python, not the pip environment.

```sh
python tools/build.py
python tests/verify.py
python tests/verify_variants.py
python tests/test_printability.py
python tools/slice_check.py
python tools/build_print_project.py
/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/Current/bin/python3 electronics/validate.py
python tools/build_guide.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/render.py
python tests/test_full_assembly.py
python tests/audit_full_assembly.py
python tools/package.py
python -m unittest discover -s tests -p 'test_*.py'
node --test tests/test_assembly_state.mjs
```

Reference runtimes: Python 3.14.7, OpenSCAD 2026.06.12 with Manifold and hard warnings, Blender 4.5.2 LTS, and Bambu Studio 02.08.02.61 for the printability follow-up (original R5 run: 02.08.01.55). Detailed generation logs live in ignored `build/`; no generated G-code is included in the pack.

## Enclosure geometry

- All seven print STLs and six assembly STLs are watertight, consistently wound, positive-volume, single connected shells. Every print mesh starts on Z=0.
- Actual solid Boolean intersections test assembled parts and the retained electronics envelopes with a 0.01 mm³ numerical tolerance.
- The side button moves **+X over 0.35 mm**. Sampled motion, captive release flange, carrier hard stop, switch actuator contact and the **0.10 mm nominal gap** are checked using meshes.
- The vertical 12 mm daughterboard, side-cradle end clearance, edge retention and two interior screw axes are checked against the carrier/body geometry.
- Diffuser extraction is sampled with the rail removed and lid retained. Positive collision checks establish front, rear, bottom and installed-top retention.
- Alternate **1.0 and 3.2 mm** sheets are generated in temporary directories and checked. A **4.0 mm** sheet is rejected by the CAD assertion. Delivered files remain the 3 mm default.
- The 3MF plates use millimetres, contain the intended object set, match the STL solids and fit without overlapping footprints on a 256 mm reference plate.
- The moth's 44 path definitions match the original official vector exactly.

## Electronics model and source checks

[The electronics report](electronics/verification.json) checks the copied corrected PCB's 15 footprints and 34 exact pad coordinates/nets, the remote-switch arrangement, driver layout and the firmware ZIP against its source. The [KiCad DRC report](electronics/source/power_button_fixed-drc.rpt) is included. DRC does not check switch internals, module provenance, load capability or physical circuit operation.

The full model contains **108 logical groups**: the six enclosure parts plus 102 electronics/hardware groups. The specified BOM, fifteen separate driver parts, ten individual screws, connector halves and 29 logical wire groups are represented. The original `pcb_SW` library model is hidden by default and marked unsupported; it must not be populated.

The actual KiCad PCB is translated without reflection. Five independent drill-ring checks match case coordinates within **0.012 mm**, with 98 matching substrate vertices each:

| Feature              | Case X,Y (mm) | Drill radius (mm) |
| -------------------- | ------------- | ----------------: |
| J1 pin 1             | 13.1, 58      |             0.500 |
| QP pin 1             | 34.1, 63      |             0.375 |
| Rs2 pin 1            | 84.1, 36      |             0.400 |
| SW OUT+ solder point | 40.1, 31      |             0.550 |
| H1 mounting hole     | 10.1, 72      |             1.350 |

The exported full model passes **10/10 model test groups**. A separate [repeatable collision audit](tests/audit_full_assembly.py) tests **101 logical electronics/hardware groups, including all 29 wire nets, against six printed obstacles**, with **zero intersections above 0.01 mm³**. The audit uses actual GLB mesh geometry. It closes wire tubes only at verified planar endpoint rings; it does not regenerate routes from the metadata.

This is a partial solid audit: **24 of those 101 groups contain non-solid surfaces that are excluded** from Boolean checks. It does not test every electronics-to-electronics pair or validate purchased-part fit. Both reports and their input hashes are embedded in [verification-summary.json](verification-summary.json).

The nominal driver board is lifted 0.8 mm for insulated underside jumpers. Its modeled transistor bodies reach Z=8.6 mm and resistor lead loops about Z=9.93 mm, within the retained 10 mm allowance. This is proposed geometry; bent leads, solder, insulation and actual resistor dimensions still require inspection.

Every logical model group carries provenance and confidence metadata. Commodity module layouts are illustrative; coverage is of the specified BOM, not an unavailable supplier inventory of every SMD. Wires identify electrical endpoints but do not establish cut lengths or validated physical routing. Their exploded display retains assembled routes.

## Printability follow-up

The reported floating-cantilever warning was reproduced with the body supports off. A second negative control enabled build-plate-only supports and generated zero support material while suppressing the warning. The revised gate requires both the specified support settings and positive support extrusion for the body and button. [The measured review](PRINTABILITY.md) covers all seven parts; [the print guide](print.html) gives the settings and removal sequence.

Four new actual-mesh regression tests verify the coupon’s 44 bed-facing recesses, exact 0.5 mm depth, agreement with the lid’s printed orientation, unchanged stock slots and connected first layers. The former face-up coupon failed the two logo tests. The updated coupon passes all four. All six assembly meshes retain their original render hashes.

## Reference slicing

Each STL was sliced on its own temporary plate using bundled **P1S / 0.4 mm / Generic PETG** settings: **0.2 mm layers, four walls, six top/bottom layers and 20% gyroid**. Settings were read back from generated G-code. All seven final parts passed without geometry warnings.

**Body and button: normal automatic supports everywhere, including bridges.** The body generates **186 support toolpath sections** and the button **11**. Build-plate-only support is insufficient for the body. The remaining five parts are sliced without supports. Inspect the slicer's support interfaces near the side cradle, ports and acrylic grooves. Slicer success does not establish support removal quality or dimensional fit.

The two [native Bambu project records](profiles/manifest.json) identify the body/button source hashes, embedded reference settings, archive contents and isolated round-trip slices. Both projects generate actual support material when reopened with no external process settings. Their P1S/0.4 mm/PETG/Textured PEI profile is a reference, not a claim about the user's printer. Packaging rejects stale projects, missing support extrusion and sliced G-code payloads.

## Website and packaging checks

The site serves six Blender views (`hero`, `exploded`, `top`, `internals`, `board`, `side`), the enclosure-only GLB, the full model and its selectable catalog. **25/25 real-browser checks pass** for the printability update, covering desktop and mobile print instructions, both native-project download links, all seven 3D modes, part selection/visibility, reset, the board guide and console state. The current [browser record](preview/site/r5/browser-checks.json) includes source hashes. [Desktop print setup](preview/site/r5/print-guide.png), [mobile print setup](preview/site/r5/print-mobile.png) and [updated downloads](preview/site/r5/print-downloads.png) show the reviewed changes. Other screenshots under preview/site are historical R4/R5 captures.

The final regression run passes **53 Python tests**, **5 Node tests** and **33 deployment tests**. This includes temporary native-project fixtures that reject missing presets, sliced G-code, stale coupon evidence and support-enabled projects without actual support extrusion. The two real Bambu round-trip runs also pass; their saved settings and generated material are recorded in [profiles/manifest.json](profiles/manifest.json).

Five dependency-free Node tests exercise the new viewer's pure assembly-state logic. They do not mock DOM/Three or validate WebGL pixels; the actual viewer is checked separately in the browser. HTTP tests use ephemeral servers and temporary files to check GET/HEAD, MIME types, cache bypass, safe mount routing and the old R4 ZIP redirect. The current site's actual assets are also served and checked against their bytes. Package tests use temporary evidence and artifacts to verify stale-input rejection and archive contents.

```sh
python -m unittest discover -s tests -p 'test_*.py'
node --test tests/test_assembly_state.mjs
ruff check tools tests site electronics
ruff format --check tools tests site electronics
npx --yes prettier@3.6.2 --check '*.md' index.html 'site/*.css' 'site/*.js'
```

## Physical checks still required

Print shrink, acrylic fit, key force/stroke/release, screw holding strength, side-board retention, trimmed-lead clearance, purchased battery/module sizes, USB cable engagement, wire insulation and service slack; then the electrical bring-up, charger/protection checks, regulator stability and temperatures specified in [PCB_GUIDE.md](PCB_GUIDE.md).

Smoked-acrylic transmission, colour, output and hotspots remain unknown. The user's stock size is unconfirmed. The default is **104 × 28 × 3 mm cut stock**, and rendered appearance is not photometric or thermal evidence.
