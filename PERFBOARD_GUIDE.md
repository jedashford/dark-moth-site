# Dark Moth — build on isolated-pad perfboard

Use this guide for the green boards with individual solder pads. The [printed-PCB guide](PCB_GUIDE.md) describes a different fabrication method; its copper tracks and hole coordinates do not exist on a blank perfboard.

**Start with one unpowered prototype.** This layout preserves the existing circuit. Its latch current capacity and button-to-ESP startup connection still need qualification before powered batch building. The measurements and reasons are in [the electrical review](PERFBOARD_REVIEW.md).

## 1. Open the hole map and mark your board

[Interactive assembly](perfboard.html) · [Component list](electronics/perfboard-components.csv) · [Wire checklist](electronics/perfboard-connections.csv) · [Layout data](electronics/perfboard-layout.json)

| Reference board | Hole grid                                | Component side                                      | Solder side                                               |
| --------------- | ---------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Power latch     | 26 columns, rows A–R; nominal 70 × 50 mm | [Top drawing](electronics/perfboard-latch-top.svg)  | [Bottom drawing](electronics/perfboard-latch-bottom.svg)  |
| LED driver      | 13 columns, rows A–E; nominal 35 × 15 mm | [Top drawing](electronics/perfboard-driver-top.svg) | [Bottom drawing](electronics/perfboard-driver-bottom.svg) |

These are **reference layouts on a 2.54 mm grid**, not measurements of your boards or a promise of case fit. Dry-fit the actual parts and check usable holes before cutting anything.

1. Disconnect the battery, USB and every external supply. Check the bare board with a meter: neighboring pads must be electrically separate. Some similar-looking boards connect pads in strips or groups; this layout cannot be copied onto those without changes.
2. Choose the component face. Mark **A1** at its upper-left hole; rows run downward, column numbers run rightward. Mark the same physical corner on the back.
3. Turn the board over like a book, keeping row A at the top. A1 is now at the **upper-right**. It is still A1: do not renumber from the back. Use the bottom drawing for soldering.
4. Keep the wire checklist open. Tick off each individual connection after soldering and testing it. A colored line crossing another line in a drawing does not mean they connect.

`LATCH.A1` and `DRIVER.A1` refer to different boards. Hole names describe places; a **net** such as GND names holes that must be electrically joined.

## 2. Gather and identify the parts

| Board         | Parts                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latch         | QP: SS8550 PNP; QL: BS170; Db: 1N4148 diode; Rb: 330 Ω; Rbtn: 1 kΩ; Rbe/Rgl/Rs1/Rs2: four 100 kΩ resistors                                                                                     |
| Driver        | Q1–Q5: five BS170s; Rg1–Rg5: five 100 Ω resistors; Rp1–Rp5: five 10 kΩ resistors                                                                                                               |
| Remote button | One normally-open switch, small insulating board, matched two-pin plug/socket and two-wire cable                                                                                               |
| Modules       | One protected TP4056 charger; one MT3608 boost converter; one ESP32-C3 SuperMini or the supported S3 alternate; 100 mm of the specified 12 V common-positive RGBWW strip; one suitable 1S LiPo |

The resistor reference build uses ¼ W parts. Total discrete parts are **six BS170s, one SS8550, one diode and sixteen resistors**, plus the remote switch. Insulated wire, solder, sleeve/heat-shrink and a meter are also needed. Leave optional battery-sense resistors and ESP GPIO1 unconnected.

Measure resistor values before installing them. Identify each transistor's exact part and its manufacturer's lead diagram. **Do not assume the flat face always gives the same left/middle/right roles.** The hole map specifies E/B/C for QP and D/G/S for each BS170; route the identified legs to those holes. Keep any crossed or extended legs insulated.

## 3. Populate the latch

Use the latch component table in the interactive guide for **both holes of every resistor and diode, and every transistor leg**. Do not use the older PCB's millimetre coordinates.

| Part        | First electrical end        | Other electrical end |
| ----------- | --------------------------- | -------------------- |
| Rb, 330 Ω   | PB                          | LDRV                 |
| Rbtn, 1 kΩ  | GATE                        | BTN_DIO              |
| Rbe, 100 kΩ | OUT+                        | PB                   |
| Rgl, 100 kΩ | GATE                        | GND                  |
| Rs1, 100 kΩ | BTN_N                       | SENSE                |
| Rs2, 100 kΩ | SENSE                       | GND                  |
| Db, 1N4148  | **Stripe/cathode: BTN_DIO** | Anode: BTN_N         |
| QP, SS8550  | Emitter: OUT+; base: PB     | Collector: VSW       |
| QL, BS170   | Drain: LDRV; gate: GATE     | Source: GND          |

1. Fit the six resistors in their listed holes. Resistors have no polarity; their two leads must still occupy the correct pair of holes. Solder and trim while keeping enough lead at each pad to attach its listed wire.
2. Fit Db with its stripe at the listed **K/BTN_DIO** hole. Check it before soldering.
3. Fit QP and QL by their identified leg roles. Form leads gently without forcing the bodies against the board.
4. Add the insulated underside jumpers from the wire checklist, one at a time. Strip only the short ends at the two intended pads. A wire passing a third pad must remain insulated there.
5. Make each GND connection physically join the ground wiring. Nearby ground holes do not join themselves. Check from QL source, Rgl's GND end and Rs2's GND end to the latch ground terminal.
6. Label the external wire positions OUT+, VSW, GND, GATE, SENSE and BTN_N. These labels describe this perfboard's wires; they are not factory printing on the blank board.

The four 100 kΩ resistors do different jobs. Do not replace them with one shared resistor.

## 4. Build the green driver channel first

View the **component side** of the driver board. The first channel uses Q1, Rg1 and Rp1:

| Component  | First leg          | Second leg      | Third leg  |
| ---------- | ------------------ | --------------- | ---------- |
| Q1         | Drain: A2          | Gate: B2        | Source: C2 |
| Rg1, 100 Ω | Body-side lead: D2 | Return lead: D3 | —          |
| Rp1, 10 kΩ | Body-side lead: E3 | Return lead: E2 | —          |

Stand the two resistors upright as shown. Sleeve each long folded return lead so it cannot touch another lead. Transistor lead order is determined by the actual part, not by this table's reading order.

1. Connect ESP green PWM through the harness to **D2**. Current in this control path passes **through Rg1 from D2 to D3**; do not solder a jumper across the resistor.
2. Solder an insulated jumper **D3 → B2**, reaching Q1 gate.
3. Solder **D3 → E3**, reaching Rp1's gate-side lead.
4. Solder **E2 → C2**, joining Rp1's other lead to Q1 source.
5. Join **C2 to the driver ground bus**, which ends at C13. Follow every segment in the wire checklist.
6. Connect the strip's **G** return wire to **A2**, Q1 drain. That drain is a switched return; it must not be permanently wired to ground.

The result is `GPIO → 100 Ω → gate`, with `gate → 10 kΩ → source → GND`. The strip's common positive goes to +12 V; its green return goes to the drain.

## 5. Repeat the remaining four channels

| Channel        | Q drain / gate / source | 100 Ω: body / return | 10 kΩ: body / return | PWM wire | Strip return |
| -------------- | ----------------------- | -------------------- | -------------------- | -------- | ------------ |
| Green, Q1      | A2 / B2 / C2            | D2 / D3              | E3 / E2              | D2       | A2           |
| Red, Q2        | A4 / B4 / C4            | D4 / D5              | E5 / E4              | D4       | A4           |
| Blue, Q3       | A6 / B6 / C6            | D6 / D7              | E7 / E6              | D6       | A6           |
| Warm white, Q4 | A8 / B8 / C8            | D8 / D9              | E9 / E8              | D8       | A8           |
| Cool white, Q5 | A10 / B10 / C10         | D10 / D11            | E11 / E10            | D10      | A10          |

Repeat the green channel's three local jumpers for each pair of columns. Join all five sources, **C2/C4/C6/C8/C10**, to the ground bus and **C13**, using the listed insulated wire segments. Do not try to force five wire ends into one hole.

**What can share:** the ground wire network and the strip's common +12 V supply. **What stays separate:** each channel's drain, gate, 100 Ω series resistor and 10 kΩ pulldown resistor. Sharing one gate resistor or pulldown would connect channels that the ESP must control independently. These resistors control the MOSFETs; they are not the strip's LED current-limiting resistors.

## 6. Make the remote button cable

The button joins **OUT+ to BTN_N while pressed**. Neither of its two wires is GND.

1. Test the loose switch with a meter. Choose two contacts that are open when released and connected only while pressed. Four-leg switches also have permanently connected leg pairs; do not use one of those pairs.
2. Mount the switch on its small board and connect the selected contacts to two wires through a matched, keyed inline plug/socket.
3. At the latch end, connect one wire to the listed OUT+ button terminal and the other to BTN_N. Label both ends; insulate and secure the cable so pulling the plug does not pull a solder joint.
4. Test the unplugged button cable again: open when released, closed when pressed. Check that its movement and actual switch height suit the case before fixing it in place.

## 7. Connect every module

Keep power disconnected while wiring. Use the interactive **terminal/harness table** for the exact latch holes and the strip's actual printed labels for its pads. Do not infer strip-pad order from wire color.

| From                   | To                                    | Purpose                                                          |
| ---------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| Battery positive       | CHG.BAT+                              | Cell charging connection                                         |
| Battery negative       | CHG.BAT−                              | Cell charging connection                                         |
| CHG.OUT+               | Latch OUT+                            | Protected supply into the latch                                  |
| CHG.OUT−               | Latch GND and system ground wiring    | Protected load return                                            |
| Latch VSW              | BOOST.VIN+ **and** ESP.5V/VIN         | Switched power to both modules                                   |
| System GND             | BOOST.VIN−                            | Boost input return                                               |
| System GND             | BOOST.VOUT−                           | Boost output reference; normally common with VIN− on this module |
| System GND             | ESP.GND                               | Logic reference                                                  |
| System GND             | DRIVER.C13                            | LED driver return                                                |
| BOOST.VOUT+            | Strip +12V                            | Regulated LED supply                                             |
| Latch GATE             | ESP latch GPIO from the table below   | Firmware keeps power on                                          |
| Latch SENSE            | ESP button ADC GPIO below             | Firmware reads button presses                                    |
| Latch OUT+             | Button plug → switch contact A        | Remote button supply                                             |
| Latch BTN_N            | Other plug contact → switch contact B | Remote button return signal                                      |
| Driver A2/A4/A6/A8/A10 | Strip G/R/B/WW/CW respectively        | Five independently switched returns                              |

**CHG.BAT− and CHG.OUT− are different connections on the protected charger. Do not bridge them.** The common system ground starts at OUT−. Joining it directly to battery negative bypasses the protection switching.

Use one matching ESP column throughout:

| Signal         | ESP32-C3 GPIO | ESP32-S3 GPIO | Other end   |
| -------------- | ------------- | ------------- | ----------- |
| Latch hold     | 3             | 9             | Latch GATE  |
| Button ADC     | 4             | 8             | Latch SENSE |
| Green PWM      | 5             | 5             | DRIVER.D2   |
| Red PWM        | 6             | 4             | DRIVER.D4   |
| Blue PWM       | 7             | 6             | DRIVER.D6   |
| Warm-white PWM | 10            | 10            | DRIVER.D8   |
| Cool-white PWM | 20            | 11            | DRIVER.D10  |

Keep supply and ground wires short, with enough capacity for the measured load. Do not carry LED power through the small button cable. Keep the 12 V rail away from all ESP and latch terminals. Never connect the cell directly to ESP.3V3. Identify the actual board's regulator before approving its VSW-to-VIN connection.

## 8. Check one build before copying it

1. **Check every wire unpowered.** Probe the two endpoints in each wire-checklist row: they should have direct continuity. Inspect neighboring pads for solder bridges. For paths through resistors, use resistance mode; a 100 Ω resistor is not a direct wire and may or may not trigger a meter's beeper.
2. Check all five source legs and all five pulldown ground ends reach C13. Check C13 reaches CHG.OUT−. Check each gate reaches only its own gate wiring, and that no drain has a soldered ground bypass. Semiconductor readings depend on probe direction, so do not expect every unrelated node to read infinite resistance.
3. Check Db's stripe, all transistor leg roles, the remote plug, and the two separate charger negative connections against the drawings. Photograph both sides while every joint is visible.
4. Flash the [supplied R5 firmware](electronics/dark-moth-r5-firmware.zip) for the chosen ESP, with the external power harness disconnected. It uses ADC button sensing; battery telemetry stays disabled.
5. Qualify **one powered prototype** using the [staged measurement checklist](PERFBOARD_REVIEW.md#qualify-one-prototype). First test latch and ESP, then the boost set to 12.0 V, then individual LED channels and the combined load. Hold the button through cold boot; shutdown completes after a long hold is released.
6. Copy the checked build only after its actual parts, cold start, load current and temperatures pass that review. Check each new board's wiring before applying power. Measure the finished assembly and insulate its underside before deciding how it fits the case.
