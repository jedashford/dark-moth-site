// Instructions for purchased modules mounted on the integrated carrier.
window.DarkMothCarrierPanel = ({
  getBoard,
  getScene,
  getVariant,
  esc,
  hole,
  netButton,
}) => {
  const $ = (id) => document.getElementById(id);
  const moduleFor = (ref) =>
    getBoard()?.modules?.find((part) => part.ref === ref);
  const linksFor = (ref) =>
    (getBoard()?.module_links || []).filter((link) => link.module === ref);
  const destination = (link) =>
    typeof link.to === "string" ? link.to : link.to[getVariant()];
  const current = () => getBoard()?.hardware_revision === "R6";
  const charging =
    "<p><strong>Charge with the whole device fully off.</strong> Shut down before connecting charger USB. Black LEDs alone are not shutdown. Leave the device off until charger USB is unplugged.</p>";
  const linkRows = (links) =>
    links
      .map(
        (link) =>
          `<tr><td>${hole(link.hole)}</td><td>${esc(destination(link))}</td><td>${netButton(link.net)}</td></tr>`,
      )
      .join("");
  const notes = (part) =>
    [
      Array.isArray(part.mounting_notes)
        ? part.mounting_notes.join(" ")
        : part.mounting_notes,
      part.height_status,
    ]
      .filter(Boolean)
      .join(" ");
  const directConnections = (ref) =>
    (getBoard()?.module_connections || []).filter(
      (wire) =>
        !ref ||
        wire.from.includes(ref + ".") ||
        (typeof wire.to === "string" && wire.to.includes(ref + ".")),
    );
  const directList = (ref) =>
    directConnections(ref)
      .map(
        (wire) =>
          `<li><strong>${esc(wire.from)}</strong> → ${esc(typeof wire.to === "string" ? wire.to : wire.to[getVariant()])}<br />${netButton(wire.net)}</li>`,
      )
      .join("");
  const connectorRows = (connector) =>
    connector.pins
      .map(
        (pin) =>
          `<tr><td>${pin.number}</td><td>${esc(pin.label)}</td><td>${pin.hole ? hole(pin.hole) : esc(pin.from)}</td><td>${esc(pin.to)}</td></tr>`,
      )
      .join("");
  function connectorFace(connector) {
    const width = connector.pin_count * 54 + 36;
    return `<figure class="connector-face"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 126" role="img" aria-label="${esc(connector.label)} board-side mating face, key up; project contacts left to right"><title>${esc(connector.label)} · look into board-side mating opening, key up</title><rect x="12" y="29" width="${width - 24}" height="57" rx="5" fill="#f4f3ec" stroke="#5f6d69" stroke-width="2"/><rect x="${width / 2 - 14}" y="20" width="28" height="12" fill="#d3d9d1" stroke="#5f6d69"/>${connector.pins.map((pin, index) => `<rect x="${30 + index * 54}" y="44" width="30" height="22" rx="2" fill="#303c37"/><text x="${45 + index * 54}" y="60" fill="white" text-anchor="middle" font-size="15">${pin.number}</text><text x="${45 + index * 54}" y="105" fill="currentColor" text-anchor="middle" font-size="12">${esc(pin.label.replace("Battery ", "").replace("+12 V common", "+12 V"))}</text>`).join("")}</svg><figcaption>Board-side mating face · key up. Project numbers; verify each matching contact with a meter.</figcaption></figure>`;
  }
  function inspectConnector(ref) {
    const connector = getBoard()?.external_connectors?.find(
      (item) => item.ref === ref,
    );
    if (!connector) return false;
    $("part-select").value = "";
    $("net-select").value = "";
    getScene()?.highlight({ component: ref });
    $("inspection").innerHTML =
      `<p class="inspection-label">Detachable XH-style cable</p><h2>${esc(connector.label)}</h2>${connectorFace(connector)}<ol>${connector.pins.map((pin) => `<li><strong>${esc(pin.label)}</strong>: ${pin.hole ? hole(pin.hole) : esc(pin.from)} → ${esc(pin.to)}</li>`).join("")}</ol>${connector.notes.map((note) => `<p>${esc(note)}</p>`).join("")}`;
    return true;
  }
  function renderConnectors(board) {
    $("carrier-connectors").innerHTML =
      `<p class="eyebrow">Plug in the battery, button and lights</p><h2>Three white plugs. Every wire named.</h2><p>Use matched connector parts from your kit: <strong>2-pin battery, 2-pin button and 6-pin LED</strong>. The LED contact order is +12 V, G, R, B, WW, CW. These plugs sit on short leads beside the carrier; their positions in 3D are illustrative.</p><p>Click a plug below or its white housing in 3D. Numbers below are project contact numbers: <strong>look into the board-side mating opening with its latch/key up; count left to right.</strong> The opposite mating face is mirrored—check each mating contact with a meter.</p>${(board.external_connectors || []).map((connector) => `<h3><button type="button" class="pin-link" data-carrier-connector="${esc(connector.ref)}">${esc(connector.label)} ↗ 3D</button></h3>${connectorFace(connector)}<div class="table-scroll" tabindex="0" role="region" aria-label="${esc(connector.label)} wiring"><table><thead><tr><th>Contact</th><th>Wire function</th><th>Board / module end</th><th>Device end</th></tr></thead><tbody>${connectorRows(connector)}</tbody></table></div>`).join("")}<p>${current() ? "<strong>R6 button:</strong> a press joins START to GND and reads LOW. The old OUT+/BTN_N button harness is incompatible. <strong>Battery:</strong> connect the protected pack’s external +/− leads to CHG B+/B−. Keep B− separate from OUT−, the system ground." : "<strong>Historical R5 button:</strong> neither wire goes to ground. Battery BAT− stays separate from protected OUT−."} Label the two 2-pin plugs BATTERY and BUTTON so they cannot be confused.</p><p><strong>Lights:</strong> run one common positive wire from ${current() ? "REG12 VOUT" : "boost VOUT+"} through LED contact 1 to the strip's +12 V pad. The five channel returns use contacts 2–6; no GND contact belongs in the LED plug. The positive contact carries the combined current of all five channels.</p><p>Your kit label says XH 2.54 mm; genuine JST XH specifies 2.5 mm. Actual kit pitch, mating fit and current rating remain unverified. Use matched housings, contacts and mating halves from the same kit; do not assume different XH-style kits intermate or force headers into the 2.54 mm perfboard grid. <a href="CARRIER_GUIDE.md#three-detachable-plugs">Crimping, matching and connection instructions</a>.</p>`;
  }
  function render() {
    const board = getBoard();
    if (!board?.modules) return;
    renderConnectors(board);
    renderPreparation(board);
    $("carrier-reference").innerHTML =
      `<p class="eyebrow">One carrier · 18 columns · rows A–X</p><h2>Mount these ${board.modules.length} complete modules.</h2><p>The latch and five LED channels use the ${board.components.length} individual components or adapters on this same board. Do not also build the old manufactured latch PCB or a second driver board. Battery, LED strip and the remote button remain connected by cables.</p><p>The module areas are placement allowances. Their header holes and mounting fixtures are not verified. The current controller is the confirmed ESP32-C3 SuperMini; check its actual board against the reserved space. Read the actual module labels when wiring.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Carrier module mounting"><table><thead><tr><th>Complete module</th><th>Position and mounting</th><th>Before soldering</th></tr></thead><tbody>${board.modules.map((part) => `<tr><td><button type="button" class="pin-link" data-carrier-module="${esc(part.ref)}">${esc(part.ref)} · ${esc(part.label)}</button></td><td>${esc(notes(part))}</td><td>${esc(part.pin_position_status)}</td></tr>`).join("")}</tbody></table></div><h3>Carrier hole → printed module label</h3><p>Each row is one short insulated wire. The 3D module callouts show connection roles, not measured pin positions. Solder to the actual printed pad or header pin named in this table. Never solder a module into guessed carrier holes.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Carrier module wire connections"><table><thead><tr><th>Carrier joint</th><th>Actual module label / GPIO</th><th>Net</th></tr></thead><tbody id="carrier-module-rows">${linkRows(board.module_links)}</tbody></table></div><h3>Connections that bypass carrier holes</h3><ul id="carrier-direct-connections">${directList()}</ul><p><a href="electronics/perfboard-carrier-modules.svg" target="_blank" rel="noopener">Print module placement and wiring ↗</a> · <a href="CARRIER_GUIDE.md">Read the one-board build guide</a></p>`;
  }
  function inspectModule(ref, detail) {
    const part = moduleFor(ref);
    if (!part) return false;
    $("part-select").value = ref;
    $("net-select").value = "";
    getScene()?.highlight({ component: ref });
    $("inspection").innerHTML =
      `<p class="inspection-label">Purchased module · ${esc(ref)}</p><h2>${esc(part.label)}</h2>${detail ? `<p>${esc(detail)}</p>` : ""}<p>${esc(notes(part))}</p><p>${esc(part.pin_position_status)}</p>${current() && ref === "CHG" ? charging : ""}<h3>Wire the printed labels</h3><ul>${linksFor(
        ref,
      )
        .map(
          (link) =>
            `<li>${hole(link.hole)} → <strong>${esc(destination(link))}</strong><br />${netButton(link.net)}</li>`,
        )
        .join(
          "",
        )}</ul>${directConnections(ref).length ? `<h3>Direct cable connections</h3><ul>${directList(ref)}</ul>` : ""}<p>Use the module as a complete unit. Its modeled small parts are already fitted; do not install duplicates on the carrier.</p>`;
    return true;
  }
  function inspectLink(id) {
    const link = getBoard()?.module_links?.find((item) => item.id === id);
    if (!link) return false;
    $("part-select").value = "";
    $("net-select").value = link.net;
    getScene()?.highlight({ jumpers: [link.id] });
    $("inspection").innerHTML =
      `<p class="inspection-label">Short insulated module wire</p><h2>${hole(link.hole)} → ${esc(destination(link))}</h2><p>Lap-solder one stripped end at carrier joint ${hole(link.hole)}. Connect the other end to the actual <strong>${esc(destination(link))}</strong> pad or header pin. Keep the span insulated and leave enough slack to lift the module for inspection.</p><p>${netButton(link.net)}</p><p>The 3D endpoint is a labeled connection callout. It does not identify a measured physical pin position. Check the printed labels on your purchased module.</p>`;
    return true;
  }
  function renderPreparation(board) {
    const shopping = board.shopping_list || [];
    $("carrier-shopping").hidden = !current() || !shopping.length;
    $("carrier-shopping").innerHTML =
      `<p class="eyebrow">Buy and identify before soldering</p><h2>Parts for this revision.</h2><p>R6 uses new charging, regulation and MOSFET parts. Do not populate it from the historical R5 list.</p><div class="table-scroll" tabindex="0" role="region" aria-label="R6 parts to buy"><table><thead><tr><th>Quantity / reference</th><th>Part</th><th>Check before fitting</th></tr></thead><tbody>${shopping.map((part) => `<tr><td>${esc(part.quantity)} · ${esc(part.ref)}</td><td>${part.url ? `<a href="${esc(part.url)}">${esc(part.label)}</a>` : esc(part.label)}</td><td>${esc(Array.isArray(part.notes) ? part.notes.join(" ") : part.notes || "")}</td></tr>`).join("")}</tbody></table></div>`;
    const checks = board.bringup || [];
    $("carrier-bringup").hidden = !current() || !checks.length;
    $("carrier-bringup").innerHTML =
      `<p class="eyebrow">R6 prototype / physical verification pending</p><h2>Bring up one board in this order.</h2><ol>${checks.map((step) => `<li>${esc(typeof step === "string" ? step : step.text)}</li>`).join("")}</ol><p><a href="CARRIER_GUIDE.md">Complete build and qualification instructions</a> · <a href="FIRMWARE_GUIDE.md">Firmware and USB procedure</a></p>`;
  }
  function welcome() {
    const board = getBoard();
    $("inspection").innerHTML =
      `<p class="inspection-label">${current() ? "R6 prototype / physical verification pending" : "Historical carrier reference"}</p><h2>One board. Every connection.</h2><p>${current() ? "UMLIFE USB-C charging with the whole device fully off, separate regulated 5 V and 12 V branches, a MOSFET latch and five independent LED channels. Shut down before connecting charger USB; black LEDs alone are not shutdown. Leave the device off until charger USB is unplugged." : "Earlier ESP, charger, boost, latch and LED driver arrangement."} Choose a module or individual component to inspect its connections.</p><p>Assembly steps cover ${board.components.length} components or adapters and ${board.modules.length} purchased modules. Every leg and named solder joint needs its listed connection.</p><p>Package drawings and nominal clearances do not qualify physical fit or powered operation. Check the actual parts before copying a prototype.</p>`;
  }
  return { render, inspectModule, inspectLink, inspectConnector, welcome };
};
