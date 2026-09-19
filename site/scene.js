/* global THREE */
window.DarkMothScene = (host) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute(
    "aria-label",
    "Complete Dark Moth prototype. Drag to rotate; select any part or wire to inspect it.",
  );
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8eaec);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 3000);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 18;
  controls.maxDistance = 1000;
  controls.maxPolarAngle = Math.PI * 0.94;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6d7480, 1.1));
  for (const [position, strength] of [
    [[160, 260, 180], 1.7],
    [[-180, 80, 70], 0.65],
    [[60, 150, -180], 1.05],
  ]) {
    const light = new THREE.DirectionalLight(0xffffff, strength);
    light.position.set(...position);
    if (strength > 1.5) {
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      Object.assign(light.shadow.camera, {
        left: -240,
        right: 240,
        top: 300,
        bottom: -180,
        near: 1,
        far: 800,
      });
      light.shadow.bias = -0.0002;
      // Two shadow-map texels in scene millimetres prevent self-shadow stripes
      // on flat imported PCBs while preserving shadows between separate parts.
      light.shadow.normalBias =
        2 *
        Math.max(
          (light.shadow.camera.right - light.shadow.camera.left) /
            light.shadow.mapSize.x,
          (light.shadow.camera.top - light.shadow.camera.bottom) /
            light.shadow.mapSize.y,
        );
    }
    scene.add(light);
  }
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(2200, 2200),
    new THREE.ShadowMaterial({ color: 0x28313b, opacity: 0.12 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -18.1;
  floor.receiveShadow = true;
  scene.add(floor);
  const pivot = new THREE.Group();
  pivot.scale.setScalar(1000);
  pivot.position.set(-53.1, -15.6, 49.1);
  scene.add(pivot);
  function fit(box, name = "front") {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const directions = {
      front: [-1, 0.8, 1.1],
      top: [0, 1, 0.001],
      back: [-1, 0.8, -1.1],
      side: [-1, 0.25, 0.4],
    };
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const diameter = Math.max(size.x, size.y, size.z, 18);
    const distance =
      (diameter / (2 * Math.sin(Math.min(vertical, horizontal) / 2))) * 1.15;
    controls.target.copy(center);
    camera.position
      .copy(center)
      .add(
        new THREE.Vector3(...(directions[name] || directions.front))
          .normalize()
          .multiplyScalar(distance),
      );
    controls.update();
    host.dataset.view = name;
  }
  function resize() {
    const width = Math.max(host.clientWidth, 1),
      height = Math.max(host.clientHeight, 1);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();
  fit(
    new THREE.Box3(
      new THREE.Vector3(-60, -18, -55),
      new THREE.Vector3(60, 35, 55),
    ),
  );
  return { renderer, scene, camera, controls, pivot, fit };
};
