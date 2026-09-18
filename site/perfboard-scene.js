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
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.minZoom = 0.45;
  controls.maxZoom = 8;
  controls.minPolarAngle = 0.01;
  controls.maxPolarAngle = Math.PI - 0.01;
  controls.screenSpacePanning = true;
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
    pointerStart = null;
  let projectedWidth = 100,
    projectedHeight = 70;
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  function requestRender() {
    if (disposed || frame !== null) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      const changed = controls.update();
      renderer.render(scene, camera);
      if (changed) requestRender();
    });
  }
  controls.addEventListener("change", requestRender);
  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth),
      height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
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
    controls.enableRotate = name === "angle";
    host.dataset.view = name;
    const box = model
      ? new THREE.Box3().setFromObject(model.group)
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
        (focus.jumper && descriptor.jumper === focus.jumper)),
    );
  }
  function stepVisible(descriptor, layer) {
    if (!step || !descriptor) return true;
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
          [jump.from, jump.to].includes(descriptor.hole),
      );
      return componentVisible || jumperVisible;
    }
    return true;
  }
  function applyState() {
    if (!model) return;
    const focused = Boolean(focus.net || focus.component || focus.jumper);
    for (const entry of model.entries) {
      const { object, descriptor, layer } = entry;
      object.visible =
        stepVisible(descriptor, layer) &&
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
    const next = geometry.build(board);
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
      `${board.name}. ${board.columns} columns, rows ${board.rows[0]} through ${board.rows.at(-1)}. Drag to rotate; scroll to read hole labels; select a component, lead, pad or jumper.`,
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
    pointerStart = { x: event.clientX, y: event.clientY };
  }
  function up(event) {
    if (
      !model ||
      !pointerStart ||
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
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointerup", up);
  function dispose() {
    disposed = true;
    observer.disconnect();
    controls.dispose();
    geometry.dispose(model);
    controls.removeEventListener("change", requestRender);
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointerup", up);
    if (frame !== null) window.cancelAnimationFrame(frame);
    renderer.dispose();
    canvas.remove();
  }
  resize();
  setView("angle");
  return { loadBoard, setView, highlight, setLayerMode, showStep, dispose };
};
