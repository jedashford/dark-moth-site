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
  const destination = (link) => link.to[getVariant()];
  const linkRows = (links) =>
    links
      .map(
        (link) =>
          `<tr><td>${hole(link.hole)}</td><td>${esc(destination(link))}</td><td>${netButton(link.net)}</td></tr>`,
      )
      .join("");
  const notes = (part) =>
    Array.isArray(part.mounting_notes)
      ? part.mounting_notes.join(" ")
      : part.mounting_notes;
  function render() {
    const board = getBoard();
    if (!board?.modules) return;
    $("carrier-reference").innerHTML =
      `<p class="eyebrow">One carrier · 18 columns · rows A–X</p><h2>Mount these three complete modules.</h2><p>The latch and five LED channels are the 24 individual components on this same board. Do not also build the old manufactured latch PCB or a second driver board. Battery, LED strip and the remote button remain connected by cables.</p><p>The module areas are placement allowances. Their header holes and mounting fixtures are not verified. The detailed ESP model is a C3; the reserved area also allows the nominal 27 × 18 mm S3 envelope. Read the actual module labels when wiring.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Carrier module mounting"><table><thead><tr><th>Complete module</th><th>Position and mounting</th><th>Before soldering</th></tr></thead><tbody>${board.modules.map((part) => `<tr><td><button type="button" class="pin-link" data-carrier-module="${esc(part.ref)}">${esc(part.ref)} · ${esc(part.label)}</button></td><td>${esc(notes(part))}</td><td>${esc(part.pin_position_status)}</td></tr>`).join("")}</tbody></table></div><h3>Carrier hole → printed module label</h3><p>Each row is one short insulated wire. The 3D module callouts show connection roles, not measured pin positions. Solder to the actual printed pad or header pin named in this table. Never solder a module into guessed carrier holes.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Carrier module wire connections"><table><thead><tr><th>Carrier joint</th><th>Actual module label / GPIO</th><th>Net</th></tr></thead><tbody id="carrier-module-rows">${linkRows(board.module_links)}</tbody></table></div><p><a href="electronics/perfboard-carrier-modules.svg" target="_blank" rel="noopener">Print module placement and wiring ↗</a> · <a href="CARRIER_GUIDE.md">Read the one-board build guide</a></p>`;
  }
  function inspectModule(ref, detail) {
    const part = moduleFor(ref);
    if (!part) return false;
    $("part-select").value = ref;
    $("net-select").value = "";
    getScene()?.highlight({ component: ref });
    $("inspection").innerHTML =
      `<p class="inspection-label">Purchased module · ${esc(ref)}</p><h2>${esc(part.label)}</h2>${detail ? `<p>${esc(detail)}</p>` : ""}<p>${esc(notes(part))}</p><p>${esc(part.pin_position_status)}</p><h3>Wire the printed labels</h3><ul>${linksFor(
        ref,
      )
        .map(
          (link) =>
            `<li>${hole(link.hole)} → <strong>${esc(destination(link))}</strong><br />${netButton(link.net)}</li>`,
        )
        .join(
          "",
        )}</ul><p>Use the module as a complete unit. Its modeled small parts are already fitted; do not install duplicates on the carrier.</p>`;
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
  function welcome() {
    $("inspection").innerHTML =
      '<p class="inspection-label">Your 18 × 24 board</p><h2>One board. All five functions.</h2><p>ESP, charging, boost, power latch and LED driver share this carrier. Choose a module or individual component to inspect its connections.</p><p>Start assembly steps to place the 24 discrete components, make their joints, then mount and wire the three purchased modules.</p><p>The raised ESP position and all mounting areas are provisional. Confirm the actual parts, antenna clearance and USB cable access before building.</p>';
  }
  return { render, inspectModule, inspectLink, welcome };
};
