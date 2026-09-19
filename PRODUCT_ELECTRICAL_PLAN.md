# R6 electrical design and physical acceptance

The implemented R6 prototype uses the confirmed ESP32-C3 SuperMini, the owned
UMLIFE mini USB-C charger with the complete device off during charging, separate
regulated 5 V and 12 V supplies, a parallel P-MOSFET latch, an isolated
active-LOW button sense stage and five logic-level LED MOSFETs. Its exact holes,
purchasable parts and assembly procedure are in
[CARRIER_GUIDE.md](CARRIER_GUIDE.md). The canonical generated circuit is the
`carrier` board in [perfboard-layout.json](electronics/perfboard-layout.json).
The legacy latch, driver and combined boards remain historical references.

**Status: design and nominal layout verified; physical product qualification
pending.** A render, compiler result or graph check cannot establish working
charging, thermal capacity, minimum dim level or fit of purchased parts.

## Circuit and parts

```text
Protected 1S pack → CHG B+/B−     USB-C → CHG USB (device OFF)
                         CHG OUT+ (SYS)
                              ↓
                    2 × DMP2035U in parallel
                              ↓ SW_SYS
                 ┌────────────┴─────────────┐
           U3V16F5 / 5 V              U3V16F12 / 12 V
                 ↓                         ↓
            service shunt             LED common +
                 ↓                         ↓
          C3 SuperMini VIN          five DMG2302UK sinks
```

Both DMP2035U sources connect to SYS, drains to SW_SYS and gates to P_GATE. A
100 kΩ source-to-gate resistor turns them off. START is pulled to ground by the
remote normally-open button; a 1N4148 (anode P_GATE, cathode through 1 kΩ to
START) initiates power. A 2N3904 pulls the gates down through 1 kΩ while its
base receives ESP HOLD through 10 kΩ; a 100 kΩ base-emitter resistor prevents
floating hold drive. Use the low-leakage 1N4148, not an unqualified power
Schottky whose leakage could falsely pull the floating START node.

Button sensing uses a separate 2N3906 emitter at SYS, base pulled to SYS by 100
kΩ and to START by 22 kΩ. Its collector drives a second 2N3904 base through 10
kΩ, with a 100 kΩ base-emitter resistor. That NPN emitter is grounded and its
collector connects to BUTTON, pulled up **only to ESP 3V3** through 10 kΩ. Thus
the unpowered GPIO has no raw battery divider or steering diode attached.

Each DMG2302UK has gate pin 1 through its own 100 Ω PWM resistor, source pin 2
to ground, drain pin 3 to one LED return and a separate 10 kΩ gate-source
pull-down. The five rows remain aligned. Both selected SOT23 parts have pin
order 1 G, 2 S, 3 D. TO92 stock parts require manufacturer-specific pinout
identification and formed/sleeved role leads.

Final external plugs are BATTERY 2 (+/−), BUTTON 2 (START/GND), LED 6
(+12V/G/R/B/WW/CW). The former OUT+/BTN_N button harness is incompatible. System
ground is **CHG.OUT−**; the protected pack external negative connects only to
**CHG.B−**. These negative domains must not be bridged. A removable 5 V shunt at
W16/W17 isolates REG5 from ESP VIN before USB programming; no reverse-current
blocking is assumed for the clone.

## Module and adapter evidence

| Part           | Selected source                                                                     | Established fact and limit                                                                                                |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| CHG            | [UMLIFE owned module](https://www.amazon.com/dp/B0BRXYZTWN)                         | Seller claims 18 × 14 × 5 mm, 1.5 mm USB overhang, 1 A charging; actual pads, settings, limits and dimensions unmeasured. |
| REG5           | [Pololu U3V16F5 #4941](https://www.pololu.com/product/4941)                         | 5 V, 13.1 × 8.1 × 3 mm without headers; output-current graphs are typical and depend on input and temperature.            |
| REG12          | [Pololu U3V16F12 #4945](https://www.pololu.com/product/4945)                        | 12 V version, same envelope; 2.7 V startup requirement.                                                                   |
| QP ×2          | [Diodes DMP2035U-7](https://www.diodes.com/datasheet/download/DMP2035U.pdf)         | RDS(on) maximum 45 mΩ at −2.5 V and 62 mΩ at −1.8 V under the 25°C test conditions.                                       |
| LED Q ×5       | [Diodes DMG2302UK-7](https://www.diodes.com/datasheet/download/DMG2302UK.pdf)       | RDS(on) maximum 120 mΩ at 2.5 V; Qg 1.4 nC typical at 4.5 V, Ciss 130 pF typical.                                         |
| Adapters ×7    | [Adafruit 1230](https://www.adafruit.com/product/1230)                              | Each retail set includes five SOT23 boards; buy two sets for one product, or ceil(7 × product count / 5) for a batch.     |
| Service header | [Harwin M20-9990246](https://www.harwin.com/products/M20-9990246)                   | 2-pin 2.54 mm header; separately obtain matching shunt and check its actual height.                                       |
| UUV            | [TI TLV803EA30DBZR](https://www.ti.com/product/TLV803E/part-details/TLV803EA30DBZR) | Standard DBZ open-drain supervisor, 3.08 V nominal falling threshold; 100 nF ceramic supply bypass.                       |

The
[adapter Eagle drawing](https://github.com/adafruit/Adafruit-SMT-Breakout-PCBs/blob/9c2437974968b6cbf8347792d0e2a7c5c77a9249/6-pin%20SOT-23.brd)
establishes its 10.16 × 7.62 mm outline, header grid and actual Q1/Q2 net
mapping. Copper traces are 0.3048 mm wide; thickness is unspecified. There is
**no manufacturer adapter current/thermal rating** to transfer to this assembly.
Ideal equal sharing at 2 A total and 45 mΩ per device gives 0.09 W total channel
loss at 25°C; this calculation excludes traces, joints, unequal sharing and hot
RDS(on). A package absolute current rating does not qualify adapter copper.

The charger uses an 18 mm USB-axis length and 14 mm transverse width from the
supplied seller image. The inch conversions in that image are wrong; metric
dimensions, 5 mm total height and 1.5 mm USB overhang remain nominal. USB faces
left; no physical pad centre or chip identity is inferred. All four modules sit
on a removable tier with PCB undersides 12 mm above the carrier top. C3 antenna
keepout and purchased module fit require physical checks.

## Hardware low-battery cutoff

UUV is **TLV803EA30DBZR**, the standard SOT23 DBZ pinout: pin 1 GND at Q4, pin 2
active-LOW open-drain RESET at R4/H_BASE, pin 3 VDD at R7/SW_SYS. The R/V pinout
alternatives and push-pull TLV809E are not substitutes. CUV, a nonpolar 100 nF
ceramic capacitor at U7/U8, bypasses SW_SYS to GND. No battery ADC or extra GPIO
is connected.

The [TI datasheet](https://www.ti.com/lit/ds/symlink/tlv803e.pdf) specifies 3.08
V nominal falling threshold, ±2% across its stated temperature range
(**3.0184–3.1416 V**), 0.9–1.5% hysteresis and 130–270 ms release delay. Its
open-drain output specifies at most 0.3 V at 500 µA with VDD=1.7 V; RH=10 kΩ
supplies at most 330 µA from 3.3 V. It clamps the hold transistor's base without
driving it high. The selected supply is downstream of the latch, so loss of the
held supply continues to hold RESET low while the rail collapses. Below 0.7 V
the output state is unspecified; qualification must verify the ESP hold signal
has collapsed and no restart occurs.

This is a circuit design inference from the specified parts: with START
released, the clamp turns QH off and lets RKEEP turn QP off. Confirm it with
actual transistor leakage, rail capacitance, load transients and temperature. A
held START contact can bypass the clamp; do not keep holding the button or
repeatedly restart a depleted pack. Startup requires holding about one second,
including the supervisor release delay and firmware boot. The module's claimed
2.4 V protection threshold is a backup limit, not the normal cutoff.

## Load, battery and charging limits

The local supplier PDF
`old/yuji_rgbww50505/F318000x.26-2.3_YJ-BC-HRB-RGBWW5050-xxV.pdf`, page 9,
implies 2.88 W typical and 3.19 W table-maximum for 100 mm of the specified 12 V
RGBWW strip. Reserve 0.27 A at 12 V including simultaneous five-channel
operation. This is a supplier-derived expectation, not measured strip current.
Reserve 0.5 A at 5 V for ESP startup/transients until measured. The 5.69 W
combined budget at **assumed** 85% conversion efficiency and 3.3 V requires
about 2.03 A before charger, switch and wiring losses. Qualify the complete path
for at least 2.5 A and measure actual peak/inrush; otherwise reduce the
permitted brightness/load according to measured limits.

The user-selected JLJLUP LP103665 listing states protected 1S, 3.7 V, 3000
mAh/11.1 Wh, 1C and 67 × 36 × 10 mm. That listing does not qualify the factory
wire, protector or replacement contacts. The user authorized replacing the
factory connector with their XH-style 2-pin connector while preserving factory
leads, protection and pouch. The guide records one-conductor-at-a-time
termination, insulated/recessed battery contacts and polarity verification.

The charger is used only with the complete device switched off. A black LED
command is insufficient because ESP and converter load can disturb charge
termination. There is no automatic USB-present lockout. Release the shutdown
button, verify both regulated supplies are off, then plug in charger USB; unplug
it before switching on. See [CHARGER_REVIEW.md](CHARGER_REVIEW.md).

The seller claims 4.2 V charging at 1 A, 100 mA termination and protection at
2.4 V/4 A. These are not validated specifications for the purchased unit or
continuous-current ratings. At 5 V input and 3.7 V cell, 1 A linear charging
implies about 1.3 W chip dissipation before other losses; this calculation is
not a temperature measurement. Identify actual IC/current setting and confirm
the pack's permitted charge rate before prescribing resistor changes. No
previous BQ25185 jumper, 250 mA, timer or pack-NTC instruction applies.

No pack temperature sensor is fitted. Until actual cell charge limits and module
thermal behavior are qualified, charge **open-case and supervised, with
independently monitored pack temperature at 15–30°C**, stopping outside that
range. Enclosed/unattended charging remains unqualified. Measure off-state
battery current with charging USB absent/present and at full/low battery;
charger/protector standby draw and indicator behavior remain unmeasured.

## Firmware contract and rejected alternatives

C3 GPIOs are HOLD 3, BUTTON 4, G 5, R 6, B 7, WW 10, CW 20. HOLD is active HIGH
and must assert before serial/BLE delays. BUTTON is digital active LOW; old ADC
thresholds are obsolete. Keep gates LOW during boot. Consume the boot press
until release. Long-hold shutdown takes effect on release because a held START
contact forces power on. A firmware crash with HOLD high needs battery
disconnection; crash-independent forced-off requires a different controller.

The retained 2 kHz/14-bit PWM has a 30.5 ns least pulse. Datasheet DC resistance
and compiler success cannot establish optical response at that pulse width.
Measure gate, drain and optical output, select the minimum reliable pulse and
recalibrate. Battery percentage remains unavailable without a separately safe
measurement circuit; do not connect raw battery to an unpowered ADC.

| Alternative                                 | Decision                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| SS8550 main pass                            | Existing base drive does not guarantee low loss at the expected current.                   |
| Raw 1S to ESP VIN / 3V3                     | VIN regulator headroom is unestablished; 4.2 V on 3V3 exceeds chip supply limits.          |
| BS170 directly from 3V3                     | No applicable guaranteed on-resistance.                                                    |
| BS170 with three dual gate-driver DIP ICs   | Can be engineered but requires more parts, decoupling and area than the selected adapters. |
| AO3400A output MOSFET                       | DC-capable alternative with larger typical gate charge; not selected.                      |
| Simultaneous use with the mini charger      | Not selected by user; would need a separately designed power path and source budget.       |
| One combined 5 V charger/boost feeding 12 V | Shared 1 A-class output reduces headroom compared with separate branches.                  |
| Historic 24 V manufactured PCB BOM          | Different assembly; it is not evidence that this hand-built circuit works.                 |

## Bench acceptance record required

Use a current-limited source for initial SYS tests with cell/charger detached. A
sink-capable battery simulator is required for charger tests; an ordinary
source-only bench supply must not absorb charging current.

| Check        | Record and acceptance                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unpowered    | Verify every named pad/net; no copper short across PWM resistors, between supply outputs, or across removed JSV. Confirm diode/FET orientation and connector polarity. |
| Latch/button | Repeat starts at 4.2/3.7/3.3 V, short/held/bouncing presses; release holds power, shutdown removes both rails, GPIO remains within device limits throughout.           |
| ESP supply   | Scope VIN/3V3 at boot, BLE radio activity and LED load steps. Target 3V3 3.15–3.45 V without resets, subject to exact board specifications.                            |
| LED supply   | 12 V meets strip/module limits for individual and all-channel load. Record current, ripple, inrush and lowest functioning battery voltage.                             |
| QP/adapter   | Measure each branch current, total drop and temperature at low-cell maximum load. No claimed rating from the SOT23 absolute current limit.                             |
| Optical      | Measure minimum reliable pulse/light, monotonicity, zero-state glow and transitions; re-run calibration for the new MOSFETs.                                           |
| Low battery  | Sweep loaded SW_SYS through 3.0184–3.1416 V; record actual trip, rail collapse and no automatic restart after rebound with START released.                             |
| Charging     | Verify actual charge current, pack limits, termination/recharge, off-state USB insertion/removal and temperatures; no operation while charging.                        |
| Temperature  | Test final allowed load/charging modes to equilibrium at declared maximum ambient; measure pack, charger, converters, adapter and case with margin to exact limits.    |
| Service/off  | Measure off current, GPIO/USB backfeed and repeated flashing with JSV removed; verify reconnect procedure.                                                             |
| Mechanics/RF | Actual parts fit, protected wires, no cell compression, accessible shunt, antenna keepout and closed-case BLE.                                                         |

[verification.json](electronics/verification.json) reports independent
declared-net, role and nominal-envelope checks with input hashes. It explicitly
retains `physical_validation: false` until real measurements are recorded
separately.
