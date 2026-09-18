/* global THREE */
// Reuse the detailed assembly modules; their loader already returns millimetres.
window.DarkMothPerfboardCarrier = (() => {
  function place(model, module, board) {
    const pcb = model.parts.get(module.model_part);
    if (!pcb) throw new Error(`Missing module PCB: ${module.model_part}`);
    const group = new THREE.Group();
    group.name = `carrier-module-${module.ref}`;
    group.add(model.group);
    // Board rows increase down the top view. Never reflect the GLB's Z axis.
    group.rotation.y = (-module.rotation_deg * Math.PI) / 180;
    group.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(pcb);
    const [x, row, bottom] = module.pcb_origin_mm;
    group.position.set(
      x - board.size_mm[0] / 2 - bounds.min.x,
      bottom - bounds.min.y,
      row - board.size_mm[1] / 2 - bounds.min.z,
    );
    group.updateMatrixWorld(true);
    return { group, pcb, parts: model.parts, placement: module };
  }
  function register(model, object, descriptor, layer, schematic = false) {
    model.group.add(object);
    object.userData.perfboard = descriptor;
    model.entries.push({ object, descriptor, layer, schematic });
    if (descriptor) model.pickables.push(object);
    return object;
  }
  function zone(model, module) {
    const [x, y, width, depth] = module.zone_mm,
      height = module.pcb_origin_mm[2];
    const geometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(width, height, depth),
    );
    const wire = new THREE.LineSegments(
      geometry,
      new THREE.LineDashedMaterial({
        color: 0x76a6a6,
        dashSize: 1.2,
        gapSize: 0.8,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    wire.position.set(
      x + width / 2 - model.board.size_mm[0] / 2,
      height / 2,
      y + depth / 2 - model.board.size_mm[1] / 2,
    );
    wire.computeLineDistances();
    register(
      model,
      wire,
      {
        type: "module",
        module: module.ref,
        component: module.ref,
        id: `${module.ref}-nominal-support-zone`,
        label: `${module.ref} · nominal insulating support / clearance zone; mounting hardware not specified`,
        nominal: true,
      },
      "components",
    );
  }
  async function build(board) {
    const geometry = window.DarkMothPerfboardGeometry;
    const model = geometry.build(board);
    model.modules = new Map();
    model.moduleCatalog = [];
    const results = await Promise.allSettled(
      (board.modules || []).map((module) =>
        window.DarkMothElectronicsOverview.load(`part:${module.model_part}`),
      ),
    );
    try {
      const failure = results.find((result) => result.status === "rejected");
      if (failure) throw failure.reason;
      for (const [index, result] of results.entries()) {
        const module = board.modules[index];
        const { model: source, catalog } = result.value;
        const placed = place(source, module, board);
        model.group.add(placed.group);
        model.modules.set(module.ref, placed);
        model.moduleCatalog.push({ ...module, details: catalog });
        for (const entry of source.entries) {
          const descriptor = {
            ...entry.descriptor,
            type: "module",
            detailId: entry.descriptor.id,
            id: `${module.ref}:${entry.descriptor.id}`,
            component: module.ref,
            module: module.ref,
            nets: [...new Set((module.connections || []).map((p) => p.net))],
            label: `${module.ref} · ${entry.descriptor.label}`,
          };
          entry.object.userData.perfboard = descriptor;
          model.entries.push({ ...entry, descriptor });
        }
        model.pickables.push(...source.pickables);
        zone(model, module);
      }
      model.contentBounds = new THREE.Box3().setFromObject(model.group);
      window.DarkMothPerfboardModuleLinks.draw(model, register);
      model.group.updateMatrixWorld(true);
      return model;
    } catch (error) {
      // All fulfilled clones belong to this request. Discard even unattached ones.
      for (const result of results)
        if (result.status === "fulfilled") {
          result.value.model.group.parent?.remove(result.value.model.group);
          geometry.dispose(result.value.model);
        }
      geometry.dispose(model);
      throw error;
    }
  }
  return { build };
})();
