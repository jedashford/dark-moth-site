# One carrier: 18 columns × 24 rows (A–X)

This replaces the mostly empty 94 × 60 mm manufactured latch PCB and the separate LED-driver board. Mount **one ESP controller, one protected TP4056 charger and one MT3608 boost module** on the same blank perfboard as **24 individual latch/driver components**. Battery, LED strip and remote button connect by cables.

**Revision carrier-2026-09.** These coordinates are different from every earlier layout. Use only the carrier drawings with this guide.

[Interactive carrier](perfboard.html?board=carrier#workbench) · [Component-side map](electronics/perfboard-carrier-top.svg) · [Mirrored solder-side map](electronics/perfboard-carrier-bottom.svg) · [Module placement and wiring](electronics/perfboard-carrier-modules.svg)

## Before cutting or soldering

A–X means 24 lettered rows. Number the other direction 1–18. Viewed from the component side, A1 is upper-left; flip left-to-right and A1 becomes upper-right on the solder side. Both drawings preserve these same physical hole names. This design assumes **2.54 mm pitch and isolated pads**; check your actual board with a meter. Stripboard needs a different layout.

The modeled carrier is about **47.8 × 63.0 mm** including nominal margins. Check the actual board edges. Lay the parts out loose first. The purchased-module dimensions and pin positions have not been measured: this is a nominal placement proposal, not a physically qualified assembly. The old R5 case, mounts and print pack remain an earlier reference; this taller carrier has not been fitted into that case.

## 1. Place the 24 individual components

Identify transistor E/B/C or D/G/S from the actual part manufacturer's drawing. The illustrated pin roles do not establish a supplier's physical leg order. Form and sleeve crossed legs above the board. Put only one component leg through each assigned hole. Additional joints are lap-soldered underneath; do not force several legs into one hole.

Keep the latch leads long until their direct joints in section 2 are formed. Upright resistors need insulation on their long folded return legs. Each LED channel keeps its own 100 Ω gate resistor and 10 kΩ gate pulldown.

| Part | Value  | Exact hole: leg / net                                       |
| ---- | ------ | ----------------------------------------------------------- |
| QP   | SS8550 | **P2**: E / OUT+; **P3**: B / PB; **P4**: C / VSW           |
| QL   | BS170  | **P7**: D / LDRV; **P8**: G / GATE; **P9**: S / GND         |
| Rbe  | 100k   | **R1**: 1 / OUT+; **R2**: 2 / PB                            |
| Rb   | 330    | **R3**: 1 / PB; **R7**: 2 / LDRV                            |
| Rgl  | 100k   | **R8**: 1 / GATE; **R9**: 2 / GND                           |
| Rbtn | 1k     | **T8**: 1 / GATE; **T4**: 2 / BTN_DIO                       |
| Db   | 1N4148 | **V5**: K / BTN_DIO; **V1**: A / BTN_N                      |
| Rs1  | 100k   | **X1**: 1 / BTN_N; **X5**: 2 / SENSE                        |
| Rs2  | 100k   | **X7**: 1 / SENSE; **X11**: 2 / GND                         |
| Q1   | BS170  | **C12**: D / LED_G; **C13**: G / GATE_G; **C14**: S / GND   |
| Rg1  | 100    | **A12**: a / PWM_G; **B12**: b / GATE_G                     |
| Rp1  | 10k    | **A14**: a / GATE_G; **B14**: b / GND                       |
| Q2   | BS170  | **C16**: D / LED_R; **C17**: G / GATE_R; **C18**: S / GND   |
| Rg2  | 100    | **A16**: a / PWM_R; **B16**: b / GATE_R                     |
| Rp2  | 10k    | **A18**: a / GATE_R; **B18**: b / GND                       |
| Q3   | BS170  | **E12**: D / LED_B; **E13**: G / GATE_B; **E14**: S / GND   |
| Rg3  | 100    | **C15**: a / PWM_B; **D15**: b / GATE_B                     |
| Rp3  | 10k    | **E15**: a / GATE_B; **F15**: b / GND                       |
| Q4   | BS170  | **E16**: D / LED_WW; **E17**: G / GATE_WW; **E18**: S / GND |
| Rg4  | 100    | **G15**: a / PWM_WW; **H15**: b / GATE_WW                   |
| Rp4  | 10k    | **G17**: a / GATE_WW; **H17**: b / GND                      |
| Q5   | BS170  | **G12**: D / LED_CW; **G13**: G / GATE_CW; **G14**: S / GND |
| Rg5  | 100    | **I15**: a / PWM_CW; **I14**: b / GATE_CW                   |
| Rp5  | 10k    | **I17**: a / GATE_CW; **I18**: b / GND                      |

## 2. Reuse the latch legs underneath

Bend the named source leg along its route and solder at every listed hole. All points in each row join the same net. Keep these bare routes separate from other nets. The layout includes 2 mm allowance beyond the routed span for a solder overlap; confirm actual usable lead length. If a lead is too short, replace that route with insulated wire.

| Retained conductor       | Solder every listed pad | Net     |
| ------------------------ | ----------------------- | ------- |
| carrier-L01 (Rbe leg 1)  | R1 → Q1 → Q2 → P2       | OUT+    |
| carrier-L02 (QP leg E)   | P2 → O2 → O1            | OUT+    |
| carrier-L03 (Rbe leg 2)  | R2 → R3                 | PB      |
| carrier-L04 (QP leg B)   | P3 → Q3 → R3            | PB      |
| carrier-L05 (QP leg C)   | P4 → O4 → O5            | VSW     |
| carrier-L06 (Rb leg 2)   | R7 → Q7 → P7            | LDRV    |
| carrier-L07 (QL leg G)   | P8 → Q8 → R8            | GATE    |
| carrier-L08 (Rbtn leg 1) | T8 → S8 → R8            | GATE    |
| carrier-L09 (QL leg S)   | P9 → Q9 → R9            | GND     |
| carrier-L10 (Rgl leg 2)  | R9 → R10 → R11          | GND     |
| carrier-L11 (Rbtn leg 2) | T4 → U4 → U5 → V5       | BTN_DIO |
| carrier-L12 (Db leg A)   | V1 → W1 → X1            | BTN_N   |
| carrier-L13 (Rs1 leg 2)  | X5 → X6 → X7            | SENSE   |

A shared junction connects only the named net. For example **R3** joins Rb end 1, Rbe end 2 and QP base; **R8** joins Rgl end 1, QL gate and Rbtn end 1. Do not bypass any resistor or diode body.

## 3. Add the driver links and one shared ground bus

The driver needs these 15 short insulated links. Crossings are insulated and do not connect. Strip only each end.

| Link               | From → to | Net     |
| ------------------ | --------- | ------- |
| carrier-driver-J01 | C13 → B12 | GATE_G  |
| carrier-driver-J02 | B12 → A14 | GATE_G  |
| carrier-driver-J03 | C14 → B14 | GND     |
| carrier-driver-J04 | C17 → B16 | GATE_R  |
| carrier-driver-J05 | B16 → A18 | GATE_R  |
| carrier-driver-J06 | C18 → B18 | GND     |
| carrier-driver-J07 | E13 → D15 | GATE_B  |
| carrier-driver-J08 | D15 → E15 | GATE_B  |
| carrier-driver-J09 | E14 → F15 | GND     |
| carrier-driver-J10 | E17 → H15 | GATE_WW |
| carrier-driver-J11 | H15 → G17 | GATE_WW |
| carrier-driver-J12 | E18 → H17 | GND     |
| carrier-driver-J13 | G13 → I14 | GATE_CW |
| carrier-driver-J14 | I14 → I17 | GATE_CW |
| carrier-driver-J15 | G14 → I18 | GND     |

Use **one continuous insulated ground wire**: route X11 → R11 → R14 → G14 → E14 → C14 → C18 → E18. Strip solder windows only at **X11, V11, U11, T11, S11, R11, G14, E14, C14, C18 and E18**. Keep W11, R14 and every other crossed pad insulated. Size this conductor for the measured system current; a resistor leg is not the boost/LED return bus.

Ground can be shared because these points belong to the same net. Each listed component source/pulldown and module return still needs its own solder joint to that bus. The five gate signals and five LED drains must remain separate.

## 4. Mount the three complete modules

Top-view placement uses millimetres from the upper-left carrier edge. These are **body placement zones**, not hole assignments. Use insulating supports and secure the actual modules before attaching cables. No verified support-hole pattern or fasteners are specified. Avoid exposed pins touching the carrier copper.

| Module           | Nominal footprint zone                         | Height and access                                                                                                                           |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ESP              | x −1…26, y 1…19; allows 27 × 18 mm S3 envelope | Provisional PCB underside 10 mm above carrier, USB facing right. Confirm the actual USB plug clears the driver leads (nominal 7.6 mm high). |
| Protected TP4056 | x 1…26, y 20…36.5                              | PCB underside 3 mm above carrier; USB facing left.                                                                                          |
| MT3608 boost     | x 29…46, y 25…61                               | PCB underside 3 mm above carrier; trimmer accessible from above.                                                                            |

The detailed ESP geometry represents the C3. The larger reserved S3 zone is an allowance, not a measured S3 model. Install only one controller and select its GPIO map below.

The 1 mm ESP PCB overhang does not prove antenna clearance. Identify your module's actual antenna and follow its keepout requirements; reposition or cut away carrier copper if needed and test radio reception after assembly. Espressif's [PCB placement guidance](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/pcb-layout-design.html) explains why baseboard copper near an antenna matters. It does not supply a verified keepout for an unidentified SuperMini.

## 5. Wire carrier joints to printed module labels

Each row is one short insulated pigtail. Lap-solder at the carrier joint; use the **actual labeled pad/header pin** on the purchased module. The 3D dashed callouts are logical destinations, not physical pin locations. Do not assume the module header spacing matches the carrier. Leave enough slack to lift a module for inspection.

| Carrier hole | Net    | C3 destination      | S3 destination      |
| ------------ | ------ | ------------------- | ------------------- |
| **O5**       | VSW    | ESP.5V / VIN        | ESP.5V / VIN        |
| **T11**      | GND    | ESP.GND             | ESP.GND             |
| **P8**       | GATE   | ESP GPIO3           | ESP GPIO9           |
| **X7**       | SENSE  | ESP GPIO4           | ESP GPIO8           |
| **A12**      | PWM_G  | ESP GPIO5           | ESP GPIO5           |
| **A16**      | PWM_R  | ESP GPIO6           | ESP GPIO4           |
| **C15**      | PWM_B  | ESP GPIO7           | ESP GPIO6           |
| **G15**      | PWM_WW | ESP GPIO10          | ESP GPIO10          |
| **I15**      | PWM_CW | ESP GPIO20          | ESP GPIO11          |
| **O1**       | OUT+   | CHG.OUT+            | CHG.OUT+            |
| **S11**      | GND    | CHG.OUT- (not BAT-) | CHG.OUT- (not BAT-) |
| **O4**       | VSW    | BOOST.VIN+          | BOOST.VIN+          |
| **U11**      | GND    | BOOST.VIN-          | BOOST.VIN-          |
| **V11**      | GND    | BOOST.VOUT-         | BOOST.VOUT-         |

**VSW is the switched protected-cell supply.** It feeds the ESP board's 5V/VIN input and boost VIN+, not the boosted 12 V output. Operation across battery voltage and the controller regulator dropout remains to be qualified; retain the existing electrical review. Never connect 12 V to the ESP.

## 6. Connect the external battery, button and LED cables

| From                                                    | To                                              |
| ------------------------------------------------------- | ----------------------------------------------- |
| Battery positive                                        | Charger BAT+                                    |
| Battery negative                                        | Charger BAT−; keep separate from protected OUT− |
| Boost VOUT+ (set and verify 12 V before connecting LED) | LED common +12V                                 |
| O2, protected OUT+                                      | Remote normally-open button contact A           |
| V1, BTN_N                                               | Remote normally-open button contact B           |
| C12, Q1 drain                                           | LED green negative                              |
| C16, Q2 drain                                           | LED red negative                                |
| E12, Q3 drain                                           | LED blue negative                               |
| E16, Q4 drain                                           | LED warm-white negative                         |
| G12, Q5 drain                                           | LED cool-white negative                         |

Use two independent contacts of the normally-open switch; same-side legs on many four-leg tactile switches are already joined. Identify them with a meter. This button connects OUT+ to BTN_N when pressed; it does not connect to ground.

## 7. Check one prototype before copying it

With battery and USB disconnected, compare every component leg and joint with the selected carrier map. Check all ground taps for continuity; check protected OUT+, VSW, each drain and each gate for unintended shorts. Verify diode stripe at V5 and actual transistor pin order. Confirm BAT− has not been bypassed to OUT− by wiring. Components can affect resistance readings; investigate unexpected results before applying power.

The nominal layout and circuit connectivity have been checked in software. Actual module dimensions, supports, USB access, antenna clearance, heat/current limits, transistor drive, regulator headroom and powered latch behavior remain unverified. Use [the electrical review](PERFBOARD_REVIEW.md) for these existing prototype limits. Qualify one current-limited prototype before building a batch.
