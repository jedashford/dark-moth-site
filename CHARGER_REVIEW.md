# User-supplied mini USB-C charger — compatibility review

**Selected for R6: manually switch the complete device off while charging.** The
user selected this simpler operating mode. The UMLIFE module replaces the
previous Adafruit BQ25185. Current wiring and assembly steps are in
[CARRIER_GUIDE.md](CARRIER_GUIDE.md); low-battery shutdown uses the separate
TLV803EA30DBZR supervisor described in
[PRODUCT_ELECTRICAL_PLAN.md](PRODUCT_ELECTRICAL_PLAN.md).

## What the supplied listing establishes

The supplied screenshot matches the
[UMLIFE B0BRXYZTWN listing](https://www.amazon.com/dp/B0BRXYZTWN). The seller
describes a 14 × 18 × 5 mm board, with the USB-C socket protruding about 1.5 mm.
The screenshot's inch conversions are inconsistent, so the metric dimensions
remain provisional until the actual board is measured.

The seller specifies 1 A linear charging, 4.2 V final voltage, 100 mA
termination, recharge at 4.05 V, and 100 mA precharge below 2.9 V. It also
claims 2.4 V over-discharge protection and a 4 A protection threshold. Those
thresholds are not a continuous-current rating or validation of the purchased
board, battery, connectors or wire. The listing says input power may be needed
to activate the protection circuit initially.

The photograph shows separate B− and OUT− pads, input pads and two positive
pads. This resembles a 4056-family charger plus a separate protection circuit.
The exact IC identity, resistor settings, protection wiring, pad coordinates and
USB-C implementation are not established by the photograph. Do not infer the
right-hand positive pad assignments from perspective alone.

## Why the charging behavior matters

A battery charger with current-based charge termination needs to distinguish
cell charging current from the device's operating load. A system load connected
across the charging output can prevent or disturb termination. The
[Top Power TP4056 datasheet](https://www.toppwr.com/uploadfile/file/20240913/66e3a367981a1.pdf)
establishes the behavior of that particular IC; it does not establish which IC
is fitted to this generic module.
[Microchip AN1149](https://www.microchip.com/en-us/application-notes/an1149)
explains separate system power paths for simultaneous operation and charging.

The selected and rejected operating paths are:

1. **Selected: turn the complete device off while charging.** The smaller module
   may be usable after verifying its actual pads, charge-current setting, cell
   limits and protection behavior. The complete device must be off, not merely
   commanded to black LEDs. The existing latch and separate 5 V / 12 V
   regulators still perform necessary functions.
2. **Not selected: operate the light while charging.** This would need a
   power-path charger or a separately designed and qualified power-sharing
   circuit. The smaller module's protection circuit alone is not evidence of
   this function. A direct USB-to-battery or USB-to-latched-supply jumper is not
   an acceptable substitution.

For a module with battery protection in its negative path, battery-side negative
and protected output negative are distinct circuit nodes. They must not be
casually joined through the carrier ground or programming USB. The protected
battery's external leads remain intact apart from the user-requested connector
replacement; no access to raw cell tabs or removal of pack protection is
required.

## Integration consequences

After identifying the actual pads, the selected protected-module arrangement is
pack external positive/negative to **B+/B−**, output positive to the latch's
**SYS**, and **OUT−** to the carrier's complete system ground. The pack's own
protection does not make module B− and OUT− interchangeable. Confirm whether IN−
is connected to OUT− on the purchased PCB; do not assume it or bridge the two
negative nodes. Check the two positive pads for continuity and their labels
before selecting either one. Programming USB ground must remain on the system
side of the protection path, following the revised service-isolation procedure.

| Required behavior                                          | Minimum change in principle                                                                                                                        | Qualification still needed                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manually off during charging, bench prototype              | No extra load-sharing components; retain the latch and both regulators. Shut the latch down completely before charging and leave the button alone. | This procedure does not prevent a button press from powering the load. Verify termination with the complete load actually off.                                                                                                                                                                           |
| Automatically forced off whenever charging USB is attached | A USB-present hardware inhibit that overrides both START and HOLD; merely forcing firmware HOLD LOW does not defeat the held START contact.        | The inhibit must respect the module's ground domains. A discrete transistor clamp is a candidate, not an implemented circuit or assigned carrier footprint.                                                                                                                                              |
| Light usable while charging                                | A separate source-selection/power-path stage, or retain the BQ25185.                                                                               | A P-channel MOSFET, Schottky diode and pull-down are the core of the [AN1149 approach](https://ww1.microchip.com/downloads/en/appnotes/01149a.pdf); actual device ratings, supply budget and transient behavior require a complete design. These three parts alone do not restore all BQ25185 functions. |

The replacement removes the BQ25185's approximately 3.0 V battery cutoff. The
selected Pololu converters can continue operating below their startup voltage,
down to a specified 1.3 V input. R6 now adds a TLV803EA30DBZR supervisor that
clamps the hold transistor below a specified 3.0184–3.1416 V on the switched
battery rail. Actual trip, rail collapse and absence of restart require bench
qualification; the listing's 2.4 V protection claim is not a substitute. The
clamp works with START released; a held button bypasses it. The MCU has no
battery ADC, and this is not a measured cutoff result.
[Pololu regulator specification](https://www.pololu.com/product/4941)

At the seller's stated 1 A charging current, a linear charger would dissipate
approximately (5 − 3.7) × 1 = **1.3 W** at a 3.7 V cell, before other losses.
This is a calculation, not a measured temperature or proof of sustained current
on the small PCB. The actual chip, charge-setting resistor and thermal behavior
must be identified before prescribing a resistor change. Do not transfer the
BQ25185's 250 mA jumpers, NTC connection, timer or temperature behavior to this
module. The pack's 1C discharge claim does not specify its permitted charge
rate.

For simultaneous use, USB must supply both system load and charging current.
Verify the actual USB-C CC implementation and compatibility with the intended
cable/source; a Type-C receptacle alone establishes neither successful C-to-C
attachment nor an available current budget.

## Purchased-hardware checks before assembly

Verify the actual module's silkscreen, chip marking, dimensions, USB overhang
and charge setting. The small module does not expose an established
pack-temperature connection. No pack temperature sensor or charge inhibit is
fitted. Follow the supervised, open-case, independently monitored 15–30°C
prototype charging procedure until cell limits and thermal behavior are
qualified. Do not transfer BQ25185 pad names, ground arrangement, current
jumpers, NTC or timer claims.

The canonical circuit now uses CHG.OUT+/OUT− for the latch/system supply and
CHG.B+/B− for the factory-protected pack's external leads. Mechanical and viewer
artifacts are regenerated from that contract. Both ground domains remain
distinct, and all physical pad positions remain unmeasured.
