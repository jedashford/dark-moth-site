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
    system: "Earlier R5 electronics · original PCB assembly",
    pcb: "Earlier manufactured latch PCB · 94 × 60 mm",
    "part:module_esp": "Main controller · ESP32-C3 SuperMini",
    "part:module_charger": "Charger & battery protection · TP4056",
    "part:module_boost": "12 V boost supply · MT3608",
    "part:battery": "Battery · 1S LiPo",
    "part:led_strip": "Light source · RGBWW LED strip",
    "part:remote_switch": "Remote side button & connector",
  };
  function welcome() {
    if (currentMode !== "system") {
      const id = currentMode === "pcb" ? "pcb_main" : currentMode.slice(5);
      const part = catalog.find((item) => item.id === id);
      $("inspection").innerHTML =
        `<p class="inspection-label">Earlier assembly · part reference</p><h2>${esc(currentTitle)}</h2><p>${esc(part?.description || "Inspect every modeled part in this reference view.")}</p><p>Module package and pad positions are nominal. Use actual printed pad labels when wiring the carrier.</p>${id === "pcb_main" ? '<p>This large latch PCB belongs to the earlier case arrangement. The new carrier contains its latch circuit alongside the ESP, charger, boost and LED driver, so this PCB is not required.</p><button type="button" class="pin-link" data-open-mode="carrier">See the 18 × 24 carrier →</button>' : ""}`;
      return;
    }
    $("inspection").innerHTML =
      '<p class="inspection-label">Earlier R5 arrangement</p><h2>Why the large empty board?</h2><p>The <strong>94 × 60 mm PCB</strong> is an earlier latch-only design mounted on the old case posts. The ESP, charger and boost were separate modules around it.</p><p>The new <strong>18 × 24 carrier</strong> mounts those modules with the latch and LED driver on one board. The large PCB is not required; battery, LED strip and remote button remain cabled.</p><button type="button" class="pin-link" data-open-mode="carrier">Build all five circuits on one board →</button>';
  }
  function inspect(id) {
    const item = catalog.find((part) => part.id === id || part.part_id === id);
    if (!item) return;
    $("part-select").value = id;
    getScene()?.highlight({ component: id });
    const endpoints = item.endpoints || [];
    $("inspection").innerHTML =
      `<p class="inspection-label">Earlier assembly · ${esc(item.reference || item.category)}</p><h2>${esc(item.label)}</h2><p>${esc(item.description)}</p>${endpoints.length ? `<h3>Earlier assembly endpoints</h3><ul>${endpoints.map((end) => `<li>${esc(Array.isArray(end) ? end.join(" ↔ ") : String(end))}</li>`).join("")}</ul>` : ""}<p>${esc(item.confidence)}</p><button type="button" class="pin-link" data-open-mode="part:${esc(id)}">View this part on its own</button>${id === "pcb_main" || id.startsWith("pcb_") ? '<p><button type="button" class="pin-link" data-open-mode="carrier">Build this circuit on the new carrier →</button></p>' : ""}`;
  }
  function present(mode, data) {
    catalog = data.catalog;
    currentMode = mode;
    currentTitle = titles[mode] || data.model.board.name;
    $("board-dimensions").textContent =
      `${titles[mode] || data.model.board.name} · ${catalog.length} selectable parts`;
    $("system-title").textContent = titles[mode] || data.model.board.name;
    $("system-note").innerHTML =
      '<strong>Earlier R5 assembly reference.</strong> These models retain the original manufactured PCB and case positions. The <button type="button" data-open-mode="carrier">18 × 24 carrier</button> mounts the ESP, charger and boost with the latch and LED driver on one board; the large old PCB is not required. Battery, LED strip and remote button remain cabled. Module bodies and pad positions here are nominal; they are not carrier mounting-hole coordinates.';
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
