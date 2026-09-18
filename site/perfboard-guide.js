(function () {
  const $ = (id) => document.getElementById(id);
  const state = window.DarkMothPerfboardState;
  const esc = (value) =>
    String(value).replace(
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
  const hole = (value) => `<span class="hole-tag">${esc(value)}</span>`;
  const netButton = (net) =>
    `<button type="button" class="pin-link" data-net="${esc(net)}">${esc(net)}</button>`;
  let boards = [],
    board,
    scene,
    sequence = [],
    stepIndex = -1;
  function selection(info) {
    if (stepIndex >= 0) endSteps();
    if (info.type === "component") inspectPart(info.component || info.id);
    else if (info.type === "jumper") inspectWire(info.id);
    else if (info.net) inspectNet(info.net, info);
    else
      $("inspection").innerHTML =
        `<p class="inspection-label">Isolated copper pad</p><h2>${hole(info.hole || info.id)}</h2><p>No component or wire is assigned here. This pad does not connect to its neighbors.</p>`;
  }
  function resetSelectors() {
    $("part-select").value = "";
    $("net-select").value = "";
  }
  function inspectPart(ref) {
    const part = board.components.find((item) => item.ref === ref);
    if (!part) return;
    resetSelectors();
    $("part-select").value = ref;
    if (scene) scene.highlight({ component: ref });
    $("inspection").innerHTML =
      `<p class="inspection-label">Component · ${esc(part.mounting.replaceAll("_", " "))}</p><h2>${esc(ref)} <small>${esc(part.value)}</small></h2><p>${esc(part.notes.join(" "))}</p><h3>Put each identified leg here</h3><ul>${part.pins.map((pin) => `<li><strong>${esc(pin.role)}</strong> → ${hole(pin.hole)}<br />${netButton(pin.net)}</li>`).join("")}</ul>${part.pin_order_status ? `<p>${esc(part.pin_order_status)}</p>` : "<p>Each end belongs to a different net. Do not add a wire across this component.</p>"}`;
  }
  function inspectNet(net, selected) {
    const definition = board.nets.find((item) => item.id === net);
    resetSelectors();
    $("net-select").value = net;
    if (scene) scene.highlight({ net });
    const items = state.members(board, net),
      wires = board.jumpers.filter((item) => item.net === net);
    $("inspection").innerHTML =
      `<p class="inspection-label">One electrically connected net</p><h2>${esc(net)}</h2>${selected && selected.hole ? `<p>Selected ${hole(selected.hole)}${selected.role ? ` · ${esc(selected.component)} ${esc(selected.role)}` : ""}</p>` : ""}<p>${esc(definition ? definition.meaning : "Every listed point must be joined by the specified wiring.")}</p><h3>All of these points join together</h3><ul>${items.map((item) => `<li>${hole(item.hole)} ${esc(item.label)}</li>`).join("")}</ul><p>${wires.length} underside wire${wires.length === 1 ? "" : "s"} in this net. Nearby pads and crossing wires do not connect automatically.</p>${net === "GND" ? "<p><strong>This bus can be shared.</strong> It includes every source and pulldown ground end on the driver. Each gate and drain stays separate.</p>" : ""}`;
  }
  function inspectWire(id) {
    const wire = board.jumpers.find((item) => item.id === id);
    if (!wire) return;
    resetSelectors();
    $("net-select").value = wire.net;
    if (scene) scene.highlight({ jumper: id });
    $("inspection").innerHTML =
      `<p class="inspection-label">Insulated underside jumper</p><h2>${hole(wire.from)} → ${hole(wire.to)}</h2><p>${esc(wire.id)} · ${netButton(wire.net)}</p><p>${wire.connection_style === "continuous_ground_bus" ? "Continue one insulated bus through C2, C4, C6, C8, C10 and C13. Strip small windows at those pads only. Solder this segment at its two named pads and check continuity." : "Solder the stripped ends to these two pads or their trimmed component leads. Keep insulation along the span, including every crossing. Check continuity between both endpoints."}</p><p>This wire joins the <strong>${esc(wire.net)}</strong> net. Its drawn route is illustrative; choose a short practical route without bare crossings.</p>`;
  }
  function renderTerminals() {
    const variant = $("esp-select").value;
    $("controller-note").textContent =
      `Showing ESP32-${variant} GPIO numbers. Use this same controller choice throughout both boards. Verify your module's printed pin labels; physical header order varies.`;
    $("terminal-rows").innerHTML = state
      .terminalRows(board, variant)
      .map(
        (item) =>
          `<tr><td>${hole(item.hole)}</td><td>${esc(item.net)}</td><td>${esc(item.destination)}</td><td>${esc(item.label)}<br /><small>${esc(item.attachment)}</small></td></tr>`,
      )
      .join("");
  }
  function setView(view) {
    if (scene) scene.setView(view);
    document
      .querySelectorAll("[data-view]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.view === view),
        ),
      );
    $("view-caption").textContent =
      view === "bottom"
        ? "SOLDER SIDE · A1 is upper-right. Same holes, physically flipped."
        : view === "top"
          ? "COMPONENT SIDE · A1 is upper-left. Rows increase downward."
          : "Drag to rotate · scroll to zoom · select any part";
  }
  function endSteps() {
    stepIndex = -1;
    $("step-controls").hidden = true;
    $("start-steps").textContent = "Start assembly steps";
    if (scene) scene.showStep(null);
  }
  function showStep(index) {
    stepIndex = Math.max(0, Math.min(sequence.length - 1, index));
    const step = sequence[stepIndex];
    $("step-controls").hidden = false;
    $("start-steps").textContent = "Exit assembly steps";
    $("step-select").value = String(stepIndex);
    $("step-text").textContent = step.text;
    $("previous-step").disabled = stepIndex === 0;
    $("next-step").disabled = stepIndex === sequence.length - 1;
    $("layer-select").value = "all";
    if (scene) {
      scene.setLayerMode("all");
      scene.showStep(step);
    }
    if (step.component) {
      setView("top");
      inspectPart(step.component);
    } else if (step.jumper) {
      setView("bottom");
      inspectWire(step.jumper);
    } else {
      if (scene) scene.highlight({});
      resetSelectors();
      $("inspection").innerHTML =
        `<p class="inspection-label">Assembly · ${stepIndex + 1} of ${sequence.length}</p><h2>${esc(step.label)}</h2><p>${esc(step.text)}</p>`;
      if (step.type === "prepare") setView("top");
    }
  }
  function loadBoard(id) {
    board = boards.find((item) => item.id === id) || boards[0];
    $("board-select").value = board.id;
    endSteps();
    if (scene) {
      scene.loadBoard(board);
      scene.setLayerMode("all");
    }
    $("layer-select").value = "all";
    setView("angle");
    $("board-dimensions").textContent =
      `${board.name} · ${board.columns} × ${board.rows.length} holes · 2.54 mm pitch`;
    $("board-fit-note").textContent = board.case_fit;
    $("top-map").href = `electronics/perfboard-${board.id}-top.svg`;
    $("bottom-map").href = `electronics/perfboard-${board.id}-bottom.svg`;
    $("part-select").innerHTML =
      '<option value="">Choose a component…</option>' +
      board.components
        .map(
          (part) =>
            `<option value="${esc(part.ref)}">${esc(part.ref)} · ${esc(part.value)}</option>`,
        )
        .join("");
    $("net-select").innerHTML =
      '<option value="">Choose a net…</option>' +
      board.nets
        .map(
          (net) =>
            `<option value="${esc(net.id)}">${esc(net.id)} · ${esc(net.label)}</option>`,
        )
        .join("");
    $("component-rows").innerHTML = board.components
      .flatMap((part) =>
        part.pins.map(
          (pin) =>
            `<tr><td>${esc(part.ref)}</td><td>${esc(part.value)}</td><td>${esc(pin.role)}</td><td>${hole(pin.hole)}</td><td>${esc(pin.net)}</td></tr>`,
        ),
      )
      .join("");
    $("wire-rows").innerHTML = board.jumpers
      .map(
        (wire) =>
          `<tr><td>${esc(wire.id)}</td><td>${hole(wire.from)}</td><td>${hole(wire.to)}</td><td>${esc(wire.net)}</td></tr>`,
      )
      .join("");
    renderTerminals();
    sequence = state.steps(board);
    $("step-select").innerHTML = sequence
      .map(
        (step, index) =>
          `<option value="${index}">${index + 1}/${sequence.length} · ${esc(step.label)}</option>`,
      )
      .join("");
    $("inspection").innerHTML =
      '<p class="inspection-label">Start here</p><h2>Follow one leg.</h2><p>Select a component, leg or wire on the board. Or choose a part above for every leg’s exact hole.</p><p>Try <strong>Trace shared ground</strong> to see which points can share the same wire network.</p><p>The model shows electrical roles. Actual transistor pin order and component dimensions must be checked against the parts in your hand.</p>';
  }
  async function start() {
    try {
      const response = await window.fetch("electronics/perfboard-layout.json");
      if (!response.ok)
        throw new Error(`Layout request failed (${response.status})`);
      const data = await response.json();
      boards = data.boards;
      $("module-rows").innerHTML = data.module_connections
        .map(
          (wire) =>
            `<tr><td>${esc(wire.from)}</td><td>${esc(wire.to)}</td><td>${esc(wire.net)}</td></tr>`,
        )
        .join("");
      try {
        scene = window.DarkMothPerfboardScene($("board-canvas"), {
          onSelect: selection,
        });
        $("loading-message").remove();
      } catch (error) {
        $("loading-message").textContent =
          "3D is unavailable on this browser. The exact component, wire and terminal tables below still work, and both printable board views are available.";
        window.console.warn("Perfboard WebGL fallback", error);
      }
      loadBoard(
        new URLSearchParams(window.location.search).get("board") || "driver",
      );
      $("board-select").addEventListener("change", (event) =>
        loadBoard(event.target.value),
      );
      $("esp-select").addEventListener("change", renderTerminals);
      $("layer-select").addEventListener("change", (event) => {
        if (scene) scene.setLayerMode(event.target.value);
      });
      $("part-select").addEventListener("change", (event) => {
        endSteps();
        inspectPart(event.target.value);
      });
      $("net-select").addEventListener("change", (event) => {
        endSteps();
        inspectNet(event.target.value);
      });
      $("show-ground").addEventListener("click", () => {
        endSteps();
        inspectNet("GND");
      });
      $("clear-selection").addEventListener("click", () => {
        endSteps();
        resetSelectors();
        if (scene) {
          scene.highlight({});
          scene.setLayerMode("all");
        }
        $("layer-select").value = "all";
        $("inspection").innerHTML =
          "<h2>All parts and wires</h2><p>Select a part or trace a net to inspect its connections.</p>";
      });
      $("inspection").addEventListener("click", (event) => {
        const button = event.target.closest("[data-net]");
        if (button) {
          endSteps();
          inspectNet(button.dataset.net);
        }
      });
      document
        .querySelectorAll("[data-view]")
        .forEach((button) =>
          button.addEventListener("click", () => setView(button.dataset.view)),
        );
      $("start-steps").addEventListener("click", () =>
        stepIndex < 0 ? showStep(0) : endSteps(),
      );
      $("previous-step").addEventListener("click", () =>
        showStep(stepIndex - 1),
      );
      $("next-step").addEventListener("click", () => showStep(stepIndex + 1));
      $("step-select").addEventListener("change", (event) =>
        showStep(Number(event.target.value)),
      );
      document.documentElement.dataset.perfboardReady = "true";
    } catch (error) {
      let message = $("loading-message");
      if (!message) {
        message = document.createElement("p");
        message.id = "loading-message";
        $("board-canvas").replaceChildren(message);
      }
      if (scene && scene.dispose) scene.dispose();
      message.textContent =
        "Interactive data could not load. Use the written guide and printable maps below.";
      window.console.error(error);
    }
  }
  start();
})();
