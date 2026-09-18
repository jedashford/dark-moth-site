# Perfboard circuit review

This is an electrical review of the inherited R5 circuit, not a new circuit design or physical approval. The perfboard layout transfers its existing connections to isolated solder pads. Follow [the build guide](PERFBOARD_GUIDE.md) for assembly; use this review to qualify one powered prototype before repeating it.

## What is established

- The corrected KiCad board's 34 pads match [pcb-pads.json](electronics/pcb-pads.json). Its component roles, values and net names are the source for the latch layout.
- The five independent low-side drivers and both MCU pin maps are recorded in [interconnects.json](electronics/interconnects.json). The [driver reference layout](electronics/driver-layout.json) defines its component holes.
- The R5 firmware reads the 100 kΩ / 100 kΩ button divider through the ADC, with 1000 mV press and 500 mV release thresholds. It initializes attenuation before reading and disables optional battery telemetry by default.
- No physical perfboard assembly, measured cold start, full-load thermal test or batch qualification has been supplied. A connectivity check or a 3D model does not establish those results.

## 1. SS8550 load and voltage loss

QP carries **both the boost input current and the ESP supply current**. Its 330 Ω base resistor allows less than `4.2 V / 330 Ω = 12.7 mA` even before subtracting transistor voltage drops. The [onsemi SS8550 datasheet](https://www.onsemi.com/download/data-sheet/pdf/ss8550-d.pdf), page 2, specifies its 800 mA saturation voltage using **80 mA base current**. Therefore that saturation voltage is not guaranteed by this circuit. The 1.5 A absolute current rating is not proof of low loss or acceptable enclosed temperature.

The repository's primary Yuji strip datasheet, `old/yuji_rgbww50505/F318000x.26-2.3_YJ-BC-HRB-RGBWW5050-xxV.pdf`, page 9, gives 7.2 W/m typical per white channel and 4.8 W/m per RGB channel. For the specified 100 mm strip, all five together are **2.88 W typical**, or **3.19 W** using that table's maxima.

At an **assumed, unmeasured** 90% boost efficiency, 2.88 W requires about 0.865 A from 3.7 V or 1.067 A from 3.0 V. That excludes the ESP and any reduction in boost input voltage caused by QP. Actual conversion efficiency, strip current and simultaneous channel settings must be measured. The older claim that total battery draw is “well under 1 A” is not an established limit.

Measure QP emitter-to-collector loss, input current and temperature across the intended battery/load range. Unstable operation, excessive loss or temperature requires resolving the circuit limitation before batch construction; a brief successful light-up is insufficient.

## 2. ESP power through its VIN regulator

The inherited path is `protected cell OUT+ → QP → VSW → ESP 5V/VIN → onboard regulator → 3V3`. Its margin depends on the exact clone's regulator, any series diode and wiring loss. A regulator intended to deliver 3.3 V needs its specified input headroom after those losses.

The [ESP32-C3 datasheet](https://documentation.espressif.com/ESP32-C3_Datasheet_en.pdf) and [ESP32-S3 datasheet](https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf) specify the chips' supply requirements. They do **not** qualify an unidentified SuperMini board's VIN path. Identify the regulator and measure 3V3 during cold boot, BLE activity and changing LED load, including the lowest intended cell voltage.

Do not substitute a raw-cell connection to 3V3: a charged 1S cell reaches 4.2 V. Keep external power disconnected during USB flashing until the actual module's reverse-power behavior is established.

## 3. Button voltage reaches an unpowered GPIO

While pressed, the existing path is `OUT+ → switch → Db → Rbtn 1 kΩ → GATE`. GATE is connected to **both QL gate and the ESP latch GPIO**. It receives voltage before ESP power has risen. The 100 kΩ / 100 kΩ SENSE divider also receives button voltage during startup.

Rbtn limits current but provides neither isolation nor a defined logic-voltage clamp. Unpowered GPIO behavior can affect startup and may back-power the ESP. At full cell voltage, the direct latch input also needs checking after the ESP has started. The ESP datasheets give powered input-voltage limits relative to the relevant VDD domain; this review has not established an allowed power-off injection current for this arrangement.

Measure latch-GPIO voltage, its current path and the 3V3 rail during cold start and full-charge button presses. Do not treat an observed protection-diode clamp as proof of safe operation. Correct firmware button sensing does not resolve this hardware question. Battery telemetry is disabled, avoiding an additional raw-cell divider path into an unpowered input.

## 4. BS170 drivers at 3.3 V

The [onsemi BS170 datasheet](https://www.onsemi.com/download/data-sheet/pdf/mmbf170-d.pdf), page 2, specifies on-resistance at **10 V gate drive and 200 mA drain current**. Its 0.8–3 V threshold range is tested at only **1 mA**. Neither provides a guaranteed low on-resistance at ESP gate voltage. Its 500 mA absolute current limit is not a 3.3 V drive rating.

For the specified 100 mm strip, the primary Yuji typical figures imply about **60 mA per white channel and 40 mA per RGB channel at 12 V**. This is a source-derived expectation, not a measurement of the user's strip or MOSFETs. Verify the actual manufacturer, part marking and pin assignment, then measure each channel's drain-to-source voltage, current and temperature at its intended maximum output. QL is also a BS170, so its actual gate drive and resulting PNP base current need measurement.

Do not reuse the older assertion that a BS170 is generally good for 0.2–0.3 A at 3.3 V. The current guide retains the source circuit but makes no such guarantee.

## Qualify one prototype

Use a current-limited bench supply in place of the battery for initial circuit tests. Leave all untested modules disconnected and record the settings and readings for the actual parts.

| Stage                      | Test and record                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unpowered                  | Every listed jumper has continuity; no unintended solder bridges; component values, diode stripe and transistor roles match; switch opens on release                          |
| Latch alone                | Feed protected-supply input OUT+/GND at intended cell-range voltages; check QP/QL nodes and VSW while pressing/releasing; record current                                      |
| Latch plus ESP             | Boost disconnected; observe startup GPIO and 3V3 behavior before and during boot, release-to-latch, repeated cold starts, short press and long-hold-release shutdown          |
| Boost separately           | Adjust and measure 12.0 V before attaching the strip; confirm terminal polarity                                                                                               |
| One channel at a time      | Confirm channel identity, true off, current, drain voltage and temperature; begin at low brightness and increase gradually                                                    |
| Combined intended load     | Record input current, QP voltage loss, 3V3 stability, boost output and component temperatures at the intended supply range and duty cycle; repeat after thermal stabilization |
| Off state                  | Verify shutdown and measure remaining current; check for power arriving through USB or a signal wire                                                                          |
| Battery/charger separately | Identify cell specification and charger current setting; confirm protected outputs; initially charge with the light off                                                       |

Compare recorded values with the identified parts' operating limits, allowing margin for temperature and part variation. Resolve out-of-spec or unexplained results before approving the assembly for repetition. This review does not prescribe a replacement transistor, new resistor value or revised supply arrangement.

## Connections that must remain distinct

System GND is the protected charger's **OUT−**. The protection MOSFETs operate in the cell-negative path: connecting **BAT− directly to OUT− bypasses that switching**. The manufacturer's [DW01A application circuit](https://www.ic-fortune.com/upload/Download/DW01A-DS-12_EN.pdf) illustrates the intended separation. Confirm the actual TP4056 module includes that protection circuit and separately marked battery/output terminals.

Each LED driver's gate and drain are private to that channel. Share the source ground bus, not gate resistors or pulldowns. The remote button connects **OUT+ to BTN_N**, not GND. The +12 V strip common never connects to an ESP or latch terminal.

The copied printed PCB's `SW` footprint has a repeated-pad-number/contact-group conflict; R5 leaves it empty and uses a verified remote contact pair. A fresh perfboard has no such copper footprint, so do not recreate that conflict. Identify the actual switch's normally-open pair with a meter.
