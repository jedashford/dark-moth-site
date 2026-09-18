# Perfboard guide verification

## Integrated carrier revision

The default workbench now presents `carrier-2026-09`: one **18-column × 24-row (A–X)** isolated-pad board. It carries all 24 latch/driver parts and the nominal mounting zones for ESP, protected TP4056 and MT3608. It replaces the old manufactured latch PCB and separate driver; the old R5 case model remains explicitly an earlier reference.

The carrier data preserves the circuit roles, resistor values, both GPIO maps, 13 retained-leg routes, 15 insulated driver links and one ground-bus conductor. Fourteen separate module pigtails map real carrier holes to printed module roles. Detailed purchased-module meshes are cloned from the existing GLB; dashed callouts terminate at logical labels, never invented header pins. The larger S3 envelope is reserved, but the detailed controller model is C3.

`test_perfboard_carrier.py` checks nominal body margins/separation, unique holes, shared ground, GPIO and power/protection roles. `test_perfboard_carrier.mjs` tests actual GLB module membership, placement/rotation, 142 detailed module meshes, callout endpoints and failure disposal. State tests cover the 73 cumulative assembly steps. The separate carrier worksheets keep the tall A–X grid and complete terminal table within A3 pages. [Carrier instructions](CARRIER_GUIDE.md) use the same exact coordinates; all 55 component pins, 13 retained routes, 15 driver links and 14 module wires were independently compared with generated data.

The 10 mm ESP riser is provisional: actual USB plug clearance, antenna keepout, supplier header layouts and support hardware are unmeasured. Nominal spacing does not establish a buildable mounting fixture or case fit. The previous R5 enclosure mounting height cannot be carried over without checking the taller assembly. No physical/powered qualification is claimed.

## Earlier layouts

The guide transfers the existing circuit onto **reference isolated-pad perfboards**. Revision `compact-2026-09` uses a combined 24-column × 10-row board, with a compact 11 × 10 latch option and the unchanged separate driver. The grid follows an older stock description of 10 × 24 holes, rotated to the current row-letter convention. Actual blank dimensions and parts remain unmeasured.

The latch now uses thirteen retained component leads and one dedicated ground conductor. The combined board shares that conductor with the five-channel driver and keeps fifteen insulated channel links. No resistor value, electrical net role, firmware, enclosure mesh or power path changed.

## Compact layout checks

- Compare all 24 component values and 55 leg roles with the corrected PCB and existing driver source. Preserve both ESP GPIO maps. The combined board removes only the now-internal latch-to-driver ground cable terminals.
- Traverse every explicit joined pad, including intermediate solder junctions; require each net to remain connected and separate from every other net. Bare routes may touch only pads declared on their net. Intentional three-leg joints are allowed at D3 and D8.
- Check unique inserted component holes, nominal body separation and board-edge margins, bare-lead clearance from unrelated occupied pads/leads, and the retained-tail allowance. These checks use reference dimensions and do not prove physical solder clearance or purchased-part pin order.
- Display retained leads as metal continuous with their source leg, and keep remaining links insulated. Place/trim instructions reserve each required lead before its bending step. Group ground-bus segments as one physical wire in counts and assembly steps.
- Match every component leg and soldered pad across the interactive model, printable top/bottom worksheets, CSV and instructions. Reverse the bottom drawing without changing hole names; derive reversed resistor/diode body entry points from actual hole coordinates.

## Viewer navigation and complete electronics

The earlier-system option retains the original complete electronics assembly: 101 supported modeled parts, including PCB, ESP controller, charger, boost converter, battery, LED strip, remote switch, wiring, connectors and fasteners. Individual views isolate the main PCB (11 parts) or a module with its modeled packages. The perfboard latch replaces the original manufactured PCB; both are reference alternatives, not simultaneous required assemblies.

The previous viewer attached its view-button click handler to the canvas container as well. A click after a drag reset the camera. A real Chromium pointer test reproduced a 1.7063-radian (97.8°) orientation change on release. Handlers now target buttons only. Official Three r128 TrackballControls replaces OrbitControls in this workbench, allowing full rotation past the poles and stopping immediately on release. Component-side and solder-side presets remain deliberately fixed; choose 3D to rotate freely.

Real input tests exercise repeated vertical rotation through a full revolution, release stability, click versus drag, preset locking, pan and zoom. The overview adapter tests the actual GLB inventory, module membership, preserved relative geometry and independent resource disposal. Browser tests cover all module choices, part inspection, switching between all four perfboard layouts, mobile layout, and model-load failure/retry.

## Checks

- `test_perfboard_layout.py` compares all nine latch components with the corrected PCB pads, all fifteen driver components with the existing driver layout, both ESP GPIO maps and all module connections. It traverses the actual jumper graph for every net, checks hole ownership and geometry bounds, and rejects cross-net joins. Horizontal latch resistors have 10.16 mm between lead holes; Rbe and Rgl are upright. Body envelopes are nominal.
- `test_perfboard_worksheets.py` checks mirrored X coordinates with stable hole identity and transfers every component leg, jumper and terminal into the printable/CSV records. A bottom view is a physical flip, with A1 at the right.
- The Node state and geometry tests cover cumulative assembly steps, independent channel nets, actual vendored Three.js geometry, holes, lead endpoints, selection and camera behavior.
- The [real-browser record](preview/site/perfboard/browser-checks.json) records its run time, checks and source hashes. Playwright launches Chromium against its own temporary HTTP server. It exercises all four layouts, every component/conductor step, retained-lead warnings, reused-lead versus added-wire counts, explicit intermediate joints, both ESP choices, shared ground, independent gates, desktop/mobile layouts, loading recovery, downloads and all existing whole-device modes.
- Python release tests reject stale geometry, slicing, support, render and browser evidence. Existing mechanical evidence is reused only while its source hashes still match. The new complete pack includes the perfboard guide and worksheets.

Screenshots: [combined component side](preview/site/perfboard/combined-top.png), [combined ground underneath](preview/site/perfboard/combined-ground-bottom.png), [all electronics](preview/site/perfboard/system.png), [main PCB](preview/site/perfboard/main-pcb.png), [ESP controller](preview/site/perfboard/controller.png), [free rotation](preview/site/perfboard/navigation.png), [driver in 3D](preview/site/perfboard/driver-3d.png), [shared ground underneath](preview/site/perfboard/driver-ground-bottom.png), [latch diode](preview/site/perfboard/latch-top.png), [latch ground](preview/site/perfboard/latch-ground-bottom.png), [mobile](preview/site/perfboard/mobile.png).

## Reproduce from the enclosure directory

```sh
python3 tools/build_perfboard_layout.py
python3 tools/build_perfboard_worksheets.py
python3 tools/build_guide.py
python3 -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/test_perfboard_carrier.mjs tests/test_assembly_state.mjs tests/test_perfboard_state.mjs tests/test_perfboard_geometry.mjs tests/test_perfboard_connections.mjs tests/test_perfboard_controls.mjs tests/test_electronics_overview.mjs
node tests/test_perfboard_browser.mjs
python3 tools/package.py
```

Install Python dependencies from `tools/requirements.txt`. The browser test requires Playwright and its Chromium browser; it was run with Playwright 1.63.0. `PLAYWRIGHT_MODULE` can point to an existing installed Playwright package. It starts and closes a separate HTTP server on an ephemeral localhost port, and does not use a printer, physical controller, dev server or production website.

Generated HTML and the compact layout JSON are excluded from Prettier: format their source templates and generators instead. Their generated contents are checked by the tests. Run ESLint with `site/eslint.config.mjs`, Ruff for changed Python, and Prettier for handwritten HTML/CSS/JS/Markdown/YAML.

## Limits that remain

This is a verified digital instruction set, **not a physically qualified board design**. No soldering, resistance measurement, cold-start test, thermal test or case mounting trial has been performed. Transistor lead routes are schematic role mappings, not universal flat-face pin order. Wire paths and solder joints are illustrative, not measured harness lengths or a wire-gauge approval.

Read [the electrical review](PERFBOARD_REVIEW.md) before powered batch building. The latch's current margin, unpowered GPIO behavior, ESP regulator headroom and BS170 gate drive need qualification using the actual parts. Confirm isolated pads, available rows/columns, controller model and manufacturer pinouts before copying the hole coordinates onto physical boards.
