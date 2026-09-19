/* global THREE */
// Data uses board-local X/Y with height Z; scene uses X/height/row-direction.
window.DarkMothPerfboardGeometry = (() => {
  const palette = [
    0x161a1d, 0x785038, 0xb63d34, 0xe6792c, 0xeac445, 0x3b8c63, 0x3976a9,
    0x895899, 0x919796, 0xe4e6de,
  ];
  const material = (color, options = {}) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.62,
      ...options,
    });
    if (!color?.isColor) mat.color.convertSRGBToLinear();
    return mat;
  };
  function build(board) {
    if (
      !board?.size_mm ||
      !board.rows?.length ||
      !Number.isInteger(board.columns)
    )
      throw new Error("Invalid perfboard layout");
    const [width, depth, thickness] = board.size_mm;
    const group = new THREE.Group(),
      entries = [],
      pickables = [];
    const positions = new Map(),
      occupants = new Map(),
      nets = new Map(board.nets.map((net) => [net.id, net]));
    const point = ([x, y, z = 0]) =>
      new THREE.Vector3(x - width / 2, z, y - depth / 2);
    const netColor = (net) =>
      new THREE.Color(nets.get(net)?.color || "#bb7b36").convertSRGBToLinear();
    for (const [rowIndex, row] of board.rows.entries()) {
      for (let column = 1; column <= board.columns; column++) {
        positions.set(`${row}${column}`, [
          board.hole_origin_mm[0] + (column - 1) * board.pitch_mm,
          board.hole_origin_mm[1] + rowIndex * board.pitch_mm,
        ]);
      }
    }
    for (const component of board.components) {
      for (const pin of component.pins)
        occupants.set(pin.hole, { ...pin, component: component.ref });
    }
    for (const terminal of board.terminals || [])
      occupants.set(terminal.hole, {
        ...occupants.get(terminal.hole),
        ...terminal,
        terminal: terminal.id,
      });
    for (const junction of board.junctions || [])
      occupants.set(junction.hole, {
        ...occupants.get(junction.hole),
        ...junction,
        junction: true,
      });
    for (const jumper of board.jumpers) {
      for (const hole of window.DarkMothPerfboardConnections.holes(jumper))
        occupants.set(hole, { ...occupants.get(hole), net: jumper.net });
    }
    function register(object, descriptor, layer = "components") {
      group.add(object);
      object.userData.perfboard = descriptor;
      object.castShadow = true;
      object.receiveShadow = true;
      entries.push({ object, descriptor, layer });
      if (descriptor) pickables.push(object);
      return object;
    }
    function mesh(geometry, color, descriptor, layer, options) {
      return register(
        new THREE.Mesh(geometry, material(color, options)),
        descriptor,
        layer,
      );
    }
    function tube(points, radius, color, descriptor, layer, options = {}) {
      const path = new THREE.CurvePath();
      for (let i = 1; i < points.length; i++) {
        if (points[i].distanceToSquared(points[i - 1]) > 0.00001)
          path.add(new THREE.LineCurve3(points[i - 1], points[i]));
      }
      if (!path.curves.length) return null;
      const segments = Math.max(16, points.length * 10);
      return mesh(
        new THREE.TubeGeometry(path, segments, radius, 8, false),
        color,
        descriptor,
        layer,
        options,
      );
    }
    function cylinder(
      center,
      axis,
      length,
      radius,
      color,
      descriptor,
      options = {},
    ) {
      const object = mesh(
        new THREE.CylinderGeometry(radius, radius, length, 24),
        color,
        descriptor,
        "components",
        options,
      );
      object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
      object.position.copy(center);
      return object;
    }
    function textSprite(text, position, descriptor, color = "#202e2b") {
      const canvas = document.createElement("canvas");
      canvas.width = 384;
      canvas.height = 96;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(250,251,245,.94)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "600 76px system-ui, sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 192, 50, 370);
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture, depthWrite: false }),
      );
      sprite.position.copy(position);
      sprite.scale.set(3.8, 0.95, 1);
      register(sprite, descriptor, "labels");
      return sprite;
    }
    // Extruded substrate has real drilled holes, rather than black circles.
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, -depth / 2);
    shape.lineTo(width / 2, -depth / 2);
    shape.lineTo(width / 2, depth / 2);
    shape.lineTo(-width / 2, depth / 2);
    shape.closePath();
    for (const [x, y] of positions.values()) {
      const hole = new THREE.Path();
      hole.absarc(x - width / 2, depth / 2 - y, 0.5, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
    const substrate = mesh(
      new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 12,
      }),
      0x215c4a,
      null,
      "board",
    );
    substrate.rotation.x = -Math.PI / 2;
    substrate.position.y = -thickness;
    const holes = Array.from(positions, ([hole, [x, y]]) => {
      const owner = occupants.get(hole) || {};
      return {
        ...owner,
        type: "pad",
        id: hole,
        hole,
        label: [hole, owner.component, owner.role, owner.net]
          .filter(Boolean)
          .join(" · "),
        position: [x, y],
      };
    });
    // Two instanced copper annuli per hole keep the large board responsive.
    for (const side of ["top", "bottom"]) {
      const pads = new THREE.InstancedMesh(
        new THREE.RingGeometry(0.5, 0.92, 20),
        material(0xffffff, { metalness: 0.45, roughness: 0.58 }),
        holes.length,
      );
      const dummy = new THREE.Object3D();
      for (let i = 0; i < holes.length; i++) {
        dummy.position.copy(
          point([
            ...holes[i].position,
            side === "top" ? 0.025 : -thickness - 0.025,
          ]),
        );
        dummy.rotation.set(side === "top" ? -Math.PI / 2 : Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        pads.setMatrixAt(i, dummy.matrix);
        pads.setColorAt(i, new THREE.Color(0xc18a4b).convertSRGBToLinear());
      }
      pads.userData.instances = holes.map((hole) => ({ ...hole, side }));
      register(pads, null, "pads");
      pickables.push(pads);
    }
    // Text is painted once per face. Bottom glyphs are mirrored on the physical
    // plane so they read normally from below; hole positions never change.
    for (const side of ["top", "bottom"]) {
      const scale = 36,
        canvas = document.createElement("canvas");
      canvas.width = Math.ceil(width * scale);
      canvas.height = Math.ceil(depth * scale);
      const ctx = canvas.getContext("2d");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      function word(text, x, y, size, color) {
        ctx.save();
        ctx.translate(x * scale, y * scale);
        if (side === "bottom") ctx.scale(-1, 1);
        ctx.font = `600 ${size * scale}px ui-monospace, SFMono-Regular, monospace`;
        ctx.fillStyle = color;
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
      for (const [hole, [x, y]] of positions)
        word(hole, x, y + 1.27, 0.65, "#e9f1df");
      for (let column = 1; column <= board.columns; column++)
        word(
          String(column),
          board.hole_origin_mm[0] + (column - 1) * board.pitch_mm,
          0.85,
          0.95,
          "#ffffff",
        );
      board.rows.forEach((row, index) =>
        word(
          row,
          0.8,
          board.hole_origin_mm[1] + index * board.pitch_mm,
          0.95,
          "#ffffff",
        ),
      );
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = 4;
      const object = new THREE.Mesh(
        new THREE.PlaneGeometry(width, depth),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: side === "top" ? THREE.FrontSide : THREE.BackSide,
          depthWrite: false,
        }),
      );
      object.rotation.x = -Math.PI / 2;
      object.position.y = side === "top" ? 0.05 : -thickness - 0.05;
      register(object, null, "board");
    }
    function resistorBands(
      component,
      center,
      axis,
      length,
      radius,
      descriptor,
    ) {
      const text = String(component.value).toLowerCase().replace(/\s/g, "");
      const match = text.match(/([\d.]+)\s*([km]?)/);
      const value = match
        ? Number(match[1]) *
          (match[2] === "k" ? 1000 : match[2] === "m" ? 1000000 : 1)
        : 100;
      const exponent = Math.floor(Math.log10(value)) - 2;
      const digits = Math.round(value / 10 ** exponent)
        .toString()
        .padStart(3, "0")
        .slice(0, 3)
        .split("")
        .map(Number);
      const bands = [
        ...digits.map((digit) => palette[digit]),
        exponent < 0 ? 0xbd9b4a : palette[exponent],
        palette[1],
      ];
      [-0.31, -0.15, 0.01, 0.17, 0.35].forEach((offset, index) =>
        cylinder(
          center.clone().addScaledVector(axis, length * offset),
          axis,
          0.32,
          radius + 0.012,
          bands[index],
          descriptor,
        ),
      );
    }
    for (const component of board.components) {
      const descriptor = {
        type: "component",
        id: component.ref,
        component: component.ref,
        label: `${component.ref} · ${component.value}`,
        nets: [...new Set(component.pins.map((pin) => pin.net))],
        pin_order_status: component.pin_order_status,
      };
      const center = point(component.body_center_mm),
        size = component.body_size_mm;
      const kind = component.kind.toLowerCase();
      const axisIndex = size.indexOf(Math.max(...size));
      const axis = point(
        component.body_center_mm.map((v, i) => v + (i === axisIndex ? 1 : 0)),
      )
        .sub(center)
        .normalize();
      const length = size[axisIndex],
        radius = Math.min(...size.filter((_, i) => i !== axisIndex)) / 2;
      if (["sot23_adapter", "service_header"].includes(kind)) {
        if (!window.DarkMothPerfboardAdapters)
          throw new Error("Adapter renderer unavailable");
        window.DarkMothPerfboardAdapters.draw(component, {
          mesh,
          point,
          positions,
          descriptor,
        });
      } else if (kind.includes("resistor")) {
        cylinder(center, axis, length, radius, 0xc2b19a, descriptor);
        resistorBands(component, center, axis, length, radius, descriptor);
      } else if (kind.includes("diode")) {
        cylinder(center, axis, length, radius, 0xb2704e, descriptor, {
          transparent: true,
          opacity: 0.9,
          roughness: 0.26,
        });
        const cathode = component.lead_paths.find((lead) =>
          /^(k|cathode)$/i.test(lead.role),
        );
        const end = cathode
          ? point(cathode.points_mm[0]).sub(center).dot(axis)
          : -1;
        cylinder(
          center
            .clone()
            .addScaledVector(axis, Math.sign(end || -1) * length * 0.32),
          axis,
          0.48,
          radius + 0.02,
          0x292d2e,
          descriptor,
        );
      } else if (
        kind.includes("to92") ||
        kind.includes("transistor") ||
        kind.includes("mosfet")
      ) {
        const r = size[0] / 2,
          flat = Math.max(0.1, Math.min(r - 0.01, size[1] - r)),
          d = new THREE.Shape();
        const angle = Math.asin(flat / r),
          edge = Math.sqrt(r * r - flat * flat);
        d.moveTo(-edge, -flat);
        d.lineTo(edge, -flat);
        d.absarc(0, 0, r, -angle, Math.PI + angle, false);
        d.closePath();
        const geometry = new THREE.ExtrudeGeometry(d, {
          depth: size[2],
          bevelEnabled: false,
          steps: 1,
          curveSegments: 16,
        });
        geometry.translate(0, -(r - flat) / 2, -size[2] / 2);
        const body = mesh(geometry, 0x242a2c, descriptor, "components");
        body.rotation.x = -Math.PI / 2;
        body.position.copy(center);
      } else {
        const body = mesh(
          new THREE.BoxGeometry(size[0], size[2], size[1]),
          kind.includes("capacitor") ? 0xb37d43 : 0x343b3e,
          descriptor,
          "components",
        );
        body.position.copy(center);
      }
      textSprite(
        component.ref,
        center.clone().add(new THREE.Vector3(0, size[2] / 2 + 1.3, 0)),
        descriptor,
      );
      for (const lead of component.lead_paths) {
        const pin = component.pins.find(
          (candidate) => candidate.role === lead.role,
        );
        const info = {
          type: "lead",
          id: `${component.ref}.${lead.role}`,
          component: component.ref,
          role: lead.role,
          hole: pin?.hole,
          net: pin?.net,
          label: `${component.ref} ${lead.role} → ${pin?.hole} · ${pin?.net}`,
          pin_order_status: component.pin_order_status,
        };
        tube(lead.points_mm.map(point), 0.22, 0xbfc4c5, info, "leads", {
          metalness: 0.82,
          roughness: 0.29,
        });
        const clipped = lead.points_mm[0][2] < lead.points_mm.at(-1)[2];
        const end = point(
            lead.points_mm[clipped ? 0 : lead.points_mm.length - 1],
          ),
          before = point(
            lead.points_mm[clipped ? 1 : lead.points_mm.length - 2],
          );
        const cap = mesh(
          new THREE.CircleGeometry(0.22, 8),
          0xbfc4c5,
          info,
          "leads",
        );
        cap.position.copy(end);
        cap.lookAt(end.clone().multiplyScalar(2).sub(before));
        cap.material.metalness = 0.82;
        if (pin?.hole) {
          const [x, y] = positions.get(pin.hole);
          const role = textSprite(
            lead.role,
            point([x, y, 0.65]),
            info,
            "#295e50",
          );
          role.scale.set(1.7, 0.75, 1);
        }
      }
    }
    window.DarkMothPerfboardConnections.draw({
      board,
      positions,
      point,
      tube,
      netColor,
    });
    for (const hole of holes.filter((hole) => hole.net)) {
      const joint = mesh(
        new THREE.LatheGeometry(
          [
            new THREE.Vector2(0.22, -0.72),
            new THREE.Vector2(0.35, -0.3),
            new THREE.Vector2(0.78, -0.06),
            new THREE.Vector2(0.78, 0),
          ],
          20,
        ),
        0xb9bdbc,
        { ...hole, type: "pad", side: "bottom" },
        "joints",
        { metalness: 0.86, roughness: 0.26 },
      );
      joint.position.copy(point([...hole.position, -thickness - 0.04]));
    }
    group.updateMatrixWorld(true);
    return {
      group,
      entries,
      pickables,
      occluders: [substrate],
      board,
      positions,
      netColor,
    };
  }
  function dispose(model) {
    if (!model) return;
    const geometries = new Set(),
      materials = new Set(),
      textures = new Set();
    model.group.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      for (const mat of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        if (mat) {
          materials.add(mat);
          if (mat.map) textures.add(mat.map);
        }
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((mat) => mat.dispose());
    textures.forEach((texture) => texture.dispose());
    model.group.parent?.remove(model.group);
  }
  return { build, dispose };
})();
