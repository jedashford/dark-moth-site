# R6 carrier build guide

**Revision carrier-r6-2026-09 · ESP32-C3 SuperMini · physical verification
pending.** Use one 18-column × 24-row isolated-pad carrier. The nominal outline
is 47.78 × 63.02 × 1.6 mm at 2.54 mm pitch. Check the actual blank, component
markings and pinouts before assembly. This revision replaces the SS8550, BS170
and MT3608 arrangement and the previous BQ25185 version. The owned UMLIFE
charger requires the complete device to be off while charging.

[Interactive carrier](perfboard.html?board=carrier#workbench) ·
[Component side](electronics/perfboard-carrier-top.svg) ·
[Solder side](electronics/perfboard-carrier-bottom.svg) ·
[Module wiring](electronics/perfboard-carrier-modules.svg) ·
[Electrical decisions and bench checks](PRODUCT_ELECTRICAL_PLAN.md)

## Parts to obtain

| Reference | Part                                                                                                        | Quantity | Notes                                                                                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CHG       | [User-owned UMLIFE mini USB-C charger](https://www.amazon.com/dp/B0BRXYZTWN)                                | 1        | Owned part; fully switch off before charging. Seller claims 1 A; actual IC, current, pads and cell charge limits require verification. No automatic lockout.                |
| REG5      | [Pololu U3V16F5](https://www.pololu.com/product/4941)                                                       | 1        |                                                                                                                                                                             |
| REG12     | [Pololu U3V16F12](https://www.pololu.com/product/4945)                                                      | 1        |                                                                                                                                                                             |
| QP        | [Diodes DMP2035U-7](https://www.diodes.com/datasheet/download/DMP2035U.pdf)                                 | 2        | Both footprints of one adapter in parallel; measured current sharing and thermal qualification required.                                                                    |
| Q1–Q5     | [Diodes DMG2302UK-7](https://www.diodes.com/datasheet/download/DMG2302UK.pdf)                               | 5        |                                                                                                                                                                             |
| ADAPTER   | [Adafruit 1230 adapter sets (five SOT23 boards per set)](https://www.adafruit.com/product/1230)             | 2        | Seven individual SOT23 boards required; two supplier sets provide ten. No SOT23-6 devices fitted.                                                                           |
| JSV       | [Harwin M20-9990246 two-pin 2.54 mm header and matching shunt](https://www.harwin.com/products/M20-9990246) | 1        | Internal 5 V programming disconnect; remove shunt before ESP USB.                                                                                                           |
| UUV       | [TI TLV803EA30DBZR supervisor](https://www.ti.com/product/TLV803E/part-details/TLV803EA30DBZR)              | 1        | Standard DBZ, pin1GND/pin2RESET/pin3VDD; 3.08 V falling threshold and 200 ms typical release. Mount on seventh SOT23 adapter.                                               |
| CUV       | 100 nF nonpolar ceramic capacitor, ≥16 V                                                                    | 1        | Body must fit 5 × 3 × 5 mm reservation; 2.54 mm formed lead pitch. Bypass UUV VDD to GND.                                                                                   |
| STOCK     | 2N3904 ×2, 2N3906 ×1, 1N4148 ×1, 20 axial resistors, NO button                                              | 1        | Identify manufacturer pinouts and values. Reuse only correct parts.                                                                                                         |
| BATT      | User JLJLUP LP103665 protected 1S 3000 mAh                                                                  | 1        | User image 67 × 36 × 10 mm, 1C / 3 A listing; actual factory wire and protection ratings unverified. Authorized XH re-termination preserves factory wires/protection/pouch. |

Also obtain suitable three-pin/2.54 mm straight header contacts for the seven
adapters (24 populated contacts total), a mating service shunt, insulated 22 AWG
power/return wire, lighter insulated signal wire, sleeving, and the matched
XH-style kit contacts/housings: two 2-pin pairs and one 6-pin pair. Power wire
outer diameter must fit the 1.6 mm reservation; signal wire must fit 1.0 mm.
These are selection limits, not measurements of existing wire.

The 20 resistors are five 100 Ω, two 1 kΩ, eight 10 kΩ, one 22 kΩ and four 100
kΩ. Confirm values by meter. TO92 lead order varies by manufacturer: form and
sleeve E/B/C leads into the role-labelled holes below.

## Adapter preparation and orientation

Use the **Adafruit 1230 SOT23 board**, 10.16 × 7.62 mm, with its SOT23 side up
and the opposite SOT23-6 footprint empty. Two retail sets provide ten SOT23
boards; seven are needed. This is a specified purchased adapter, not an
interchangeable generic breakout. Its
[supplier PCB drawing](https://github.com/adafruit/Adafruit-SMT-Breakout-PCBs/blob/9c2437974968b6cbf8347792d0e2a7c5c77a9249/6-pin%20SOT-23.brd)
defines the following orientation viewed from the component side:

- Q1 footprint is below the board centre. Gate is the middle left header, source
  bottom left, drain bottom right. For each LED adapter populate Q1 only and
  install only these three header contacts; leave the other holes empty.
  Continuity-check before installing the MOSFET.
- Q2 footprint is above centre. Gate is middle right, source top right, drain
  top left. Populate both Q1 and Q2 on the latch adapter QP with DMP2035U
  devices. All six contacts are used and each matching role is joined by the
  carrier wiring. Do not join different roles.
- Both selected SOT23 MOSFETs have physical pins 1 G, 2 S, 3 D. UUV uses the
  same footprint with different roles: standard DBZ pin 1 GND, pin 2 RESET and
  pin 3 VDD. Fit it only on the adapter at Q4/R4/R7. The package lead positions
  and header positions are different objects. Place adapter PCB undersides 3 mm
  above the carrier top; inspect the soldered SMD joints under magnification
  before fitting the adapter.

The adapter has 0.3048 mm-wide traces. The supplier does not specify copper
thickness or a current/thermal rating. Parallel QP devices reduce ideal
conduction loss but do not establish a 2.5 A adapter rating. Measure sharing,
source-to-drain drop and temperature with the actual assembled adapters. Use
separate matched-length 22 AWG connections to each QP source/drain branch where
practical; the listed joints remain mandatory.

## Exact component holes

A1 is upper-left viewed from the component side. On the mirrored solder side it
is upper-right; hole names never change. All five driver adapters share columns
10–13 and rows C/G/K/O/S. Their series resistors are in column 16 and pull-downs
in column 18. Upright resistor bodies sit at the first listed hole; insulate
their folded return leads. Only one component lead passes through each hole.
Pigtails lap-solder onto the same net underneath.

| Assembly | Value              | Hole: role / net                                                                                                       |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| UUV      | TLV803EA30DBZR     | **Q4**: GND / GND; **R4**: RESET / H_BASE; **R7**: VDD / SW_SYS                                                        |
| CUV      | 100nF ≥16V ceramic | **U7**: 1 / SW_SYS; **U8**: 2 / GND                                                                                    |
| QP       | 2 × DMP2035U       | **U2**: G1 / P_GATE; **V2**: S1 / SYS; **V5**: D1 / SW_SYS; **U5**: G2 / P_GATE; **T5**: S2 / SYS; **T2**: D2 / SW_SYS |
| QH       | 2N3904             | **C2**: E / GND; **C3**: B / H_BASE; **C4**: C / H_COLL                                                                |
| QSP      | 2N3906             | **G2**: E / SYS; **G3**: B / SP_BASE; **G4**: C / SP_COLL                                                              |
| QSN      | 2N3904             | **K2**: E / GND; **K3**: B / SN_BASE; **K4**: C / BUTTON                                                               |
| RH       | 10k                | **C6**: a / HOLD; **D6**: b / H_BASE                                                                                   |
| RHP      | 100k               | **C8**: a / H_BASE; **D8**: b / GND                                                                                    |
| RHC      | 1k                 | **E6**: a / P_GATE; **F6**: b / H_COLL                                                                                 |
| RSP      | 100k               | **G6**: a / SYS; **H6**: b / SP_BASE                                                                                   |
| RSW      | 22k                | **G8**: a / SP_BASE; **H8**: b / START                                                                                 |
| RSN      | 10k                | **I6**: a / SP_COLL; **J6**: b / SN_BASE                                                                               |
| RSNP     | 100k               | **K6**: a / SN_BASE; **L6**: b / GND                                                                                   |
| RBU      | 10k                | **K8**: a / +3V3; **L8**: b / BUTTON                                                                                   |
| RSTART   | 1k                 | **N8**: a / START_D; **O8**: b / START                                                                                 |
| RKEEP    | 100k               | **P2**: a / SYS; **Q2**: b / P_GATE                                                                                    |
| DSTART   | 1N4148             | **N2**: A / P_GATE; **N6**: K / START_D                                                                                |
| Q1       | DMG2302UK          | **C10**: G / GATE_G; **D10**: S / GND; **D13**: D / LED_G                                                              |
| Rg1      | 100                | **C16**: a / PWM_G; **D16**: b / GATE_G                                                                                |
| Rp1      | 10k                | **C18**: a / GATE_G; **D18**: b / GND                                                                                  |
| Q2       | DMG2302UK          | **G10**: G / GATE_R; **H10**: S / GND; **H13**: D / LED_R                                                              |
| Rg2      | 100                | **G16**: a / PWM_R; **H16**: b / GATE_R                                                                                |
| Rp2      | 10k                | **G18**: a / GATE_R; **H18**: b / GND                                                                                  |
| Q3       | DMG2302UK          | **K10**: G / GATE_B; **L10**: S / GND; **L13**: D / LED_B                                                              |
| Rg3      | 100                | **K16**: a / PWM_B; **L16**: b / GATE_B                                                                                |
| Rp3      | 10k                | **K18**: a / GATE_B; **L18**: b / GND                                                                                  |
| Q4       | DMG2302UK          | **O10**: G / GATE_WW; **P10**: S / GND; **P13**: D / LED_WW                                                            |
| Rg4      | 100                | **O16**: a / PWM_WW; **P16**: b / GATE_WW                                                                              |
| Rp4      | 10k                | **O18**: a / GATE_WW; **P18**: b / GND                                                                                 |
| Q5       | DMG2302UK          | **S10**: G / GATE_CW; **T10**: S / GND; **T13**: D / LED_CW                                                            |
| Rg5      | 100                | **S16**: a / PWM_CW; **T16**: b / GATE_CW                                                                              |
| Rp5      | 10k                | **S18**: a / GATE_CW; **T18**: b / GND                                                                                 |
| JSV      | 5 V service shunt  | **W16**: 1 / +5V_REG; **W17**: 2 / +5V_ESP                                                                             |

DSTART stripe/cathode belongs at N6. JSV W16/W17 is the removable **5 V service
connection**, beside the raised modules for access. Do not add a permanent wire
between its two pads. Its two nets are intentionally separate.

## Underside conductors

Every row below is one electrically continuous net. Solder at **every** listed
hole; keep all other passed pads and wire crossings insulated. The drawing is a
wiring schematic, not a measured cut length or proof that wire envelopes never
overlap. Dry-route, secure and inspect the actual wires. There are no bare
horizontal retained-lead bridges. Each intermediate bus window has an explicit
vertical solder joint so it reaches the board:

- Leave component leads/header tails long until the bus is fitted. At each
  intermediate component hole, retain its lead down to the bus window: 1.5 mm
  below the carrier underside for GND/SYS/SW_SYS, or 2.9 mm for signal nets.
  Solder that lead to the stripped window, then trim only the excess below it.
  The model includes these 32 retained vertical leads. If a supplied lead cannot
  reach, use a soldered sleeved extension and recheck physical clearance.
- At the seven otherwise empty terminal holes **P6, P8, R8, T6, T8, V8 and
  V10**, fit one short solid 22 AWG riser, solder it to the pad, and lap-solder
  its lower end to the same-net bus window 1.5 mm below the board underside.
  Lap-solder module/button pigtails at the named pad; do not add another wire
  through that hole. These are seven extra short wire pieces, not resistors.
- The endpoint wires already rise directly to their pads. At every joint, strip
  only the solder window and keep adjacent spans insulated. Confirm
  metal-to-metal contact before soldering and continuity afterward.
- The nominal orthogonal lanes pass between other-net pin centres. Their 0.7 mm
  lead/riser envelope has at least 0.12 mm computed clearance to the thickest
  modeled insulated lane; actual solder fillets, lead forming, insulation and
  wire crossings still require inspection. Do not leave unmapped long bare tails
  or squeeze wires against neighbouring leads.

| Wire        | Net     | Solder windows, in route order                                                                                    |
| ----------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| carrier-J05 | BUTTON  | K4 → L8                                                                                                           |
| carrier-J06 | GATE_B  | K10 → L16 → K18                                                                                                   |
| carrier-J07 | GATE_CW | S10 → T16 → S18                                                                                                   |
| carrier-J08 | GATE_G  | C10 → D16 → C18                                                                                                   |
| carrier-J09 | GATE_R  | G10 → H16 → G18                                                                                                   |
| carrier-J10 | GATE_WW | O10 → P16 → O18                                                                                                   |
| carrier-J11 | GND     | C2 → D8 → D10 → H10 → L10 → L6 → K2 → Q4 → P8 → R8 → T8 → U8 → V8 → V10 → T10 → P10 → P18 → L18 → H18 → D18 → T18 |
| carrier-J13 | H_BASE  | C3 → D6 → C8 → R4                                                                                                 |
| carrier-J14 | H_COLL  | C4 → F6                                                                                                           |
| carrier-J25 | P_GATE  | E6 → N2 → Q2 → U2 → U5                                                                                            |
| carrier-J26 | SN_BASE | J6 → K6 → K3                                                                                                      |
| carrier-J27 | SP_BASE | G3 → H6 → G8                                                                                                      |
| carrier-J28 | SP_COLL | G4 → I6                                                                                                           |
| carrier-J29 | START   | H8 → O8                                                                                                           |
| carrier-J30 | START_D | N6 → N8                                                                                                           |
| carrier-J31 | SW_SYS  | R6 → R7 → T6 → U7 → V5 → T2                                                                                       |
| carrier-J32 | SYS     | G2 → G6 → P6 → P2 → T5 → V2                                                                                       |

Use one insulated ground backbone with the listed solder windows. All sources,
pull-downs and module returns join it; no ground enters the LED plug. SYS and
SW_SYS also use 22 AWG. The design reserves wire centre layers at −3.1 mm
(power/ground) and −4.5 mm (signals), measured from the carrier top. The −5.3 mm
lower assembly envelope includes radius and clearance allowance. Clip lead tails
and cover joints without exceeding that envelope. Confirm clearance to the
actual tray and liner before connecting the battery.

## Module tier and pigtails

All four modules attach to removable insulating edge cradles with their PCB
undersides 12 mm above the carrier top. No long downward module headers are
specified. Remove clips and lift the tier with service slack to inspect the
carrier. No drilled module mounting holes or guessed electrical pad coordinates
are used. Labels in the table are electrical destinations; identify the actual
marked module terminal before attaching a wire.

| Module                          | Carrier-relative envelope XY | USB   |
| ------------------------------- | ---------------------------- | ----- |
| ESP — ESP32-C3 SuperMini        | [-1, 1, 22.5, 18] mm         | right |
| CHG — UMLIFE mini USB-C charger | [1, 28.875, 18, 14] mm       | left  |
| REG5 — Pololu U3V16F5 · 5 V     | [1, 54, 13.1, 8.1] mm        | none  |
| REG12 — Pololu U3V16F12 · 12 V  | [18, 54, 13.1, 8.1] mm       | none  |

The ESP envelope is nominal for the user-selected clone and still unmeasured.
Its antenna end overhang does not prove RF clearance: identify the antenna
keepout and clear underlying copper/metal before final qualification. Charger
dimensions come from the seller and are unmeasured. Adapter outlines come from
supplier drawings. Regulator envelopes come from supplier specifications;
lead/service clearance remains a fit check.

| Carrier hole | Net     | Module terminal or external endpoint |
| ------------ | ------- | ------------------------------------ |
| P6           | SYS     | CHG.OUT+                             |
| P8           | GND     | CHG.OUT-                             |
| R6           | SW_SYS  | REG5.VIN                             |
| R8           | GND     | REG5.GND                             |
| W16          | +5V_REG | REG5.VOUT                            |
| T6           | SW_SYS  | REG12.VIN                            |
| T8           | GND     | REG12.GND                            |
| W12          | +12V    | REG12.VOUT                           |
| W17          | +5V_ESP | ESP.5V / VIN                         |
| K8           | +3V3    | ESP.3V3                              |
| V8           | GND     | ESP.GND                              |
| O8           | START   | BUTTON pin1 → remote contact A       |
| V10          | GND     | BUTTON pin2 → remote contact B       |
| W12          | +12V    | LED pin1 → strip +12V                |
| C6           | HOLD    | ESP GPIO3                            |
| K4           | BUTTON  | ESP GPIO4                            |
| C16          | PWM_G   | ESP GPIO5                            |
| D13          | LED_G   | LED.G                                |
| G16          | PWM_R   | ESP GPIO6                            |
| H13          | LED_R   | LED.R                                |
| K16          | PWM_B   | ESP GPIO7                            |
| L13          | LED_B   | LED.B                                |
| O16          | PWM_WW  | ESP GPIO10                           |
| P13          | LED_WW  | LED.WW                               |
| S16          | PWM_CW  | ESP GPIO20                           |
| T13          | LED_CW  | LED.CW                               |

Connect BATTERY pin 1 to **CHG.B+**, pin 2 to **CHG.B−**. The battery's factory
protection and external leads remain intact. **System GND connects to CHG.OUT−,
never CHG.B−.** Do not bridge these negative nodes, including through test
equipment or USB grounds. Check actual silkscreen and meter continuity to
identify the two positive pads; do not guess from the render. The model
deliberately assigns no physical charger pad coordinates.

CHG.OUT+ feeds SYS. The parallel P-MOSFET latch feeds both regulator inputs;
REG5 and REG12 outputs remain separate. The charger has no selected pack sensor
or automatic charging lockout. Do not apply previous BQ25185 TH, jumper,
charge-current or timer instructions to it.

UUV senses **SW_SYS** at R7 and sinks **H_BASE** at R4 during undervoltage. Its
ground is Q4. CUV is a nonpolar 100 nF ceramic capacitor between U7 and U8;
either capacitor orientation is electrically valid. Use short insulated
supply/ground branches to the supervisor, without changing the named nets.
Verify actual capacitor body fits the 5 × 3 × 5 mm reservation.

## Three detachable plugs

The kit is described as XH 2.54 mm; genuine JST XH is 2.5 mm. Use matched halves
and contacts from the same kit. Housing appearance is not proof of pitch, mating
compatibility or contact/wire current rating. Contact numbers below are this
project's convention: looking into the board-side mating opening, latch/key up,
count left to right. The opposite face is mirrored. Check mating contacts with a
meter before powering.

| Plug      | Project contact order                                                  |
| --------- | ---------------------------------------------------------------------- |
| BATTERY 2 | 1 protected pack positive / CHG.B+; 2 protected pack negative / CHG.B− |
| BUTTON 2  | 1 START / O8; 2 GND / V10; normally-open switch                        |
| LED 6     | 1 +12V / W12; 2 G / D13; 3 R / H13; 4 B / L13; 5 WW / P13; 6 CW / T13  |

No ground wire or split-positive splice belongs in the LED plug. Its positive
contact carries the total channel current. Label both halves of BATTERY and
BUTTON and keep them physically distinct to prevent interchanging two 2-pin
plugs.

The user authorized replacing the factory battery connector only. Preserve
factory leads, protection and pouch. Work on **one conductor at a time**: finish
and insulate its contact before cutting the other wire. Use contacts suited to
the actual wire, recessed contacts on the battery side, correct crimp tooling
and strain relief. Verify polarity with a meter before mating. The battery
listing's 1C claim does not qualify the original wires or new contacts.

## Unpowered checks and first power

1. Unplug battery, both USB ports, LED plug and module pigtails; remove JSV.
   Verify isolated blank pads and the adapter mapping before population. With
   parts installed, check every conductor's listed pads are continuous. Use
   resistance/diode readings where components are present: MOSFET body diodes
   and resistors mean a continuity beep alone is not a short diagnosis.
2. Confirm W16 and W17 have no copper connection with JSV removed. Neither may
   have a copper short to W12 (+12 V), SYS, SW_SYS or ground. Check each
   PWM-to-gate path contains its 100 Ω resistor, each gate-to-ground path its 10
   kΩ resistor, and each drain remains distinct from other channels.
3. Confirm START O8 is separate from BUTTON K4. The remote switch closes O8 to
   V10 only when pressed. No raw supply/START conductor touches an ESP signal
   pad. Confirm DSTART orientation and each transistor role.
4. Initially leave charger/cell disconnected and substitute a current-limited
   supply at SYS P6 / GND P8. Begin without LEDs, test latch and regulator
   rails, then attach ESP through JSV. Record startup, radio transients and
   shutdown. Follow the detailed acceptance table in the electrical plan.
5. Before any ESP USB connection, disconnect the battery and charging USB,
   remove JSV, and verify it is removed. Then connect ESP USB for programming.
   USB boot asserts HOLD and can energize the 12 V branch if the battery or
   charging supply remains connected, even with JSV removed. Unplug ESP USB
   before refitting JSV and restoring battery power. Clone reverse-power
   isolation is not assumed.
6. At 4.2, 3.7 and 3.3 V bench input, hold the startup button for about one
   second, then release. UUV keeps the hold transistor disabled for 130–270 ms
   after its supply recovers. A short tap may therefore fail to latch. Sweep the
   loaded SW_SYS rail down slowly: the specified falling threshold is
   **3.0184–3.1416 V**. Record actual shutdown voltage, rail collapse, and no
   repeated restart after rebound. A button held down bypasses the cutoff;
   release it if the device will not remain on, and recharge instead of
   repeatedly restarting. These are required physical tests, not reported
   results.
7. Identify the charger's actual IC, pads and charge-setting resistor. The
   seller claims 1 A charging; this has not been verified and is not a
   demonstrated permitted charge rate for the pack. Use a sink-capable battery
   simulator for charger tests; a source-only supply must not absorb charging
   current. Check termination, recharge, temperature and operation with the
   intended USB cable/source before using the pack.
8. **Fully switch off, release the button, and verify shutdown before plugging
   in charging USB. Do not press the button or use the light while charging.**
   Black LEDs alone do not establish shutdown; both regulated rails must be off
   in the bench check. There is no hardware lockout. Unplug charging USB before
   turning the device on.
9. Until the pack's charge limits and actual board temperatures are qualified,
   charge **open-case, supervised, with pack temperature independently monitored
   at 15–30°C**. Stop outside that range. No pack temperature sensor or
   thermal-charge inhibit is fitted; no unattended or enclosed charging is
   qualified. The former BQ25185 250 mA and six-hour timer claims do not apply
   to this module.
10. Measure battery current with the latch off, both without charging USB and
    with it connected, near full charge and near cutoff. Charger/protector
    current and possible indicator glow remain unmeasured. Do not assume zero
    standby current or a particular storage life. Leave its components fitted.

The generated report checks declared wiring and nominal clearances only. No
assembled current capacity, charging behavior, thermal limit, low-battery
cutoff, radio performance or optical calibration has been measured here.
