/* global THREE */
// Physical conductors and stripped solder windows, shared by every board layout.
window.DarkMothPerfboardConnections = (() => {
  const holes = (wire) => wire.joined_holes || [wire.from, wire.to];
  function along(points) {
    const lengths = [0];
    for (let i = 1; i < points.length; i++)
      lengths.push(lengths.at(-1) + points[i].distanceTo(points[i - 1]));
    return lengths;
  }
  function atDistance(points, lengths, distance) {
    for (let i = 1; i < points.length; i++)
      if (distance <= lengths[i])
        return points[i - 1]
          .clone()
          .lerp(
            points[i],
            (distance - lengths[i - 1]) / (lengths[i] - lengths[i - 1] || 1),
          );
    return points.at(-1).clone();
  }
  function slice(points, lengths, from, to) {
    return [
      atDistance(points, lengths, from),
      ...points
        .filter((_, i) => lengths[i] > from && lengths[i] < to)
        .map((p) => p.clone()),
      atDistance(points, lengths, to),
    ];
  }
  function nearest(points, lengths, target) {
    let found = null;
    for (let i = 1; i < points.length; i++) {
      const vector = points[i].clone().sub(points[i - 1]);
      const t = THREE.MathUtils.clamp(
        target
          .clone()
          .sub(points[i - 1])
          .dot(vector) / (vector.lengthSq() || 1),
        0,
        1,
      );
      const position = points[i - 1].clone().addScaledVector(vector, t);
      const separation = position.distanceToSquared(target);
      if (!found || separation < found.separation)
        found = {
          position,
          separation,
          distance: lengths[i - 1] + t * vector.length(),
        };
    }
    return found;
  }
  function draw({ board, positions, point, tube, netColor }) {
    for (const wire of board.jumpers) {
      const bare =
        wire.insulated === false ||
        wire.connection_style === "component_lead_bridge";
      const descriptor = {
        type: "jumper",
        id: wire.id,
        jumper: wire.id,
        conductor_id: wire.conductor_id || wire.id,
        connection_style: wire.connection_style,
        source_pin: wire.source_pin,
        net: wire.net,
        from: wire.from,
        to: wire.to,
        joined_holes: [...holes(wire)],
        label: `${wire.id} · ${holes(wire).join(" → ")} · ${wire.net}`,
        side: "bottom",
      };
      const points = wire.route_mm.map(point),
        lengths = along(points);
      const total = lengths.at(-1);
      tube(points, bare ? 0.22 : 0.18, 0xc4c6c3, descriptor, "wiring", {
        metalness: 0.85,
        roughness: 0.28,
      });
      if (bare) continue;
      const windows = [];
      for (const hole of holes(wire)) {
        const xy = positions.get(hole);
        if (!xy) continue;
        const pad = point([...xy, -board.size_mm[2]]);
        const tap = nearest(points, lengths, pad);
        windows.push([
          Math.max(0, tap.distance - 0.8),
          Math.min(total, tap.distance + 0.8),
        ]);
        // Intermediate bus windows are soldered up to their named pad. The
        // short metal neck makes that real join visible below the substrate.
        if (tap.separation > 0.00001)
          tube([tap.position, pad], 0.25, 0xb9bdbc, descriptor, "wiring", {
            metalness: 0.86,
            roughness: 0.26,
          });
      }
      windows.sort((a, b) => a[0] - b[0]);
      let cursor = 0;
      for (const [from, to] of [...windows, [total, total]]) {
        if (from > cursor + 0.01)
          tube(
            slice(points, lengths, cursor, from),
            0.32,
            netColor(wire.net),
            descriptor,
            "wiring",
            { roughness: 0.42 },
          );
        cursor = Math.max(cursor, to);
      }
    }
  }
  return { holes, draw };
})();
