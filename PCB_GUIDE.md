# Dark Moth R6 — assemble the one-board device

**R6 prototype / physical verification pending.** This is the current build. Use the **18-column × 24-row isolated-pad carrier**, with rows A–X. No manufactured PCB with built-in copper tracks is required. The older R5 KiCad board, MT3608 supply, TO92 MOSFET circuit and OUT+/BTN_N button wiring are incompatible with this revision.

[Open the complete carrier in 3D](perfboard.html?board=carrier#workbench) · [Detailed carrier instructions](CARRIER_GUIDE.md) · [Firmware and USB procedure](FIRMWARE_GUIDE.md) · [Current print instructions](print.html)

## Start with the parts and connections

The carrier contains 33 component assemblies and four purchased modules: **ESP32-C3 SuperMini**, **UMLIFE 18 × 14 × 5 mm mini USB-C charger**, **Pololu U3V16F5 regulated 5 V supply**, and **Pololu U3V16F12 regulated 12 V supply**. The 5 V and 12 V positive rails never join. The battery, remote button and LED strip stay outside the carrier on three detachable cable plugs.

Use the [current shopping list and ordered checks](perfboard.html?board=carrier#carrier-shopping). Fit only the specified packages: the five LED MOSFETs and the two parallel high-side MOSFETs use sourced **SOT23 adapter boards**, not the earlier TO92 packages. The interactive inspector names each adapter role, each component leg, and its exact carrier hole.

[Component-side hole map](electronics/perfboard-carrier-top.svg) · [Mirrored solder-side hole map](electronics/perfboard-carrier-bottom.svg) · [Module pad labels and cables](electronics/perfboard-carrier-modules.svg) · [Component CSV](electronics/perfboard-components.csv) · [Connection CSV](electronics/perfboard-connections.csv)

## Read a connection before soldering it

The green board has isolated copper pads. Two parts do not connect merely because they are near each other. Put each component leg into its named hole; then add the specified insulated wire underneath. A wire's list of **joined holes** names every place that needs a solder joint, including intermediate joints. Leave insulation intact at all other crossings.

All points named **GND** share one electrical net, but each needs an actual solder joint to the ground conductor. Route the LED/regulator power return to the supply-ground junction without passing its current through the ESP's small return lead. System **GND connects to CHG OUT−**. The protected battery pack's external negative connects only to **CHG B−**. Do not bridge B− to OUT−: that would bypass the charger board's protection. Never bypass the pack's own protection to raw cell negative.

Each of the five LED channels keeps its **own 100 Ω gate resistor and 10 kΩ gate pulldown**. Do not share one resistor across several gates. Each channel return remains separate until its own MOSFET switches it to ground. The LED connector has one common +12 V contact and five separate channel-return contacts; it has no direct GND contact.

Module labels such as `ESP GPIO5`, `CHG.OUT+` and `REG12.VOUT` identify electrical destinations. The dashed 3D module callouts are not measured header locations. Match the printed label on your actual module and leave enough pigtail slack to lift the removable tier.

## Build and check one prototype

1. Mark A1 on the actual board. Check 2.54 mm pitch, isolated pads and cut edges. Match the front and mirrored rear maps to the same physical holes.
2. Place the components using the interactive sequence. Verify every adapter role and actual transistor lead assignment. DSTART's stripe faces **N6**. Inspect each solder joint before covering it with a module.
3. Add every internal conductor and every named intermediate joint. Check continuity within each net and check for unintended bridges between nets, particularly the different positive rails.
4. Mount the four modules on the insulating removable tier, with the ESP's long headers removed or unfitted. Wire the 18 module pigtails to the actual printed labels. Connect the battery to CHG B+/B− as shown in the module sheet; keep its negative separate from system OUT−.
5. Assemble the three matched connector pairs using the numbered face diagrams in the workbench. The button closes **START to GND**. Verify mating-contact continuity and polarity with a meter before connecting a battery or USB.
6. Follow the [ordered bring-up checks](perfboard.html?board=carrier#carrier-bringup). Remove the **JSV service shunt at W16/W17 before connecting ESP USB**, and follow the [firmware guide](FIRMWARE_GUIDE.md). Confirm the regulated 5 V and 12 V supplies before connecting their loads.
7. Qualify one current-limited prototype before making a batch: check startup, shutoff, each LED channel, maximum-current behavior, temperature, charging and physical clearances. Software checks and nominal geometry do not establish these results.

The **UUV voltage supervisor** uses its own SOT23 adapter with GND, RESET and VDD roles; it is not a MOSFET. Its reset output releases the latch at low supply voltage. Fit the nearby **CUV 100 nF non-polar capacitor** exactly as the hole map shows. The cutoff is not a charging interlock: a held START button can bypass the latch cutoff until released. Verify cutoff behavior on the first prototype.

## Charging with the whole device off

Shut the whole device down before connecting USB to the UMLIFE charger. Setting all LED channels to black leaves the controller powered and is not shutdown. Leave the device off throughout charging, then unplug charger USB before switching it on. This build has no automatic USB interlock or qualified simultaneous charging and operation. Follow the [charger checks](CHARGER_REVIEW.md) before charging the first prototype.

## Battery connector and enclosure

The main pack is the protected **67 × 36 × 10 mm 1S battery**; the optional insert supports the smaller **42 × 25 × 10 mm** pack. Preserve the pack's protection and replace its factory connector only **one insulated conductor at a time**. Finish and insulate the first contact before exposing the second; use recessed battery-side contacts and verify polarity with a meter. Follow the complete connector procedure in the [carrier guide](CARRIER_GUIDE.md).

The kit is labeled XH 2.54 mm; its exact fit and current rating remain unmeasured. Use matched parts from that kit and do not assume another XH-style kit intermates. The current printed case and module mounts are R6 prototype geometry. Measure your actual battery, modules, plugs and diffuser, then confirm fit and electrical checks before closing the case.

[Inspect the complete R6 assembly](index.html?mode=exploded#explore) · [Return to the exact-hole workbench](perfboard.html?board=carrier#workbench)
