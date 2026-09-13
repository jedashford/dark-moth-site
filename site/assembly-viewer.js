/* global THREE */
(() => {
  "use strict";
  const host = document.getElementById("viewer"),
    status = document.getElementById("viewer-status");
  const info = document.getElementById("part-info"),
    selector = document.getElementById("part-select");
  const slider = document.getElementById("explode-range"),
    toggle = document.getElementById("selected-visible");
  const logic = window.DarkMothAssembly;
  if (!host) return;
  if (!window.THREE || !window.DarkMothScene || !logic) {
    status.textContent =
      "3D is unavailable. The assembly images and downloads remain available.";
    return;
  }
  let stage;
  try {
    stage = window.DarkMothScene(host);
  } catch {
    status.textContent =
      "3D is unavailable in this browser. Use the assembly images below.";
    return;
  }
  const { renderer, scene, camera, controls, pivot, fit } = stage;
  const parts = new Map(),
    originals = new Map();
  const state = {
    mode: "assembled",
    amount: 0,
    target: 0,
    selected: null,
    loaded: false,
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const notes = {
    assembled:
      "Complete prototype. Select a component, screw or wire to inspect it.",
    internals:
      "Case removed. The electronics and fasteners remain in their assembly positions.",
    board:
      "PCB close-up. Use the component list and assembly guide for exact pads and polarity.",
    wiring:
      "Harness view. Select a wire for its endpoints; route and length are illustrative.",
    exploded:
      "Exploded assembly. Spacing is illustrative; wires retain their assembled route.",
    diffuser:
      "Lift the front screws and rail, then slide the acrylic upward. The electronics lid stays fitted.",
    xray: "Translucent case. All installed electronics, fasteners and wiring remain visible.",
  };
  const requested = new URLSearchParams(window.location.search);
  if (Object.hasOwn(notes, requested.get("mode")))
    state.mode = requested.get("mode");
  function meshes(part, fn) {
    part.traverse((o) => {
      if (o.isMesh) fn(o);
    });
  }
  function style(part, transparent = false, selected = false) {
    meshes(part, (mesh) => {
      const original = originals.get(mesh.uuid);
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((material, i) => {
        const saved = original[i];
        material.transparent = transparent || saved.transparent;
        material.opacity = transparent ? 0.14 : saved.opacity;
        material.depthWrite = transparent ? false : saved.depthWrite;
        if (material.emissive)
          material.emissive.setHex(selected ? 0x142c42 : saved.emissive);
      });
      mesh.castShadow = !transparent;
    });
  }
  function updateStyles() {
    for (const [id, part] of parts) {
      const translucent =
        (state.mode === "xray" &&
          ["body", "lid", "rail", "diffuser"].includes(id)) ||
        (state.mode === "wiring" &&
          !["wiring", "connectors"].includes(part.userData.category));
      style(part, translucent, id === state.selected);
    }
  }
  function fitVisible(view = "front") {
    pivot.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    for (const part of parts.values())
      if (part.visible) bounds.expandByObject(part);
    if (!bounds.isEmpty()) fit(bounds, view);
    document
      .querySelectorAll("button[data-view]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.view === view)),
      );
  }
  function move(amount) {
    for (const part of parts.values()) {
      const delta = logic.gltfOffset(
        logic.offset(part.userData, state.mode, amount),
      );
      part.position
        .copy(part.userData.basePosition)
        .add(new THREE.Vector3(...delta));
    }
  }
  function syncCounts() {
    const visible = Array.from(parts.values()).filter((p) => p.visible).length;
    document.getElementById("part-count").textContent =
      `${visible} of ${Array.from(parts.values()).filter((p) => !p.userData.unsupported).length} build parts shown`;
    host.dataset.visibleCount = String(visible);
    document.querySelectorAll("[data-category]").forEach((box) => {
      const members = Array.from(parts.values()).filter(
        (p) =>
          p.userData.category === box.dataset.category &&
          !p.userData.unsupported,
      );
      box.checked = members.every((p) => p.visible);
      box.indeterminate = members.some((p) => p.visible) && !box.checked;
    });
    if (state.selected) toggle.checked = parts.get(state.selected).visible;
  }
  function select(id, zoom = false) {
    const part = parts.get(id);
    if (!part || part.userData.unsupported) return;
    state.selected = id;
    selector.value = id;
    toggle.disabled = false;
    toggle.checked = part.visible;
    const m = part.userData;
    info.textContent = `${m.label || id}. ${m.description || ""} ${m.confidence ? `Model: ${m.confidence}.` : ""}`;
    host.dataset.selectedPart = id;
    updateStyles();
    if (zoom) {
      part.visible = true;
      pivot.updateMatrixWorld(true);
      fit(new THREE.Box3().setFromObject(part), "front");
      syncCounts();
    }
  }
  function setMode(mode) {
    state.mode = mode;
    state.target = ["exploded", "diffuser"].includes(mode) ? 1 : 0;
    slider.value = String(state.target * 100);
    host.dataset.mode = mode;
    document
      .querySelectorAll("button[data-mode]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.mode === mode)),
      );
    if (!state.loaded) return;
    for (const part of parts.values())
      part.visible = logic.visible(part.userData, mode);
    updateStyles();
    move(state.target);
    fitVisible(mode === "board" ? "top" : "front");
    move(state.amount);
    status.textContent = notes[mode];
    syncCounts();
  }
  function reset() {
    state.selected = null;
    selector.value = "";
    toggle.checked = true;
    toggle.disabled = true;
    delete host.dataset.selectedPart;
    info.textContent =
      "Choose a part, or click directly on the model, for its reference and assembly notes.";
    setMode("assembled");
  }
  document
    .querySelectorAll("button[data-mode]")
    .forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  document
    .querySelectorAll("button[data-view]")
    .forEach((b) =>
      b.addEventListener("click", () => fitVisible(b.dataset.view)),
    );
  slider.addEventListener("input", () => {
    const value = Number(slider.value);
    if (!["exploded", "diffuser"].includes(state.mode)) setMode("exploded");
    state.target = value / 100;
    slider.value = String(value);
    status.textContent = `${state.mode === "diffuser" ? "Diffuser removal" : "Exploded view"} — ${value}% separated.`;
  });
  selector.addEventListener("change", () => select(selector.value));
  toggle.addEventListener("change", () => {
    const part = parts.get(state.selected);
    if (part) part.visible = toggle.checked;
    syncCounts();
  });
  document
    .getElementById("focus-part")
    .addEventListener("click", () => select(selector.value, true));
  document.getElementById("isolate-part").addEventListener("click", () => {
    if (!parts.has(selector.value)) return;
    for (const [id, part] of parts) part.visible = id === selector.value;
    select(selector.value, true);
  });
  document.getElementById("reset-view").addEventListener("click", reset);
  document
    .getElementById("category-toggles")
    .addEventListener("change", (event) => {
      const category = event.target.dataset.category;
      if (!category) return;
      for (const part of parts.values())
        if (part.userData.category === category && !part.userData.unsupported)
          part.visible = event.target.checked;
      syncCounts();
    });
  function catalog() {
    const categories = new Map();
    for (const [id, part] of parts) {
      if (part.userData.unsupported) continue;
      const m = part.userData,
        category = m.category || "other";
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push([id, m]);
    }
    const labels = {
      enclosure: "Case & diffuser",
      case: "Case & diffuser",
      pcb: "PCB & switch boards",
      pcb_component: "PCB components",
      components: "Components",
      modules: "Modules",
      module: "Modules",
      fasteners: "Screws",
      fastener: "Screws",
      wiring: "Wires & jumpers",
      wires: "Wiring",
      wire: "Wiring",
      connectors: "Connectors",
      connector: "Connectors",
      driver: "LED driver",
      button: "Side switch",
      electronics: "Electronics",
    };
    for (const [category, members] of categories) {
      const group = document.createElement("optgroup");
      group.label = labels[category] || category.replaceAll("_", " ");
      for (const [id, m] of members) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = m.label || id;
        group.appendChild(option);
      }
      selector.appendChild(group);
      const label = document.createElement("label"),
        box = document.createElement("input"),
        name = document.createElement("span");
      box.type = "checkbox";
      box.dataset.category = category;
      box.checked = true;
      name.textContent = `${group.label} (${members.length})`;
      label.append(box, name);
      document.getElementById("category-toggles").appendChild(label);
    }
  }
  const raycaster = new THREE.Raycaster();
  let pointer = [0, 0];
  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointer = [event.clientX, event.clientY];
  });
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (Math.hypot(event.clientX - pointer[0], event.clientY - pointer[1]) > 5)
      return;
    const rect = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    );
    const hit = raycaster.intersectObjects(
      Array.from(parts.values()).filter((p) => p.visible),
      true,
    )[0];
    if (hit) select(hit.object.userData.selectionPart);
  });
  function fail(message) {
    status.textContent = message;
    host.classList.remove("has-canvas");
    renderer.domElement.hidden = true;
  }
  new THREE.GLTFLoader().load(
    "preview/full-assembly.glb",
    (gltf) => {
      gltf.scene.traverse((object) => {
        const id = object.userData.part_id;
        if (!id || parts.has(id)) return;
        parts.set(id, object);
        object.userData.basePosition = object.position.clone();
        meshes(object, (mesh) => {
          mesh.userData.selectionPart = id;
          const previous = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          const clones = previous.map((m) => m.clone());
          mesh.material = Array.isArray(mesh.material) ? clones : clones[0];
          originals.set(
            mesh.uuid,
            clones.map((m) => ({
              transparent: m.transparent,
              opacity: m.opacity,
              depthWrite: m.depthWrite,
              emissive: m.emissive ? m.emissive.getHex() : 0,
            })),
          );
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });
      });
      if (
        !["body", "lid", "rail", "button", "switch_carrier", "diffuser"].every(
          (id) => parts.has(id),
        ) ||
        parts.size < 20
      ) {
        fail(
          "The complete assembly did not load. Use the renders and downloadable model below.",
        );
        return;
      }
      pivot.add(gltf.scene);
      catalog();
      state.loaded = true;
      host.classList.add("has-canvas");
      host.dataset.modelReady = "true";
      host.dataset.partCount = String(parts.size);
      setMode(state.mode);
      if (requested.has("reference")) {
        const found = Array.from(parts.entries()).find(
          ([, part]) => part.userData.reference === requested.get("reference"),
        );
        if (found) select(found[0], true);
      }
    },
    (progress) => {
      if (progress.total)
        status.textContent = `Loading the complete assembly — ${Math.round((progress.loaded / progress.total) * 100)}%.`;
    },
    () =>
      fail(
        "The model could not load. Reload, or use the full-resolution assembly images and downloads.",
      ),
  );
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    fail(
      "3D paused. Reload to restore it; the assembly images remain available.",
    );
  });
  const clock = new THREE.Clock();
  let onscreen = true;
  new IntersectionObserver((entries) => {
    onscreen = entries[0].isIntersecting;
  }).observe(host);
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    if (!onscreen || document.hidden) return;
    state.amount = reduced
      ? state.target
      : THREE.MathUtils.lerp(state.amount, state.target, 1 - Math.exp(-8 * dt));
    if (Math.abs(state.amount - state.target) < 0.0005)
      state.amount = state.target;
    move(state.amount);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
})();
