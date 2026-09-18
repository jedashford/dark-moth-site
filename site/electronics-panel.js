// Complete-device inventory for the same workbench used by the hand-wired boards.
window.DarkMothElectronicsPanel = ({ getScene, openMode }) => {
  const $ = (id) => document.getElementById(id);
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  let catalog = [];
  const titles = {
    system: "All electronics · original PCB assembly",
    pcb: "Main power-latch PCB · original manufactured board",
    "part:module_esp": "Main controller · ESP32-C3 SuperMini",
    "part:module_charger": "Charger & battery protection · TP4056",
    "part:module_boost": "12 V boost supply · MT3608",
    "part:battery": "Battery · 1S LiPo",
    "part:led_strip": "Light source · RGBWW LED strip",
    "part:remote_switch": "Remote side button & connector",
  };
  function welcome() {
    $("inspection").innerHTML =
      '<p class="inspection-label">The whole electronic system</p><h2>Find the main board.</h2><p><strong>ESP32-C3</strong> is the controller. The large <strong>94 × 60 mm PCB</strong> carries the power latch and button-sensing circuit.</p><p>The power-latch perfboard is an alternative way to build that large PCB’s circuit. You do not need both.</p><p>Choose any module above to see it alone, or select a part or wire here for its role and connections.</p>';
  }
  function inspect(id) {
    const item = catalog.find((part) => part.id === id || part.part_id === id);
    if (!item) return;
    $("part-select").value = id;
    getScene()?.highlight({ component: id });
    const endpoints = item.endpoints || [];
    $("inspection").innerHTML =
      `<p class="inspection-label">${esc(item.reference || item.category)}</p><h2>${esc(item.label)}</h2><p>${esc(item.description)}</p>${endpoints.length ? `<h3>Connected endpoints</h3><ul>${endpoints.map((end) => `<li>${esc(Array.isArray(end) ? end.join(" ↔ ") : String(end))}</li>`).join("")}</ul>` : ""}<p>${esc(item.confidence)}</p><button type="button" class="pin-link" data-open-mode="part:${esc(id)}">View this part on its own</button>${id === "pcb_main" || id.startsWith("pcb_") ? '<p><button type="button" class="pin-link" data-open-mode="latch">Build this circuit on perfboard →</button></p>' : ""}`;
  }
  function present(mode, data) {
    catalog = data.catalog;
    $("board-dimensions").textContent =
      `${titles[mode] || data.model.board.name} · ${catalog.length} selectable parts`;
    $("system-title").textContent = titles[mode] || data.model.board.name;
    $("system-note").innerHTML =
      '<strong>This is the complete electronics reference.</strong> The assembly shows the manufactured main PCB. When building on blank green boards, the <button type="button" data-open-mode="latch">power-latch perfboard replaces that PCB</button>; the ESP controller, charger, boost converter, battery, LEDs and side button are separate parts. The module models show the C3 reference and nominal purchased-part shapes.';
    $("part-select").innerHTML =
      '<option value="">Choose any component or wire…</option>' +
      catalog
        .map(
          (item) =>
            `<option value="${esc(item.id || item.part_id)}">${esc(item.reference || "")} · ${esc(item.label)}</option>`,
        )
        .join("");
    $("system-rows").innerHTML = catalog
      .map(
        (item) =>
          `<tr><td><button type="button" data-inspect-system="${esc(item.id || item.part_id)}">${esc(item.reference || item.id || item.part_id)}</button></td><td>${esc(item.label)}</td><td>${esc(item.description)}</td></tr>`,
      )
      .join("");
    welcome();
  }
  function clear() {
    $("part-select").value = "";
    getScene()?.highlight({});
    welcome();
  }
  document.addEventListener("click", (event) => {
    const open = event.target.closest("[data-open-mode]");
    const pick = event.target.closest("[data-inspect-system]");
    if (open) openMode(open.dataset.openMode);
    else if (pick) {
      inspect(pick.dataset.inspectSystem);
      $("workbench").scrollIntoView({ block: "start" });
    }
  });
  return { present, inspect, clear };
};
