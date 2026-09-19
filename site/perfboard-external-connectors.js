/* global THREE */
// Generic cable plugs: no supplier footprint or mating-face pin order is implied.
window.DarkMothPerfboardExternalConnectors = (() => {
  function draw(model, register) {
    const [width, depth] = model.board.size_mm;
    function box(size, position, color, descriptor) {
      const object = new THREE.Mesh(
        new THREE.BoxGeometry(...size),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(color).convertSRGBToLinear(),
          roughness: 0.65,
        }),
      );
      object.position.set(...position);
      register(model, object, descriptor, "components");
      return object;
    }
    for (const connector of model.board.external_connectors || []) {
      const span = connector.pin_count * 2.5 + 2;
      const right = connector.ref === "LED";
      const x = (right ? 1 : -1) * (width / 2 + span / 2 + 5);
      const z = connector.ref === "BUTTON" ? depth / 2 - 7 : -depth / 2 + 23;
      const descriptor = {
        type: "external-connector",
        connector: connector.ref,
        component: connector.ref,
        jumper: connector.ref,
        id: connector.ref,
        label: `${connector.label} · illustrative cable plug`,
        nets: connector.pins.map((pin) => pin.net),
        illustrative: true,
      };
      box([span, 3.5, 6], [x, 3, z], "#f0efe8", descriptor);
      box([span * 0.45, 0.8, 2], [x, 5.1, z - 1], "#deded7", descriptor);
      for (const [index, pin] of connector.pins.entries()) {
        const px = x + (index - (connector.pin_count - 1) / 2) * 2.5;
        const info = {
          ...descriptor,
          id: `${connector.ref}:${pin.number}`,
          net: pin.net,
          label: `${connector.label} · ${pin.label}`,
          hole: pin.hole,
        };
        box([1.3, 1.8, 0.2], [px, 3, z + 3.02], "#4c5354", info);
        box([0.5, 0.9, 0.25], [px, 3, z + 3.04], "#b4a46a", info);
        const tip = new THREE.Vector3(px, 2, z - 8);
        const tail = new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.LineCurve3(new THREE.Vector3(px, 3, z - 3), tip),
            8,
            0.3,
            8,
            false,
          ),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(pin.color).convertSRGBToLinear(),
            roughness: 0.7,
          }),
        );
        register(model, tail, info, "leads");
        // Only verified carrier holes get a line to the board. Battery and
        // boost-positive module endpoints remain logical labels in the panel.
        if (pin.hole) {
          const [hx, hz] = model.positions.get(pin.hole);
          const callout = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(hx - width / 2, 0.25, hz - depth / 2),
              new THREE.Vector3(
                (right ? 1 : -1) * (width / 2 + 2),
                2,
                hz - depth / 2,
              ),
              tip,
            ]),
            new THREE.LineDashedMaterial({
              color: new THREE.Color(pin.color).convertSRGBToLinear(),
              dashSize: 1,
              gapSize: 0.7,
            }),
          );
          callout.computeLineDistances();
          register(
            model,
            callout,
            {
              ...info,
              label: `${info.label} · logical route, not a measured cable path`,
            },
            "wiring",
            true,
          );
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = 384;
      canvas.height = 80;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f7faf7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#234c40";
      ctx.font = "600 48px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${connector.ref} · ${connector.pin_count} PIN`,
        192,
        40,
        370,
      );
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      const label = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          depthWrite: false,
          depthTest: false,
        }),
      );
      // A label is an annotation beside the housing, readable from either side.
      label.position.set(x, 3, z + 7);
      label.scale.set(Math.max(13, span + 2), 2.8, 1);
      register(model, label, descriptor, "labels");
    }
  }
  return { draw };
})();
