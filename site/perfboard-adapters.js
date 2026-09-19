/* global THREE */
// Supplier-derived adapter coordinates; unknown module header positions are absent.
window.DarkMothPerfboardAdapters = (() => {
  function draw(part, { mesh, point, positions, descriptor }) {
    function box(size, center, color, info = descriptor) {
      const object = mesh(
        new THREE.BoxGeometry(size[0], size[2], size[1]),
        color,
        info,
        "components",
      );
      object.position.copy(point(center));
      return object;
    }
    if (part.kind === "service_header") {
      const [x, y] = part.body_center_mm;
      box([5.08, 2.54, 2.54], [x, y, 1.27], 0x242c2d);
      box([5.08, 2.54, 3.1], [x, y, 7.05], 0x253b40, {
        ...descriptor,
        label: "JSV removable service shunt · remove before ESP USB",
      });
      for (const pin of part.pins) {
        const [px, py] = positions.get(pin.hole);
        box([0.64, 0.64, 8.6], [px, py, 4.3], 0xbaaa68, {
          ...descriptor,
          type: "lead",
          role: pin.role,
          hole: pin.hole,
          net: pin.net,
          label: `${part.ref}.${pin.role} → ${pin.hole} · ${pin.net}`,
        });
      }
      return;
    }
    const adapter = part.adapter;
    if (!adapter?.packages?.length || !adapter.pcb_size_mm)
      throw new Error(`Missing sourced adapter geometry for ${part.ref}`);
    const [cx, cy] = part.body_center_mm;
    const [width, depth, thickness] = adapter.pcb_size_mm;
    const bottom = adapter.pcb_bottom_z_mm;
    const local = ([x, y, z]) => [cx + x, cy + y, bottom + z];
    const holes = [
      ...part.pins.map((pin) => pin.hole),
      ...(adapter.unused_holes || []),
    ];
    const outline = new THREE.Shape();
    outline.moveTo(-width / 2, -depth / 2);
    outline.lineTo(width / 2, -depth / 2);
    outline.lineTo(width / 2, depth / 2);
    outline.lineTo(-width / 2, depth / 2);
    outline.closePath();
    for (const name of holes) {
      const location = positions.get(name);
      if (!location)
        throw new Error(`Unknown adapter hole ${part.ref}.${name}`);
      const hole = new THREE.Path();
      hole.absarc(
        location[0] - cx,
        cy - location[1],
        0.5,
        0,
        Math.PI * 2,
        true,
      );
      outline.holes.push(hole);
      const pin = part.pins.find((candidate) => candidate.hole === name);
      const info = pin
        ? {
            ...descriptor,
            type: "lead",
            role: pin.role,
            hole: name,
            net: pin.net,
            label: `${part.ref}.${pin.role} adapter pad → ${name} · ${pin.net}`,
          }
        : {
            ...descriptor,
            label: `${part.ref} unused adapter hole · leave without a pin`,
          };
      const pad = mesh(
        new THREE.RingGeometry(0.5, 0.94, 24),
        0xc4a867,
        info,
        "components",
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.copy(point([...location, bottom + thickness + 0.025]));
    }
    const pcb = mesh(
      new THREE.ExtrudeGeometry(outline, {
        depth: thickness,
        bevelEnabled: false,
        curveSegments: 12,
      }),
      0x285b78,
      descriptor,
      "components",
    );
    pcb.rotation.x = -Math.PI / 2;
    pcb.position.copy(point([cx, cy, bottom]));
    pcb.userData.adapterSubstrate = true;
    for (const pkg of adapter.packages) {
      const body = box(pkg.body_size_mm, local(pkg.center_mm), 0x202628, {
        ...descriptor,
        id: `${part.ref}:${pkg.ref}`,
        label: `${part.ref} ${pkg.ref} · ${part.value} · SOT23`,
      });
      body.userData.adapterPackage = pkg.ref;
      for (const lead of pkg.pins) {
        const pin = part.pins.find((candidate) => candidate.role === lead.role);
        if (!pin)
          throw new Error(`Unmapped adapter role ${part.ref}.${lead.role}`);
        box([0.65, 0.55, 0.22], local(lead.position_mm), 0xbfc5c6, {
          ...descriptor,
          type: "lead",
          id: `${part.ref}:${pkg.ref}:${lead.number}`,
          role: lead.role,
          hole: pin.hole,
          net: pin.net,
          label: `${part.ref} ${pkg.ref} pin ${lead.number} (${lead.role}) → ${pin.hole} · ${pin.net}`,
        });
      }
    }
  }
  return { draw };
})();
