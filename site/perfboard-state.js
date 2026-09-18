/* Pure assembly navigation, shared by the browser and Node tests. */
(function (scope) {
  const joinedHoles = (connection) => [
    ...(connection.joined_holes || [connection.from, connection.to]),
  ];
  const conductorId = (connection) =>
    connection.conductor_id ||
    (connection.connection_style === "continuous_ground_bus"
      ? `ground-bus:${connection.net}`
      : connection.id);
  const sourceName = (connection) =>
    `${connection.source_pin.component}.${connection.source_pin.role}`;
  function connections(board) {
    const groups = new Map();
    for (const edge of board.jumpers) {
      const id = conductorId(edge),
        existing = groups.get(id);
      if (existing) {
        existing.ids.push(edge.id);
        existing.joined_holes = [
          ...new Set([...existing.joined_holes, ...joinedHoles(edge)]),
        ];
        existing.to = edge.to;
      } else
        groups.set(id, {
          ...edge,
          conductor_id: id,
          ids: [edge.id],
          joined_holes: joinedHoles(edge),
        });
    }
    return [...groups.values()];
  }
  function connectionInfo(board, connection) {
    connection =
      connections(board).find(
        (item) => item.conductor_id === conductorId(connection),
      ) || connection;
    const holes = joinedHoles(connection),
      route = holes.join(" → "),
      reusedLead = connection.connection_style === "component_lead_bridge",
      groundBus = connection.connection_style === "continuous_ground_bus";
    let kind = "Insulated wire",
      label = `Wire ${connection.from} → ${connection.to}`,
      text = `On the solder side, add an insulated wire between ${connection.from} and ${connection.to} for ${connection.net}. Solder only the named pads or their component legs. A crossing is not a connection. Check continuity between the two endpoints.`;
    if (reusedLead) {
      const source = sourceName(connection),
        length = connection.retained_lead_mm;
      kind = "Retained component leg";
      label = `Bend ${source}: ${connection.from} → ${connection.to}`;
      text = `Use the existing ${source} leg, not an additional wire. Keep at least ${length} mm of usable leg below the seated board. Bend it along ${route}; solder at every named hole for ${connection.net}. These are deliberate same-net joints. Trim only excess beyond the final joint after soldering. Check continuity at every named hole and check neighboring unlike-net pads for bridges. If the actual lead is too short or stiff, use an insulated link along this route instead; do not pull on the component body.`;
    } else if (groundBus) {
      const fullRoute = [
        ...new Set(
          board.jumpers
            .filter((item) => conductorId(item) === conductorId(connection))
            .flatMap(joinedHoles),
        ),
      ].join(" → ");
      kind = "Dedicated ground bus";
      label = `Ground bus ${connection.from} → ${connection.to}`;
      text =
        connection.insulated === false
          ? `Use one dedicated ground-bus conductor along ${fullRoute}. Solder every named tap. Size this conductor for the measured module and LED return current; a resistor leg must not carry that load. Insulate any crossing that is not a declared joint. Check continuity from every named tap to protected CHG.OUT−; keep BAT− separate.`
          : `Run one dedicated insulated ground-bus wire from ${connection.from} to ${connection.to}. The complete bus visits ${fullRoute}. Strip a small window only at each named pad, solder the tap, and keep spans insulated. Size the conductor for the measured return current. Check continuity at every named tap.`;
    }
    return {
      kind,
      label,
      text,
      joinedHoles: holes,
      sourcePin: connection.source_pin ? { ...connection.source_pin } : null,
      retainedLeadMm: connection.retained_lead_mm ?? null,
      conductorId: conductorId(connection),
    };
  }
  function connectionCounts(board) {
    const unique = connections(board);
    const counts = {
      retainedLeads: 0,
      insulatedWires: 0,
      busWires: 0,
      addedWires: 0,
      connections: unique.length,
    };
    for (const connection of unique) {
      if (connection.connection_style === "component_lead_bridge")
        counts.retainedLeads++;
      else {
        counts.addedWires++;
        if (connection.connection_style === "continuous_ground_bus")
          counts.busWires++;
        else counts.insulatedWires++;
      }
    }
    return counts;
  }
  function componentInstructions(board, part) {
    const notes = [...part.notes];
    for (const connection of board.jumpers.filter(
      (item) =>
        item.connection_style === "component_lead_bridge" &&
        item.source_pin.component === part.ref,
    ))
      notes.push(
        `Do not trim leg ${connection.source_pin.role}: retain at least ${connection.retained_lead_mm} mm below the seated board for ${connection.id} (${joinedHoles(connection).join(" → ")}). Check the actual leg is long enough before soldering.`,
      );
    return notes.join(" ");
  }
  function members(board, net) {
    return [
      ...board.components.flatMap((part) =>
        part.pins
          .filter((pin) => pin.net === net)
          .map((pin) => ({
            ...pin,
            label: `${part.ref} · ${pin.role}`,
            component: part.ref,
          })),
      ),
      ...board.terminals
        .filter((terminal) => terminal.net === net)
        .map((terminal) => ({ ...terminal, label: terminal.label })),
      ...(board.junctions || [])
        .filter((junction) => junction.net === net)
        .map((junction) => ({
          ...junction,
          id: junction.id || `junction:${junction.hole}`,
          junction: true,
          label: `Solder junction · ${junction.hole}`,
        })),
    ];
  }
  function steps(board) {
    const result = [
      {
        type: "prepare",
        label: "Check the blank board",
        text: "Disconnect all power. Check that neighboring copper pads are separate. Mark A1 on the component side and the same physical corner underneath. Identify transistor leg roles from the actual manufacturer's data sheet before inserting them. Leave the leads identified for direct connections untrimmed.",
        componentIds: [],
        jumperIds: [],
      },
    ];
    const componentIds = [],
      jumperIds = [];
    for (const part of board.components) {
      componentIds.push(part.ref);
      result.push({
        type: "component",
        component: part.ref,
        label: `Place ${part.ref} · ${part.value}`,
        text: componentInstructions(board, part),
        componentIds: [...componentIds],
        jumperIds: [],
      });
    }
    for (const jumper of connections(board)) {
      jumperIds.push(...jumper.ids);
      const info = connectionInfo(board, jumper);
      result.push({
        type: "jumper",
        jumper: jumper.id,
        connectionIds: [...jumper.ids],
        activeNet: jumper.net,
        label: info.label,
        text: info.text,
        componentIds: [...componentIds],
        jumperIds: [...jumperIds],
      });
    }
    result.push({
      type: "harness",
      label: "Attach the external wires",
      text: "Use the terminal table and the three module-to-module connections below, then section 7 of the written guide. Use one matching ESP model throughout. Disconnect battery and USB. Every listed terminal needs its external connection; follow this layout's ground routing.",
      componentIds: [...componentIds],
      jumperIds: [...jumperIds],
    });
    result.push({
      type: "check",
      label: "Check one prototype",
      text: "Check every named solder joint, diode stripe, transistor role and neighboring pad before power. The circuit still needs the electrical qualification in the written guide before powered batch assembly.",
      componentIds: [...componentIds],
      jumperIds: [...jumperIds],
    });
    return result;
  }
  function terminalRows(board, variant) {
    if (!["C3", "S3"].includes(variant)) throw new Error("Unknown ESP variant");
    return board.terminals.map((terminal) => ({
      ...terminal,
      destination: terminal.to[variant],
    }));
  }
  const api = {
    members,
    steps,
    terminalRows,
    joinedHoles,
    connections,
    connectionInfo,
    connectionCounts,
    componentInstructions,
  };
  if (typeof module !== "undefined") module.exports = api;
  else scope.DarkMothPerfboardState = api;
})(typeof window !== "undefined" ? window : {});
