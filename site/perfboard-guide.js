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
    stepIndex = -1,
    requestId = 0,
    mode = "carrier";
  const panel = window.DarkMothElectronicsPanel({
    getScene: () => scene,
    openMode: chooseMode,
  });
  const carrierPanel = window.DarkMothCarrierPanel({
    getBoard: () => board,
    getScene: () => scene,
    getVariant: () => $("esp-select").value,
    esc,
    hole,
    netButton,
  });
  const isPerfboard = () => boards.some((item) => item.id === mode);
  async function chooseMode(id) {
    const ticket = ++requestId;
    mode = id;
    endSteps();
    const handwired = isPerfboard();
    $("board-canvas").dataset.overviewReady = "false";
    $("board-canvas").classList.toggle("loading-model", !handwired);
    const selector = $("board-select");
    selector.querySelector("option[data-part-detail]")?.remove();
    if (![...selector.options].some((option) => option.value === id)) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = "Selected part";
      option.dataset.partDetail = "true";
      selector.append(option);
    }
    selector.value = id;
    document.querySelectorAll("[data-perfboard-only]").forEach((element) => {
      element.hidden = !handwired;
    });
    document.querySelectorAll("[data-carrier-only]").forEach((element) => {
      element.hidden = id !== "carrier";
    });
    document
      .querySelectorAll("[data-legacy-perfboard-only]")
      .forEach((element) => {
        element.hidden = !handwired || id === "carrier";
      });
    $("board-canvas").dataset.carrierReady = "false";
    $("system-reference").hidden = handwired;
    $("system-note").hidden = handwired;
    $("net-select").parentElement.hidden = !handwired;
    $("show-ground").hidden = !handwired;
    $("esp-select").parentElement.hidden = !handwired;
    $("layer-select").value = "all";
    $("layer-select").options[2].textContent = handwired
      ? "Underside connections only"
      : "Connections only";
    document.querySelector('button[data-view="top"]').textContent = handwired
      ? "Component side"
      : "Top";
    document.querySelector('button[data-view="bottom"]').textContent = handwired
      ? "Solder side"
      : "Underside";
    if (handwired) {
      loadBoard(id);
      if (id === "carrier" && scene) {
        $("board-canvas").classList.add("loading-model");
        try {
          const model = await window.DarkMothPerfboardCarrier.build(board);
          if (ticket !== requestId) {
            window.DarkMothPerfboardGeometry.dispose(model);
            return;
          }
          scene.loadModel(model);
          if (stepIndex >= 0) showStep(stepIndex);
          else {
            scene.setLayerMode($("layer-select").value);
            setView($("board-canvas").dataset.view || "angle");
            const ref = $("part-select").value,
              net = $("net-select").value;
            if (ref) inspectPart(ref);
            else if (net) inspectNet(net);
          }
          $("board-canvas").dataset.carrierReady = "true";
        } catch (error) {
          if (ticket !== requestId) return;
          $("inspection").innerHTML =
            "<h2>Module models unavailable</h2><p>The carrier and exact wiring tables still work. Reload to retry loading the three purchased modules.</p>";
          window.console.error(error);
        }
        $("board-canvas").classList.remove("loading-model");
      }
      return;
    }
    board = null;
    $("board-dimensions").textContent = "Loading the complete electronics…";
    $("inspection").textContent =
      "Loading the original main PCB, controller and modules…";
    try {
      const data = await window.DarkMothElectronicsOverview.load(id);
      if (ticket !== requestId) {
        window.DarkMothPerfboardGeometry.dispose(data.model);
        return;
      }
      if (scene) scene.loadModel(data.model);
      else window.DarkMothPerfboardGeometry.dispose(data.model);
      scene?.setLayerMode("all");
      panel.present(id, data);
      const detailOption = selector.querySelector("option[data-part-detail]");
      if (detailOption) detailOption.textContent = data.model.board.name;
      setView("angle");
      $("board-canvas").classList.remove("loading-model");
      $("board-canvas").dataset.overviewReady = "true";
    } catch (error) {
      if (ticket !== requestId) return;
      $("board-dimensions").textContent = "Electronics model unavailable";
      $("inspection").innerHTML =
        '<h2>Electronics model unavailable</h2><p>Choose a perfboard layout to continue, or <a href="index.html?mode=internals#explore">open the complete-device viewer</a>.</p>';
      window.console.error(error);
    }
  }
  function selection(info) {
    if (!isPerfboard()) {
      panel.inspect(info.component || info.id);
      return;
    }
    if (stepIndex >= 0) endSteps();
    if (info.type === "module")
      carrierPanel.inspectModule(info.module || info.component, info.label);
    else if (info.type === "module-link")
      carrierPanel.inspectLink(info.jumper || info.id);
    else if (info.type === "component") inspectPart(info.component || info.id);
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
    if (carrierPanel.inspectModule(ref)) return;
    const part = board.components.find((item) => item.ref === ref);
    if (!part) return;
    resetSelectors();
    $("part-select").value = ref;
    if (scene) scene.highlight({ component: ref });
    $("inspection").innerHTML =
      `<p class="inspection-label">Component · ${esc(part.mounting.replaceAll("_", " "))}</p><h2>${esc(ref)} <small>${esc(part.value)}</small></h2><p>${esc(state.componentInstructions(board, part))}</p><h3>Put each identified leg here</h3><ul>${part.pins.map((pin) => `<li><strong>${esc(pin.role)}</strong> → ${hole(pin.hole)}<br />${netButton(pin.net)}</li>`).join("")}</ul>${part.pin_order_status ? `<p>${esc(part.pin_order_status)}</p>` : "<p>Each end belongs to a different net. Do not add a wire across this component.</p>"}`;
  }
  function inspectNet(net, selected) {
    const definition = board.nets.find((item) => item.id === net);
    resetSelectors();
    $("net-select").value = net;
    if (scene) scene.highlight({ net });
    const items = state.members(board, net),
      wires = board.jumpers.filter((item) => item.net === net),
      counts = state.connectionCounts({ ...board, jumpers: wires });
    $("inspection").innerHTML =
      `<p class="inspection-label">One electrically connected net</p><h2>${esc(net)}</h2>${selected && selected.hole ? `<p>Selected ${hole(selected.hole)}${selected.role ? ` · ${esc(selected.component)} ${esc(selected.role)}` : ""}</p>` : ""}<p>${esc(definition ? definition.meaning : "Every listed point must be joined by the specified wiring.")}</p><h3>All of these points join together</h3><ul>${items.map((item) => `<li>${hole(item.hole)} ${esc(item.label)}</li>`).join("")}</ul><p>${counts.retainedLeads} reused component leads and ${counts.addedWires} added wire pieces in this net. Nearby pads and crossing wires do not connect automatically.</p>${net === "GND" ? "<p><strong>This bus can be shared.</strong> Every listed ground leg needs a joint to this network. Gate and drain connections stay on their own named nets.</p>" : ""}`;
  }
  function inspectWire(id) {
    if (carrierPanel.inspectLink(id)) return;
    const wire = state
      .connections(board)
      .find((item) => item.id === id || item.ids.includes(id));
    if (!wire) return;
    resetSelectors();
    $("net-select").value = wire.net;
    if (scene) scene.highlight({ jumpers: wire.ids });
    const connection = state.connectionInfo(board, wire);
    $("inspection").innerHTML =
      `<p class="inspection-label">${esc(connection.label)}</p><h2>${hole(wire.from)} → ${hole(wire.to)}</h2><p>${esc(wire.id)} · ${netButton(wire.net)}</p><p>${esc(connection.text)}</p><h3>All soldered pads on this conductor</h3><p>${connection.joinedHoles.map(hole).join(" → ")}</p><p>These pads join <strong>${esc(wire.net)}</strong>. Other crossings do not connect.</p>`;
  }
  function renderTerminals() {
    const variant = $("esp-select").value;
    $("controller-note").textContent =
      `Showing ESP32-${variant} GPIO numbers. Use this same controller choice throughout the selected layout. Verify your module's printed pin labels; physical header order varies.`;
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
      .querySelectorAll("button[data-view]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.view === view),
        ),
      );
    $("view-caption").textContent =
      view === "angle"
        ? "Drag freely in any direction · scroll to zoom · click to select"
        : !isPerfboard()
          ? `${view === "top" ? "TOP" : "UNDERSIDE"} · fixed view; choose 3D to rotate`
          : view === "bottom"
            ? "SOLDER SIDE · A1 is upper-right. Fixed view; choose 3D to rotate."
            : "COMPONENT SIDE · A1 is upper-left. Fixed view; choose 3D to rotate.";
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
    if (step.type === "module") {
      setView("angle");
      carrierPanel.inspectModule(step.module);
    } else if (step.type === "module-link") {
      setView("angle");
      carrierPanel.inspectLink(step.moduleLink);
    } else if (step.component) {
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
      `${board.name.replace(/ · \d+ × \d+ holes$/, "")} · ${board.columns} × ${board.rows.length} holes · 2.54 mm pitch`;
    $("board-fit-note").textContent = board.case_fit;
    const counts = state.connectionCounts(board);
    $("connection-summary").textContent =
      `${counts.retainedLeads} reused component leads · ${counts.addedWires} added wire pieces (${counts.insulatedWires} links + ${counts.busWires} ground bus). External module cables are additional.`;
    $("top-map").href = `electronics/perfboard-${board.id}-top.svg`;
    $("bottom-map").href = `electronics/perfboard-${board.id}-bottom.svg`;
    $("part-select").innerHTML =
      '<option value="">Choose a component…</option>' +
      [
        ...(board.modules || []).map((part) => ({
          ...part,
          value: part.label,
        })),
        ...board.components,
      ]
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
    $("wire-rows").innerHTML = state
      .connections(board)
      .map((wire) => {
        const connection = state.connectionInfo(board, wire);
        return `<tr><td>${esc(wire.id)}</td><td>${esc(connection.label)}</td><td>${connection.joinedHoles.map(hole).join(" → ")}</td><td>${esc(wire.net)}</td></tr>`;
      })
      .join("");
    renderTerminals();
    carrierPanel.render();
    if (board.modules)
      $("connection-summary").textContent =
        `${counts.retainedLeads} reused component leads · ${counts.addedWires} internal wire pieces · ${board.module_links.length} short module wires. Battery, LED and remote-button cables are additional.`;
    sequence = state.steps(board);
    $("step-select").innerHTML = sequence
      .map(
        (step, index) =>
          `<option value="${index}">${index + 1}/${sequence.length} · ${esc(step.label)}</option>`,
      )
      .join("");
    $("inspection").innerHTML =
      '<p class="inspection-label">Start here</p><h2>Follow one leg.</h2><p>Select a component, leg or wire on the board. Or choose a part above for every leg’s exact hole. Retain the leads marked “do not trim” for direct joints underneath.</p><p>Try <strong>Trace shared ground</strong> to see which points can share the same wire network.</p><p>The model shows electrical roles. Actual transistor pin order and component dimensions must be checked against the parts in your hand.</p>';
    if (board.modules) carrierPanel.welcome();
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
      $("board-select").addEventListener("change", (event) =>
        chooseMode(event.target.value),
      );
      $("esp-select").addEventListener("change", () => {
        renderTerminals();
        carrierPanel.render();
        const ref = $("part-select").value;
        if (!carrierPanel.inspectModule(ref) && board.modules)
          carrierPanel.welcome();
      });
      $("carrier-reference").addEventListener("click", (event) => {
        const module = event.target.closest("[data-carrier-module]");
        const net = event.target.closest("[data-net]");
        endSteps();
        if (module) carrierPanel.inspectModule(module.dataset.carrierModule);
        else if (net) inspectNet(net.dataset.net);
      });
      $("layer-select").addEventListener("change", (event) => {
        if (scene) scene.setLayerMode(event.target.value);
      });
      $("part-select").addEventListener("change", (event) => {
        endSteps();
        if (isPerfboard()) inspectPart(event.target.value);
        else panel.inspect(event.target.value);
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
        if (!isPerfboard()) {
          panel.clear();
          scene?.setLayerMode("all");
          $("layer-select").value = "all";
          return;
        }
        endSteps();
        resetSelectors();
        if (scene) {
          scene.highlight({});
          scene.setLayerMode("all");
        }
        $("layer-select").value = "all";
        $("inspection").innerHTML =
          "<h2>All parts and wires</h2><p>Select a part or trace a net to inspect its connections.</p>";
        if (board.modules) carrierPanel.welcome();
      });
      $("inspection").addEventListener("click", (event) => {
        const button = event.target.closest("[data-net]");
        if (button) {
          endSteps();
          inspectNet(button.dataset.net);
        }
      });
      document
        .querySelectorAll("button[data-view]")
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
      await chooseMode(
        new URLSearchParams(window.location.search).get("board") || "carrier",
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
