# Dark Moth — fewer wires, one shared perfboard

The **combined board** puts the nine power/button-latch parts and fifteen LED-driver parts on one blank green board. The latch uses **13 existing component leads as connections**. The complete combined board needs **15 insulated links and one ground-bus wire**, plus the external cables to the other modules.

The layout keeps the existing circuit, resistor values and GPIO assignments. It does not combine resistors that do different jobs. The ESP, charger, boost converter, battery, LED strip and remote button remain separate modules.

**Layout revision: compact-2026-09.** These latch coordinates replace the previous 70 × 50 mm reference. Do not mix the old latch drawing with these instructions. Build one unpowered prototype first; the existing electrical limits in [the review](PERFBOARD_REVIEW.md) still need qualification before powered batch building.

## 1. Choose a board and mark its holes

[Combined board in 3D](perfboard.html?board=combined#workbench) · [Component list](electronics/perfboard-components.csv) · [Connection checklist](electronics/perfboard-connections.csv) · [Layout data](electronics/perfboard-layout.json)

| Layout                      | Hole grid                                         | Component side                                        | Solder side                                                 |
| --------------------------- | ------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| **Combined latch + driver** | 24 columns, rows A–J                              | [Top drawing](electronics/perfboard-combined-top.svg) | [Bottom drawing](electronics/perfboard-combined-bottom.svg) |
| Compact latch only          | 11 columns, rows A–J                              | [Top drawing](electronics/perfboard-latch-top.svg)    | [Bottom drawing](electronics/perfboard-latch-bottom.svg)    |
| Separate LED driver         | 13 columns, rows A–E; previous driver coordinates | [Top drawing](electronics/perfboard-driver-top.svg)   | [Bottom drawing](electronics/perfboard-driver-bottom.svg)   |

Older project notes describe **10 × 24 hole blanks**. The combined reference uses that grid with the long edge horizontal: **A–J are rows; 1–24 are columns**. This is a documented starting assumption, not a measurement of the board in your hand. At 2.54 mm pitch, the outer hole centers span 58.42 × 22.86 mm; the actual board needs its own edge margins. The latch alone spans 25.40 × 22.86 mm between outer hole centers. Case mounting remains unverified.

1. Disconnect battery, USB and every supply. Check the blank with a meter: neighboring pads must be separate. Connected strips or groups need a different layout.
2. On the component face, mark **A1 at the upper-left hole**. Letters run downward; numbers run rightward. Mark that same physical corner underneath.
3. Flip the board like a book, keeping row A at the top. A1 is now **upper-right**. Never renumber from the back; use the solder-side drawing.
4. Choose one layout throughout. The combined board contains both circuits; do not also build the two separate boards. Combined latch holes match the compact latch; combined driver columns are the separate driver's columns **plus 11**.
5. Dry-fit the actual bodies and identify transistor pin roles before soldering. The models use nominal package dimensions and formed leads; they do not establish your manufacturer's left/middle/right pin order.

## 2. Gather the parts and keep the useful leads

| Circuit           | Parts                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latch             | QP: SS8550 PNP; QL: BS170; Db: 1N4148; Rb: 330 Ω; Rbtn: 1 kΩ; Rbe/Rgl/Rs1/Rs2: four 100 kΩ resistors                                                  |
| Five LED channels | Q1–Q5: five BS170s; Rg1–Rg5: five 100 Ω resistors; Rp1–Rp5: five 10 kΩ resistors                                                                      |
| Remote button     | One normally-open momentary switch, small insulating board, matched two-pin plug/socket and two-wire cable                                            |
| Other modules     | Protected TP4056 charger, MT3608 boost, ESP32-C3 SuperMini or supported S3 alternate, specified 12 V common-positive RGBWW strip and suitable 1S LiPo |

That is **six BS170s, one SS8550, one diode and sixteen resistors**, plus the switch and modules. The reference resistor bodies are ¼ W. Measure their values. Leave optional battery-sense resistors and ESP GPIO1 unconnected.

**Do not trim the 13 source leads listed in section 3.** Each becomes a connection underneath the board. Every inserted leg still gets its own hole; a shared joint is made by laying one retained lead against another lead/pad and soldering them together. Do not force multiple inserted legs into a small hole.

The longest retained-lead route is 7.62 mm. Allow approximately another 2 mm of usable tail below the seated board for forming and solder overlap; this is a design allowance, not a measured lead guarantee. If a lead is too short or too stiff, use a short insulated link on the same named route. Do not stretch a lead or repeatedly bend it at the package.

## 3. Build the compact latch with direct lead joints

These coordinates are the same on the compact latch and combined board. Identify E/B/C or D/G/S from the actual manufacturer's diagram. Form and insulate any crossed package leads above the board.

| Part        | Exact holes and electrical roles                | Mounting            |
| ----------- | ----------------------------------------------- | ------------------- |
| QP, SS8550  | E: **B2** OUT+; B: **B3** PB; C: **B4** VSW     | Formed TO-92 leads  |
| QL, BS170   | D: **B7** LDRV; G: **B8** GATE; S: **B9** GND   | Formed TO-92 leads  |
| Rbe, 100 kΩ | D1 OUT+ → D2 PB                                 | Upright, body at D1 |
| Rb, 330 Ω   | D3 PB → D7 LDRV                                 | Horizontal          |
| Rgl, 100 kΩ | D8 GATE → D9 GND                                | Upright, body at D8 |
| Rbtn, 1 kΩ  | F8 GATE → F4 BTN_DIO                            | Horizontal          |
| Db, 1N4148  | **Striped K: H5 BTN_DIO**; unbanded A: H1 BTN_N | Horizontal          |
| Rs1, 100 kΩ | J1 BTN_N → J5 SENSE                             | Horizontal          |
| Rs2, 100 kΩ | J7 SENSE → J11 GND                              | Horizontal          |

Horizontal parts use a 10.16 mm hole spacing. Upright Rbe and Rgl use adjacent holes; sleeve their long folded return leads above the board. Check actual body clearance, especially around adjacent parts, before soldering.

Place and solder the parts while retaining the source leads below. Then flip to the solder-side view. Bend **one existing leg per row** and solder at **every named pad** along its route. These are bare-metal connections; all traversed pads are deliberately assigned to the same net.

| Retain this existing lead | Solder-side route | Net     |
| ------------------------- | ----------------- | ------- |
| Rbe end 1, at D1          | D1 → C1 → C2 → B2 | OUT+    |
| QP emitter, at B2         | B2 → A2 → A1      | OUT+    |
| Rbe end 2, at D2          | D2 → D3           | PB      |
| QP base, at B3            | B3 → C3 → D3      | PB      |
| QP collector, at B4       | B4 → A4 → A5      | VSW     |
| Rb end 2, at D7           | D7 → C7 → B7      | LDRV    |
| QL gate, at B8            | B8 → C8 → D8      | GATE    |
| Rbtn end 1, at F8         | F8 → E8 → D8      | GATE    |
| QL source, at B9          | B9 → C9 → D9      | GND     |
| Rgl end 2, at D9          | D9 → D10 → D11    | GND     |
| Rbtn end 2, at F4         | F4 → G4 → G5 → H5 | BTN_DIO |
| Db anode, at H1           | H1 → I1 → J1      | BTN_N   |
| Rs1 end 2, at J5          | J5 → J6 → J7      | SENSE   |

For example, **D3 joins three legs**: Rb end 1 is inserted there; QP base and Rbe end 2 bend to it underneath. **D8 joins Rgl end 1, QL gate and Rbtn end 1.** These are intended shared junctions. The resistors themselves still sit between different nets; never add a bridge across a resistor body.

Add one dedicated ground conductor:

- **Combined:** route one insulated wire J11 → C11 → C24. Strip solder windows only at **J11, H11, G11, F11, E11, D11, C13, C15, C17, C19, C21 and C24**. The five driver sources join at C13/C15/C17/C19/C21. Keep the span at I11, the corner at C11 and all other intervening pads insulated; those are not joints.
- **Latch alone:** route one insulated wire D11 → J11. Strip solder windows at **D11, E11, F11, G11, H11, I11 and J11**. I11 is the outgoing ground connection to the separate driver.

Use the selected drawing's ground-bus route and soldered taps. The bus carries the system return current; size its conductor for the measured load. Do not send boost/LED return current through a thin resistor lead. Insulate the other wires where they cross the bus. The 13 lead joints replace the previous latch's 23 individually cut jumpers; the bus remains a separate conductor.

## 4. Build the green LED channel

The combined layout moves the existing driver eleven columns to the right. The following table shows both choices explicitly:

| Component leg             | Combined board  | Separate driver |
| ------------------------- | --------------- | --------------- |
| Q1 drain / gate / source  | A13 / B13 / C13 | A2 / B2 / C2    |
| Rg1, 100 Ω: body / return | D13 / D14       | D2 / D3         |
| Rp1, 10 kΩ: body / return | E14 / E13       | E3 / E2         |

Stand both resistors upright and sleeve their folded return leads. For the **combined** board:

1. The ESP green PWM wire attaches at **D13**. Its signal passes **through Rg1 to D14**.
2. Add an insulated link **D14 → B13** to Q1 gate.
3. Add an insulated link **D14 → E14** to Rp1's gate-side end.
4. Add an insulated link **E13 → C13** from Rp1's other end to Q1 source.
5. Q1 source at C13 joins the shared ground bus. Attach the strip's **G** return to **A13**, the drain.

Use the separate driver's corresponding holes if you chose that board. Keep these three links insulated: the gate path crosses the ground-bus row, and the source-to-pulldown path passes the PWM pad. Replacing them with bare straight leads would create shorts.

The circuit is `GPIO → 100 Ω → gate`, with `gate → 10 kΩ → source → GND`. The strip's common positive connects to +12 V; its channel return connects to the drain.

## 5. Repeat the other four channels

| Channel        | Combined Q drain / gate / source | Combined 100 Ω body / return | Combined 10 kΩ body / return | Separate Q drain / gate / source |
| -------------- | -------------------------------- | ---------------------------- | ---------------------------- | -------------------------------- |
| Green, Q1      | A13 / B13 / C13                  | D13 / D14                    | E14 / E13                    | A2 / B2 / C2                     |
| Red, Q2        | A15 / B15 / C15                  | D15 / D16                    | E16 / E15                    | A4 / B4 / C4                     |
| Blue, Q3       | A17 / B17 / C17                  | D17 / D18                    | E18 / E17                    | A6 / B6 / C6                     |
| Warm white, Q4 | A19 / B19 / C19                  | D19 / D20                    | E20 / E19                    | A8 / B8 / C8                     |
| Cool white, Q5 | A21 / B21 / C21                  | D21 / D22                    | E22 / E21                    | A10 / B10 / C10                  |

Each channel gets the same three insulated links. That makes **15 separate links for five channels**. On the separate driver, one ground wire visits C2/C4/C6/C8/C10/C13; its five drawn segments are **one physical wire**. On the combined board, use the shared row-C bus from section 3 instead.

**Share the ground network, not the channel resistors.** Each channel keeps its own gate, drain, 100 Ω resistor and 10 kΩ pulldown. One shared resistor would join signals that the ESP needs to control independently. These are MOSFET control resistors, not LED current-limiting resistors.

## 6. Make the remote button cable

The button connects **OUT+ to BTN_N while pressed**. Neither button wire is ground.

1. Use a meter to find two contacts open when released and connected when pressed. Four-leg switches have permanently joined pairs; do not select one of those pairs.
2. Mount the switch on its small board. Connect those contacts through the matched two-pin plug/socket and two insulated wires.
3. Connect the board end to **A2 (OUT+)** and **H1 (BTN_N)** on either compact latch or combined board. Secure and insulate the cable so unplugging it cannot pull a solder joint.
4. Test the unplugged cable again, then check the switch's travel and height in the case.

## 7. Connect every module

Use the selected layout's **external wire table** for all holes. The combined board has no cable between a latch board and driver board: its shared bus makes that connection internally. Battery and boost-to-strip wires still bypass the perfboard as listed below.

| From                         | To                        | Purpose                                                          |
| ---------------------------- | ------------------------- | ---------------------------------------------------------------- |
| Battery positive             | CHG.BAT+                  | Cell charging connection                                         |
| Battery negative             | CHG.BAT−                  | Cell charging connection                                         |
| CHG.OUT+                     | A1 OUT+                   | Protected supply into latch                                      |
| CHG.OUT−                     | E11 GND                   | Protected system return                                          |
| A4 VSW                       | BOOST.VIN+                | Switched boost power                                             |
| A5 VSW                       | ESP.5V/VIN                | Switched controller power                                        |
| F11 GND                      | ESP.GND                   | Controller return                                                |
| G11 GND                      | BOOST.VIN−                | Boost input return                                               |
| H11 GND                      | BOOST.VOUT−               | Boost output reference; normally common with VIN− on this module |
| BOOST.VOUT+                  | Strip +12V                | Regulated LED supply, separate from the latch                    |
| B8 GATE                      | ESP latch GPIO below      | Firmware keeps power on                                          |
| J7 SENSE                     | ESP button ADC GPIO below | Button sensing                                                   |
| A2 OUT+                      | Button plug → contact A   | Remote switch supply                                             |
| H1 BTN_N                     | Button plug → contact B   | Remote switch return signal                                      |
| Combined A13/A15/A17/A19/A21 | Strip G/R/B/WW/CW         | Five independent switched returns                                |
| Latch-only I11               | Separate driver C13       | Needed only when using two separate boards                       |

**CHG.BAT− and CHG.OUT− must stay separate on the protected charger.** System ground begins at OUT−. Bridging it directly to battery negative bypasses protection switching.

Use one matching ESP column for the entire build:

| Signal         | ESP32-C3 GPIO | ESP32-S3 GPIO | Combined hole | Separate-board hole |
| -------------- | ------------- | ------------- | ------------- | ------------------- |
| Latch hold     | 3             | 9             | B8            | Latch B8            |
| Button ADC     | 4             | 8             | J7            | Latch J7            |
| Green PWM      | 5             | 5             | D13           | Driver D2           |
| Red PWM        | 6             | 4             | D15           | Driver D4           |
| Blue PWM       | 7             | 6             | D17           | Driver D6           |
| Warm-white PWM | 10            | 10            | D19           | Driver D8           |
| Cool-white PWM | 20            | 11            | D21           | Driver D10          |

Keep power wiring short and sized for the actual measured load. Keep 12 V away from ESP and latch terminals. Do not carry LED current through the button cable or a resistor lead. Never connect the cell directly to ESP.3V3; identify the actual regulator before approving VSW at its VIN input.

## 8. Check one build before making copies

1. **Unpowered, check every named joint.** Probe every pad listed for each retained lead or bus: they must have direct continuity. For insulated links, probe both ends. Inspect neighboring pads and crossings for accidental solder bridges.
2. Check all driver sources and pulldown ground ends reach the dedicated ground bus and CHG.OUT−. Check each gate stays on its own channel. No drain should have a soldered bypass to ground. Through a resistor, use resistance mode rather than assuming a continuity beeper means a direct wire.
3. Confirm Db's stripe, transistor roles, retained-lead lengths, shared joints D3/D8/D9, the remote switch and the two separate charger negative connections. Photograph both sides with all joints visible.
4. Flash the [supplied firmware](electronics/dark-moth-r5-firmware.zip) for the chosen ESP with the external power harness disconnected. It uses ADC button sensing and leaves battery telemetry disabled.
5. Qualify **one powered prototype** using the [measurement sequence](PERFBOARD_REVIEW.md#qualify-one-prototype): latch/controller first, then boost set to 12.0 V, then individual LED channels and total load. Hold the button through cold boot; shutdown finishes after a long hold is released.
6. Copy the build only after its actual parts, cold start, current and temperatures pass that review. Measure the finished board and insulate its underside before deciding how to mount it in the case.
