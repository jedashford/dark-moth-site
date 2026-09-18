# Perfboard guide verification

The new guide transfers the existing circuit onto **reference isolated-pad perfboards**. It changes no firmware, component value, enclosure mesh or inherited electrical connection. The 70 × 50 mm latch layout is a bench reference; the 35 × 15 mm driver preserves its earlier hole layout. Actual blank boards and transistor packages remain unmeasured.

## Viewer navigation and complete electronics

The workbench now starts with the original complete electronics assembly: 101 supported modeled parts, including PCB, ESP controller, charger, boost converter, battery, LED strip, remote switch, wiring, connectors and fasteners. Individual views isolate the main PCB (11 parts) or a module with its modeled packages. The perfboard latch replaces the original manufactured PCB; both are reference alternatives, not simultaneous required assemblies.

The previous viewer attached its view-button click handler to the canvas container as well. A click after a drag reset the camera. A real Chromium pointer test reproduced a 1.7063-radian (97.8°) orientation change on release. Handlers now target buttons only. Official Three r128 TrackballControls replaces OrbitControls in this workbench, allowing full rotation past the poles and stopping immediately on release. Component-side and solder-side presets remain deliberately fixed; choose 3D to rotate freely.

Real input tests exercise repeated vertical rotation through a full revolution, release stability, click versus drag, preset locking, pan and zoom. The overview adapter tests the actual GLB inventory, module membership, preserved relative geometry and independent resource disposal. Browser tests cover all module choices, part inspection, switching back to both perfboards, mobile layout, and model-load failure/retry.

## Checks

- `test_perfboard_layout.py` compares all nine latch components with the corrected PCB pads, all fifteen driver components with the existing driver layout, both ESP GPIO maps and all module connections. It traverses the actual jumper graph for every net, checks hole ownership and geometry bounds, and rejects cross-net joins. Horizontal latch resistors have at least 10.16 mm between lead holes. Body envelopes are nominal.
- `test_perfboard_worksheets.py` checks mirrored X coordinates with stable hole identity and transfers every component leg, jumper and terminal into the printable/CSV records. A bottom view is a physical flip, with A1 at the right.
- The Node state and geometry tests cover cumulative assembly steps, independent channel nets, actual vendored Three.js geometry, holes, lead endpoints, selection and camera behavior.
- The [real-browser record](preview/site/perfboard/browser-checks.json) records its run time, checks and source hashes. Playwright launches Chromium against its own temporary HTTP server. It exercises both boards, every component/wire step, both ESP choices, shared ground, independent gates, desktop/mobile layouts, the WebGL fallback, downloads and all existing whole-device modes.
- Python release tests reject stale geometry, slicing, support, render and browser evidence. Existing mechanical evidence is reused only while its source hashes still match. The new complete pack includes the perfboard guide and worksheets.

Screenshots: [all electronics](preview/site/perfboard/system.png), [main PCB](preview/site/perfboard/main-pcb.png), [ESP controller](preview/site/perfboard/controller.png), [free rotation](preview/site/perfboard/navigation.png), [driver in 3D](preview/site/perfboard/driver-3d.png), [shared ground underneath](preview/site/perfboard/driver-ground-bottom.png), [latch diode](preview/site/perfboard/latch-top.png), [latch ground](preview/site/perfboard/latch-ground-bottom.png), [mobile](preview/site/perfboard/mobile.png).

## Reproduce from the enclosure directory

```sh
python3 tools/build_perfboard_layout.py
python3 tools/build_perfboard_worksheets.py
python3 tools/build_guide.py
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/test_assembly_state.mjs tests/test_perfboard_state.mjs tests/test_perfboard_geometry.mjs tests/test_perfboard_controls.mjs tests/test_electronics_overview.mjs
node tests/test_perfboard_browser.mjs
python3 tools/package.py
```

Install Python dependencies from `tools/requirements.txt`. The browser test requires Playwright and its Chromium browser; it was run with Playwright 1.63.0. `PLAYWRIGHT_MODULE` can point to an existing installed Playwright package. It starts and closes a separate HTTP server on an ephemeral localhost port, and does not use a printer, physical controller, dev server or production website.

Generated HTML and the compact layout JSON are excluded from Prettier: format their source templates and generators instead. Their generated contents are checked by the tests. Run ESLint with `site/eslint.config.mjs`, Ruff for changed Python, and Prettier for handwritten HTML/CSS/JS/Markdown/YAML.

## Limits that remain

This is a verified digital instruction set, **not a physically qualified board design**. No soldering, resistance measurement, cold-start test, thermal test or case mounting trial has been performed. Transistor lead routes are schematic role mappings, not universal flat-face pin order. Wire paths and solder joints are illustrative, not measured harness lengths or a wire-gauge approval.

Read [the electrical review](PERFBOARD_REVIEW.md) before powered batch building. The latch's current margin, unpowered GPIO behavior, ESP regulator headroom and BS170 gate drive need qualification using the actual parts. Confirm isolated pads, available rows/columns, controller model and manufacturer pinouts before copying the hole coordinates onto physical boards.
