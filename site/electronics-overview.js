/* global THREE */
window.DarkMothElectronicsOverview = (() => {
  let sourcePromise;
  const clusterPrefixes = {
    module_esp: "esp_",
    module_charger: "charger_",
    module_reg5: "reg5_",
    module_reg12: "reg12_",
    led_strip: "led_emitter_",
  };
  function allowed(metadata) {
    return (
      !["enclosure", "case"].includes(metadata.category) &&
      !metadata.unsupported &&
      metadata.part_id !== "pcb_SW"
    );
  }
  function included(id, metadata, mode) {
    if (!allowed(metadata)) return false;
    if (mode === "system") return true;
    const selected = mode === "pcb" ? "pcb_carrier" : mode.slice(5);
    if (id === selected) return true;
    if (selected === "pcb_carrier")
      return (
        metadata.carrier_member === true ||
        metadata.parent_carrier === "pcb_carrier" ||
        id.startsWith("carrier_") ||
        [
          "module_esp",
          "module_charger",
          "module_reg5",
          "module_reg12",
        ].includes(metadata.parent_module) ||
        [
          "module_esp",
          "module_charger",
          "module_reg5",
          "module_reg12",
        ].includes(id)
      );
    if (metadata.parent_module === selected) return true;
    if (clusterPrefixes[selected])
      return id.startsWith(clusterPrefixes[selected]);
    return (
      ["remote_switch", "remote_daughterboard"].includes(selected) &&
      ["remote_switch", "remote_daughterboard"].includes(id)
    );
  }
  function createModel(source, metadata, mode = "system") {
    if (!["system", "pcb"].includes(mode) && !mode.startsWith("part:"))
      throw new Error(`Unknown electronics view: ${mode}`);
    const roots = new Map();
    source.updateMatrixWorld(true);
    source.traverse((object) => {
      const id = object.userData.part_id;
      if (id && !roots.has(id)) roots.set(id, object);
    });
    for (const id of [
      "pcb_carrier",
      "module_esp",
      "module_charger",
      "module_reg5",
      "module_reg12",
    ])
      if (!roots.has(id) || !metadata[id])
        throw new Error(`R6 assembly required; missing current part ${id}`);
    const group = new THREE.Group(),
      parts = new Map(),
      entries = [],
      pickables = [],
      catalog = [],
      textures = new Map();
    group.name = `electronics-${mode}`;
    group.scale.setScalar(1000);
    function cloneMaterial(sourceMaterial) {
      const material = sourceMaterial.clone();
      for (const [key, value] of Object.entries(material)) {
        if (!value?.isTexture) continue;
        if (!textures.has(value)) textures.set(value, value.clone());
        material[key] = textures.get(value);
      }
      return material;
    }
    function register(mesh, detail) {
      const wire = detail.category === "wiring";
      const descriptor = {
        type: wire ? "jumper" : "component",
        id: detail.id,
        component: detail.id,
        label: detail.label,
        ...(wire ? { jumper: detail.id } : {}),
      };
      mesh.userData.perfboard = descriptor;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      entries.push({
        object: mesh,
        descriptor,
        layer: wire ? "wiring" : "components",
      });
      pickables.push(mesh);
    }
    for (const [id, sourcePart] of roots) {
      const detail = {
        ...sourcePart.userData,
        ...metadata[id],
        id,
        part_id: id,
      };
      if (!included(id, detail, mode)) continue;
      const part = sourcePart.clone(true);
      sourcePart.matrixWorld.decompose(
        part.position,
        part.quaternion,
        part.scale,
      );
      part.visible = true;
      const meshes = [];
      part.traverse((object) => {
        if (object.isMesh) meshes.push(object);
      });
      for (const mesh of meshes) {
        if (Array.isArray(mesh.material)) {
          // GLTF primitives are normally single-material meshes. Keep the
          // scene contract intact if a future export combines primitives.
          const replacement = new THREE.Group();
          replacement.copy(mesh, false);
          for (const range of mesh.geometry.groups) {
            const primitive = new THREE.Mesh(
              mesh.geometry.clone(),
              cloneMaterial(mesh.material[range.materialIndex]),
            );
            primitive.geometry.clearGroups();
            primitive.geometry.setDrawRange(range.start, range.count);
            replacement.add(primitive);
            register(primitive, detail);
          }
          mesh.parent.add(replacement);
          mesh.parent.remove(mesh);
        } else {
          mesh.geometry = mesh.geometry.clone();
          mesh.material = cloneMaterial(mesh.material);
          register(mesh, detail);
        }
      }
      group.add(part);
      parts.set(id, part);
      catalog.push(detail);
    }
    if (!parts.size) throw new Error(`No supported parts found for ${mode}`);
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    group.position.sub(box.getCenter(new THREE.Vector3()));
    group.updateMatrixWorld(true);
    const title =
      mode === "system"
        ? "R6 electronics · current assembly"
        : mode === "pcb"
          ? "R6 populated carrier"
          : catalog.find((item) => item.id === mode.slice(5))?.label || "Part";
    return {
      model: {
        group,
        parts,
        entries,
        pickables,
        occluders: [],
        positions: new Map(),
        netColor: () => new THREE.Color(0x315d7c).convertSRGBToLinear(),
        board: {
          id: mode,
          name: title,
          description:
            "R6 prototype / physical verification pending. Check each part’s confidence metadata. Nominal package detail and logical wire callouts do not establish measured pin locations or hardware qualification.",
          components: [],
          jumpers: [],
          rows: ["A"],
          columns: 1,
        },
      },
      catalog,
    };
  }
  function loadSource() {
    if (!sourcePromise) {
      sourcePromise = Promise.all([
        new Promise((resolve, reject) => {
          new THREE.GLTFLoader().load(
            "preview/full-assembly.glb",
            (gltf) => resolve(gltf.scene),
            undefined,
            reject,
          );
        }),
        window.fetch("preview/assembly-parts.json").then((response) => {
          if (!response.ok)
            throw new Error(`Part catalog failed to load (${response.status})`);
          return response.json();
        }),
      ]).catch((error) => {
        sourcePromise = undefined;
        throw error;
      });
    }
    return sourcePromise;
  }
  async function load(mode = "system") {
    const [scene, metadata] = await loadSource();
    return createModel(scene, metadata, mode);
  }
  return { load, createModel };
})();
