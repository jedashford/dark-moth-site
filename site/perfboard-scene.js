/* global THREE */
window.DarkMothPerfboardScene = (host, { onSelect = () => {} } = {}) => {
  const geometry = window.DarkMothPerfboardGeometry;
  const missing = (value) => value === undefined || value === null;
  if (!geometry) throw new Error("Perfboard geometry helper is unavailable");
  // Constructor errors propagate to the page's static-guide fallback.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Interactive perfboard. Drag to rotate, scroll to zoom, and click a component, lead, copper pad or jumper. Use the page controls for keyboard selection.",
  );
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xebeeeb);
  const camera = new THREE.OrthographicCamera(-50, 50, 35, -35, 0.1, 2000);
  // A is always toward screen-top in the two orthogonal presets. Looking up
  // from beneath reverses X on screen, exactly like turning a physical board.
  camera.up.set(0, 0, -1);
  const controls = new THREE.TrackballControls(camera, canvas);
  // Quaternion rotation can pass over either pole. Stop precisely on release;
  // continuing inertia makes inspecting individual component legs difficult.
  controls.staticMoving = true;
  controls.rotateSpeed = 1.8;
  controls.panSpeed = 0.65;
  controls.keys = [];
  scene.add(new THREE.HemisphereLight(0xffffff, 0x778983, 0.65));
  for (const [position, power, color] of [
    [[-50, 110, -60], 0.9, 0xffffff],
    [[70, 40, 80], 0.3, 0xfff2dc],
    [[-50, -100, -30], 0.9, 0xf5f9ff],
  ]) {
    const light = new THREE.DirectionalLight(color, power);
    light.position.set(...position);
    if (power > 0.8) {
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      Object.assign(light.shadow.camera, {
        left: -60,
        right: 60,
        top: 60,
        bottom: -60,
        near: 1,
        far: 300,
      });
      light.shadow.normalBias = 0.015;
      light.shadow.bias = -0.0001;
    }
    scene.add(light);
  }
  let model = null,
    view = "angle",
    layerMode = "all",
    focus = {},
    step = null;
  let frame = null,
    disposed = false,
    pointerStart = null,
    pinching = false;
  let projectedWidth = 100,
    projectedHeight = 70;
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  function requestRender() {
    if (disposed || frame !== null) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      consumeInput();
      renderer.render(scene, camera);
    });
  }
  function consumeInput() {
    const previousZoom = camera.zoom;
    controls.update();
    // r128 Trackball uses the perspective distance ratio for orthographic
    // pinch zoom too. Invert that ratio so spreading fingers zooms in.
    const requestedZoom = pinching
      ? (previousZoom * previousZoom) / camera.zoom
      : camera.zoom;
    const zoom = THREE.MathUtils.clamp(requestedZoom, 0.45, 8);
    if (zoom !== camera.zoom) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
  }
  function renderInput() {
    // Consume each sample before Trackball replaces it with the next one.
    // Drawing stays frame-limited, so large assemblies do not lose drag travel.
    consumeInput();
    requestRender();
  }
  controls.addEventListener("change", requestRender);
  controls.addEventListener("start", renderInput);
  controls.addEventListener("end", renderInput);
  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth),
      height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    controls.handleResize();
    const aspect = width / height,
      half =
        Math.max(projectedHeight / 2, projectedWidth / (2 * aspect)) * 1.12;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    requestRender();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  function setView(name) {
    if (!["top", "bottom", "angle"].includes(name))
      throw new Error(`Unknown perfboard view: ${name}`);
    view = name;
    const shadows = name === "angle";
    if (renderer.shadowMap.enabled !== shadows) {
      renderer.shadowMap.enabled = shadows;
      model?.group.traverse((object) => {
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material])
          if (material) material.needsUpdate = true;
      });
    }
    controls.noRotate = name !== "angle";
    // Trackball rotates camera.up too. Presets always restore the physical
    // component/solder-side orientation, even after a fully inverted drag.
    camera.up.set(0, 0, -1);
    host.dataset.view = name;
    const box = model
      ? model.contentBounds &&
        !model.entries.some((e) => e.schematic && e.object.visible)
        ? model.contentBounds.clone()
        : new THREE.Box3().setFromObject(model.group)
      : new THREE.Box3(
          new THREE.Vector3(-35, -5, -25),
          new THREE.Vector3(35, 10, 25),
        );
    const center = box.getCenter(new THREE.Vector3()),
      diameter = box.getSize(new THREE.Vector3()).length();
    const direction = {
      top: [0, 1, 0],
      bottom: [0, -1, 0],
      angle: [0.65, 1, 0.85],
    }[name];
    controls.target.copy(center);
    camera.position
      .copy(center)
      .add(
        new THREE.Vector3(...direction)
          .normalize()
          .multiplyScalar(Math.max(diameter * 3, 120)),
      );
    camera.zoom = 1;
    camera.lookAt(center);
    camera.updateMatrixWorld(true);
    const projected = [];
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z])
          projected.push(
            new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse),
          );
    projectedWidth =
      Math.max(...projected.map((p) => p.x)) -
      Math.min(...projected.map((p) => p.x));
    projectedHeight =
      Math.max(...projected.map((p) => p.y)) -
      Math.min(...projected.map((p) => p.y));
    controls.update();
    resize();
  }
  function isSelected(descriptor) {
    return Boolean(
      descriptor &&
      ((focus.net &&
        (descriptor.net === focus.net ||
          descriptor.nets?.includes(focus.net))) ||
        (focus.component && descriptor.component === focus.component) ||
        (focus.jumper && descriptor.jumper === focus.jumper) ||
        (focus.jumpers && focus.jumpers.includes(descriptor.jumper))),
    );
  }
  function stepVisible(descriptor, layer) {
    if (!step || !descriptor || descriptor.type === "callout-legend")
      return true;
    if (layer === "wiring")
      return (
        missing(step.jumperIds) || step.jumperIds.includes(descriptor.jumper)
      );
    if (["components", "leads", "labels"].includes(layer))
      return (
        missing(step.componentIds) ||
        step.componentIds.includes(descriptor.component)
      );
    if (layer === "joints") {
      if (missing(step.componentIds) && missing(step.jumperIds)) return true;
      const component = model.board.components.find(
        (candidate) => candidate.ref === descriptor.component,
      );
      const componentVisible =
        component &&
        (missing(step.componentIds) ||
          step.componentIds.includes(component.ref));
      const jumperVisible = model.board.jumpers.some(
        (jump) =>
          (missing(step.jumperIds) || step.jumperIds.includes(jump.id)) &&
          (jump.joined_holes || [jump.from, jump.to]).includes(descriptor.hole),
      );
      return componentVisible || jumperVisible;
    }
    return true;
  }
  function applyState() {
    if (!model) return;
    const focused = Boolean(
      focus.net || focus.component || focus.jumper || focus.jumpers?.length,
    );
    const schematicVisible = (entry) =>
      layerMode === "wiring" ||
      isSelected(entry.descriptor) ||
      Boolean(step?.jumperIds?.includes(entry.descriptor?.jumper));
    const hasCallouts = model.entries.some(
      (entry) =>
        entry.schematic && entry.descriptor?.jumper && schematicVisible(entry),
    );
    for (const entry of model.entries) {
      const { object, descriptor, layer } = entry;
      object.visible =
        stepVisible(descriptor, layer) &&
        (!entry.schematic ||
          (descriptor?.type === "callout-legend"
            ? hasCallouts
            : schematicVisible(entry))) &&
        !(layerMode === "components" && ["wiring", "joints"].includes(layer)) &&
        !(layerMode === "wiring" && ["components", "labels"].includes(layer));
      if (object.isInstancedMesh) {
        object.userData.instances.forEach((info, index) => {
          const selected = isSelected(info);
          const color = selected
            ? model.netColor(info.net)
            : new THREE.Color(0xc18a4b).convertSRGBToLinear();
          if (focused && !selected) color.multiplyScalar(0.35);
          object.setColorAt(index, color);
        });
        object.instanceColor.needsUpdate = true;
      } else if (descriptor && object.material) {
        const selected = isSelected(descriptor),
          mat = object.material,
          base = object.userData.baseMaterial;
        mat.color.copy(base.color);
        if (focused && !selected)
          mat.color.lerp(new THREE.Color(0x8f9994), 0.7);
        mat.opacity = focused && !selected ? base.opacity * 0.25 : base.opacity;
        mat.transparent = base.transparent || mat.opacity < 1;
        mat.depthWrite = base.depthWrite && mat.opacity >= 0.95;
        if (mat.emissive)
          mat.emissive.copy(
            selected
              ? model.netColor(descriptor.net || focus.net).multiplyScalar(0.16)
              : base.emissive,
          );
        mat.needsUpdate = true;
      }
    }
    host.dataset.layerMode = layerMode;
    requestRender();
  }
  function loadBoard(board) {
    loadModel(geometry.build(board));
  }
  function loadModel(next) {
    const board = next.board;
    geometry.dispose(model);
    model = next;
    for (const { object } of model.entries) {
      const mat = object.material;
      if (mat)
        object.userData.baseMaterial = {
          color: mat.color.clone(),
          opacity: mat.opacity,
          transparent: mat.transparent,
          depthWrite: mat.depthWrite,
          emissive: mat.emissive?.clone() || new THREE.Color(0),
        };
    }
    scene.add(model.group);
    focus = {};
    step = null;
    canvas.setAttribute(
      "aria-label",
      board.description ||
        `${board.name}. ${board.columns} columns, rows ${board.rows[0]} through ${board.rows.at(-1)}. Drag freely in 3D; scroll to zoom; right-drag to pan; select a component, lead, pad or jumper.`,
    );
    applyState();
    setView(view);
  }
  function highlight(selection = {}) {
    focus = selection || {};
    applyState();
  }
  function setLayerMode(mode) {
    if (!["all", "components", "wiring"].includes(mode))
      throw new Error(`Unknown perfboard layer: ${mode}`);
    layerMode = mode;
    applyState();
  }
  function showStep(selection = null) {
    step = selection;
    focus = selection?.activeNet ? { net: selection.activeNet } : {};
    applyState();
  }
  function down(event) {
    pointerStart = {
      x: event.clientX,
      y: event.clientY,
      moved: event.button !== undefined && event.button !== 0,
    };
  }
  function up(event) {
    if (
      !model ||
      !pointerStart ||
      pointerStart.moved ||
      Math.hypot(
        event.clientX - pointerStart.x,
        event.clientY - pointerStart.y,
      ) > 6
    ) {
      pointerStart = null;
      return;
    }
    pointerStart = null;
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((event.clientY - rect.top) / rect.height) * 2,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(
      [...model.pickables, ...model.occluders].filter(
        (object) => object.visible,
      ),
      false,
    )[0];
    if (!hit) return;
    const descriptor = missing(hit.instanceId)
      ? hit.object.userData.perfboard
      : hit.object.userData.instances[hit.instanceId];
    if (descriptor) onSelect({ ...descriptor, board: model.board.id });
  }
  function move(event) {
    if (!pointerStart) return;
    if (
      Math.hypot(
        event.clientX - pointerStart.x,
        event.clientY - pointerStart.y,
      ) > 6
    )
      pointerStart.moved = true;
    renderInput();
  }
  function cancel() {
    pointerStart = null;
  }
  function touchMode(event) {
    pinching = event.touches.length > 1;
  }
  // Trackball updates its input state on document events while dragging,
  // including when a finger/mouse leaves the canvas. Render those changes.
  canvas.ownerDocument.addEventListener("pointermove", move);
  canvas.ownerDocument.addEventListener("pointerup", cancel);
  canvas.ownerDocument.addEventListener("pointercancel", cancel);
  canvas.addEventListener("pointerdown", controls.handleResize, true);
  canvas.addEventListener("touchstart", controls.handleResize, true);
  for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"])
    canvas.addEventListener(type, touchMode, true);
  canvas.addEventListener("touchmove", renderInput, { passive: true });
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointerup", up);
  function dispose() {
    disposed = true;
    observer.disconnect();
    controls.dispose();
    geometry.dispose(model);
    controls.removeEventListener("change", requestRender);
    controls.removeEventListener("start", renderInput);
    controls.removeEventListener("end", renderInput);
    canvas.ownerDocument.removeEventListener("pointermove", move);
    canvas.ownerDocument.removeEventListener("pointerup", cancel);
    canvas.ownerDocument.removeEventListener("pointercancel", cancel);
    canvas.removeEventListener("pointerdown", controls.handleResize, true);
    canvas.removeEventListener("touchstart", controls.handleResize, true);
    for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"])
      canvas.removeEventListener(type, touchMode, true);
    canvas.removeEventListener("touchmove", renderInput);
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointerup", up);
    if (frame !== null) window.cancelAnimationFrame(frame);
    renderer.dispose();
    canvas.remove();
  }
  resize();
  setView("angle");
  return {
    loadBoard,
    loadModel,
    setView,
    highlight,
    setLayerMode,
    showStep,
    dispose,
  };
};
