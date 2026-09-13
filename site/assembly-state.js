(function (root) {
  "use strict";
  const shellIds = ["body", "lid", "rail", "diffuser"];
  function defaults(meta) {
    return meta.default_visible !== false && !meta.unsupported;
  }
  function visible(meta, mode) {
    if (!defaults(meta)) return false;
    if (mode === "internals" || mode === "wiring")
      return !shellIds.includes(meta.part_id);
    if (mode === "board")
      return meta.part_id === "pcb_main" || meta.category === "pcb_component";
    return true;
  }
  function offset(meta, mode, amount) {
    if (mode === "diffuser") {
      if (meta.part_id === "rail") return [0, 0, 42 * Math.min(1, amount * 2)];
      if (meta.part_id === "diffuser")
        return [0, 0, 34 * Math.max(0, (amount - 0.5) * 2)];
      if (meta.diffuser_service) return [0, 0, 54 * Math.min(1, amount * 2)];
      return [0, 0, 0];
    }
    return mode === "exploded"
      ? (meta.explode_mm || [0, 0, 0]).map((v) => v * amount)
      : [0, 0, 0];
  }
  // CAD X right, Y rear, Z up → glTF X right, Y up, Z forward.
  function gltfOffset(vector) {
    return [vector[0] / 1000, vector[2] / 1000, -vector[1] / 1000];
  }
  const api = { defaults, visible, offset, gltfOffset };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DarkMothAssembly = api;
})(typeof window === "undefined" ? {} : window);
