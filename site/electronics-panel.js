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
  let catalog = [],
    currentMode = "system",
    currentTitle = "";
  const titles = {
    system: "R6 electronics · current assembly",
    pcb: "R6 populated carrier",
    "part:module_esp": "Main controller · ESP32-C3 SuperMini",
    "part:module_charger": "USB-C charger · UMLIFE 18 × 14 mm",
    "part:module_reg5": "ESP 5 V supply · Pololu U3V16F5",
    "part:module_reg12": "LED 12 V supply · Pololu U3V16F12",
    "part:battery": "Battery · 1S LiPo",
    "part:led_strip": "Light source · RGBWW LED strip",
    "part:remote_switch": "Remote side button & connector",
  };
  function welcome() {
    if (currentMode !== "system") {
      const id = currentMode === "pcb" ? "pcb_carrier" : currentMode.slice(5);
      const part = catalog.find((item) => item.id === id);
      $("inspection").innerHTML =
        `<p class="inspection-label">R6 prototype / physical verification pending</p><h2>${esc(currentTitle)}</h2><p>${esc(part?.description || "Inspect every modeled part in this reference view.")}</p><p>Module package and pad positions are nominal. Use actual printed pad labels when wiring the carrier.</p>${id === "pcb_carrier" ? '<p>This is the current populated carrier. Use its exact-hole workbench to identify every component leg, connection and construction step.</p><button type="button" class="pin-link" data-open-mode="carrier">See the 18 × 24 carrier →</button>' : ""}`;
      return;
    }
    $("inspection").innerHTML =
      '<p class="inspection-label">R6 prototype / physical verification pending</p><h2>Every current assembly part.</h2><p>The <strong>18 × 24 carrier</strong> combines the latch and five LED drivers with the ESP, UMLIFE USB-C charger and separate 5 V and 12 V regulators. The protected battery, LED strip and normally-open button connect through three detachable plugs.</p><p>Shut the whole device down before connecting charger USB, and leave it off until USB is unplugged. Black LEDs alone are not shutdown.</p><p>Select any part for its role and modeling confidence. Use the workbench for exact holes; the model alone does not qualify physical fit or powered operation.</p><button type="button" class="pin-link" data-open-mode="carrier">Follow every carrier connection →</button>';
  }
  function inspect(id) {
    const item = catalog.find((part) => part.id === id || part.part_id === id);
    if (!item) return;
    $("part-select").value = id;
    getScene()?.highlight({ component: id });
    const endpoints = item.endpoints || [];
    $("inspection").innerHTML =
      `<p class="inspection-label">R6 assembly · ${esc(item.reference || item.category)}</p><h2>${esc(item.label)}</h2><p>${esc(item.description)}</p>${endpoints.length ? `<h3>Declared connection endpoints</h3><ul>${endpoints.map((end) => `<li>${esc(Array.isArray(end) ? end.join(" ↔ ") : String(end))}</li>`).join("")}</ul>` : ""}<p>${esc(item.confidence)}</p><button type="button" class="pin-link" data-open-mode="part:${esc(id)}">View this part on its own</button>${id === "pcb_carrier" || id.startsWith("pcb_") ? '<p><button type="button" class="pin-link" data-open-mode="carrier">Inspect exact carrier connections →</button></p>' : ""}`;
  }
  function present(mode, data) {
    catalog = data.catalog;
    currentMode = mode;
    currentTitle = titles[mode] || data.model.board.name;
    $("board-dimensions").textContent =
      `${titles[mode] || data.model.board.name} · ${catalog.length} selectable parts`;
    $("system-title").textContent = titles[mode] || data.model.board.name;
    $("system-note").innerHTML =
      '<strong>R6 prototype / physical verification pending.</strong> This is the current assembly inventory. The <button type="button" data-open-mode="carrier">18 × 24 workbench</button> gives exact component holes and electrical roles. Purchased-module envelopes and any logical wire routes retain the confidence stated per part; no unmeasured module header coordinates are implied.';
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
