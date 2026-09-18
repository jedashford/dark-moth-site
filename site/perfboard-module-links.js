/* global THREE */
// Logical links deliberately terminate outside the module, not at guessed pins.
window.DarkMothPerfboardModuleLinks = (() => {
  function draw(model, register) {
    const { board, positions } = model;
    const point = ([x, row, height]) =>
      new THREE.Vector3(
        x - board.size_mm[0] / 2,
        height,
        row - board.size_mm[1] / 2,
      );
    function label(text, position, descriptor, width = 15) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 96;
      const context = canvas.getContext("2d");
      context.fillStyle = "rgba(250,251,245,.97)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#284c49";
      context.font = "600 54px system-ui, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(text, 320, 48, 625);
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: texture, depthWrite: false }),
      );
      sprite.position.copy(point(position));
      sprite.scale.set(width, 2.1, 1);
      register(model, sprite, descriptor, "wiring", true);
    }
    for (const module of board.modules || []) {
      const links = (board.module_links || []).filter(
        (link) => link.module === module.ref,
      );
      const [x, y, width, depth] = module.zone_mm;
      const right = x + width / 2 > board.size_mm[0] / 2;
      const rail = right ? board.size_mm[0] + 5 : -5;
      for (const [index, link] of links.entries()) {
        if (!positions.has(link.hole))
          throw new Error(`Unknown carrier connection hole: ${link.hole}`);
        const row = y + ((index + 0.5) * depth) / links.length;
        const height = module.pcb_origin_mm[2];
        const [hx, hy] = positions.get(link.hole);
        const route = [
          point([hx, hy, 0.25]),
          point([hx, hy, 1.1]),
          point([rail, hy, 1.1]),
          point([rail, row, height]),
        ];
        const descriptor = {
          type: "module-link",
          id: link.id,
          jumper: link.id,
          component: module.ref,
          module: module.ref,
          net: link.net,
          hole: link.hole,
          role: link.role,
          schematic: true,
          label: `${link.hole} → ${module.ref}.${link.role} · connection callout, not a physical pin position`,
        };
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(route),
          new THREE.LineDashedMaterial({
            color: model.netColor(link.net),
            dashSize: 0.75,
            gapSize: 0.65,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
          }),
        );
        line.computeLineDistances();
        register(model, line, descriptor, "wiring", true);
        label(
          `${module.ref}.${link.role}`,
          [rail + (right ? 8 : -8), row, height],
          descriptor,
        );
      }
    }
    if (board.module_links?.length)
      label(
        "Connection callouts, not pin positions",
        [board.size_mm[0] / 2, -4, 0],
        {
          type: "callout-legend",
          schematic: true,
          label: "Connection callouts, not pin positions",
        },
        36,
      );
  }
  return { draw };
})();
