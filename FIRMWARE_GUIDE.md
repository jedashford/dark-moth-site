# R6 firmware — C3 SuperMini

Use this firmware with the R6 carrier only. Its button input is digital active
LOW and its HOLD output is active HIGH. The historical R5 battery-divider button
wiring is incompatible.

## Pins

| C3 label | Connect to                                               |
| -------- | -------------------------------------------------------- |
| 5V       | REG5 regulated output through the removable service link |
| GND      | Common system ground                                     |
| 3V3      | Button sense pull-up only; never battery positive        |
| GPIO3    | HOLD resistor → QH base                                  |
| GPIO4    | Isolated QSN collector / button sense                    |
| GPIO5    | Green gate resistor                                      |
| GPIO6    | Red gate resistor                                        |
| GPIO7    | Blue gate resistor                                       |
| GPIO10   | Warm-white gate resistor                                 |
| GPIO20   | Cool-white gate resistor                                 |

Use the module's printed labels to identify pins. Do not count pins from a
mirrored underside picture. The carrier guide gives the matching perfboard holes.

## Flash and start

1. Disconnect the battery and charging USB. Remove the REG5-to-ESP 5V service
   link before connecting a computer to the ESP USB. This avoids joining two
   supplies through an unidentified clone's USB/VIN circuit.
2. Unzip `electronics/dark-moth-r6-firmware.zip`. Keep every `.h` file beside
   `dark_moth_ble_v3.ino` in the `dark_moth_ble_v3` folder.
3. Compile for the C3 with USB CDC enabled. Arduino ESP32 core 3.3.8 is the
   build environment used for this release.

   ```sh
   arduino-cli compile --fqbn esp32:esp32:esp32c3:CDCOnBoot=cdc dark_moth_ble_v3
   arduino-cli upload --fqbn esp32:esp32:esp32c3:CDCOnBoot=cdc -p YOUR_PORT dark_moth_ble_v3
   ```

4. Disconnect the computer USB before restoring the service link. Complete the
   electrical guide's current-limited bring-up before installing the battery.
5. With charging USB disconnected, hold the side button for about one second
   to allow controller startup and the voltage supervisor’s release delay, then
   release. The initial press is consumed. The light starts off; a subsequent short tap turns it on.

## Charging is a complete shutdown

Hold the button for two seconds, wait for the red cue and release **before**
connecting the charger USB. Leave the button alone until charging USB is
unplugged. A short tap or the Bluetooth power-off value turns the LEDs black
but leaves the controller powered; neither is the charging shutdown.

The firmware does not detect charger USB or automatically inhibit startup.
The user-selected smaller charger is used only with the whole device off.
Follow [CARRIER_GUIDE.md](CARRIER_GUIDE.md) for its distinct B− and OUT− nodes,
first-charge checks and the hardware voltage-supervisor behavior.

## Controls and limits

- Tap for up to 0.5 seconds to toggle the light while leaving Bluetooth available.
- Hold for 2 seconds for the red cue, then release to shut the device off.
- Five minutes with the light off and no phone connected also shuts it off.
- The simple latch cannot force a crashed MCU off; the accessible battery plug
  is the service disconnect. Charging USB must also be removed for full isolation.
- A USB-powered board can remain alive after shutdown. The firmware leaves HOLD
  LOW and the LEDs off; reset it to restart a USB-only bench session.
- Battery telemetry is unavailable. No unpowered GPIO is connected to a raw-cell
  divider. A separate voltage supervisor controls the low-battery latch cutoff;
  the charger and pack protection remain separate from that operating cutoff.
- 2 kHz / 14-bit PWM describes the requested digital signal. Minimum reliable
  brightness and optical color accuracy still require measurements on R6.
- White mixing uses the strip's nominal 2700–6500 K endpoints and an unmeasured
  mired crossfade. No new calibration or measured color accuracy is claimed.

The existing Bluetooth service and characteristic UUIDs and serial commands are
retained. `electronics/firmware-builds.json` records the actual compilation and
host-test results. No firmware has been uploaded or physically tested by this
design process.
