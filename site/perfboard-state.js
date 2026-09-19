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
  function jointInstruction(board, joint) {
    const depth = (
      -Math.min(...joint.points_mm.map((point) => point[2])) - board.size_mm[2]
    ).toFixed(1);
    return joint.formation === "retained_component_lead"
      ? `Do not trim ${joint.component_ref} leg ${joint.pin_role} at ${joint.hole} yet: retain it to the ${joint.net} wire window ${depth} mm below the board underside. Solder there, then trim only excess.`
      : `Fit one added solid-wire riser at ${joint.hole}. Join its lower end to the ${joint.net} wire window ${depth} mm below the board underside; lap-solder the module/button cable at the pad, without adding a second wire through that hole.`;
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
    if (holes.length > 2 && !reusedLead && !groundBus) {
      kind = "Insulated net conductor";
      label = `Wire all ${connection.net} joints`;
      text = `Use one insulated conductor along ${route}. Make a stripped solder window at every named joint; keep all other spans and crossings insulated. These ${holes.length} joints share ${connection.net}. A drawn crossing does not join another net. Check continuity to every listed joint, not just the first and last. ${connection.instructions || ""}`;
    }
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
          ? `Use one dedicated ground-bus conductor along ${fullRoute}. Solder every named tap. Size this conductor for the measured module and LED return current; a resistor leg must not carry that load. Insulate any crossing that is not a declared joint. ${board.hardware_revision === "R6" ? "Check continuity from every named tap to the specified supply ground. Keep the LED power-return conductor separate from the controller ground lead until their supply junction." : "Check continuity from every named tap to protected CHG.OUT−; keep BAT− separate."}`
          : `Run one dedicated insulated ground-bus wire from ${connection.from} to ${connection.to}. The complete bus visits ${fullRoute}. Strip a small window only at each named pad, solder the tap, and keep spans insulated. Size the conductor for the measured return current. Check continuity at every named tap.`;
    }
    for (const joint of connection.solder_joints || [])
      text += " " + jointInstruction(board, joint);
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
    const joints = unique.flatMap((wire) => wire.solder_joints || []);
    if (joints.length) {
      counts.retainedRisers = joints.filter(
        (joint) => joint.formation === "retained_component_lead",
      ).length;
      counts.riserWires = joints.filter(
        (joint) => joint.formation === "single_riser_wire",
      ).length;
      counts.retainedLeads += counts.retainedRisers;
      counts.addedWires += counts.riserWires;
    }
    return counts;
  }
  function componentInstructions(board, part) {
    const notes = [...(part.notes || [])];
    if (part.adapter)
      notes.push(
        `${part.adapter.product}: ${part.adapter.face}. ${part.adapter.packages.length} SOT23 package(s) on this adapter. The carrier pin roles below refer to this adapter, not a TO92 package.`,
      );
    if (part.adapter?.instructions) notes.push(part.adapter.instructions);
    for (const connection of board.jumpers.filter(
      (item) =>
        item.connection_style === "component_lead_bridge" &&
        item.source_pin.component === part.ref,
    ))
      notes.push(
        `Do not trim leg ${connection.source_pin.role}: retain at least ${connection.retained_lead_mm} mm below the seated board for ${connection.id} (${joinedHoles(connection).join(" → ")}). Check the actual leg is long enough before soldering.`,
      );
    for (const joint of board.jumpers
      .flatMap((wire) => wire.solder_joints || [])
      .filter((joint) => joint.component_ref === part.ref))
      notes.push(jointInstruction(board, joint));
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
    for (const part of board.modules || []) {
      componentIds.push(part.ref);
      result.push({
        type: "module",
        module: part.ref,
        label: `Mount ${part.ref} · ${part.label}`,
        text: `${Array.isArray(part.mounting_notes) ? part.mounting_notes.join(" ") : part.mounting_notes} ${part.pin_position_status}`,
        componentIds: [...componentIds],
        jumperIds: [...jumperIds],
      });
    }
    for (const link of board.module_links || []) {
      jumperIds.push(link.id);
      result.push({
        type: "module-link",
        moduleLink: link.id,
        jumper: link.id,
        activeNet: link.net,
        label: `Wire ${link.hole} → ${link.module}.${link.role}`,
        text: `Use one short insulated wire from carrier joint ${link.hole} to the actual printed module label shown in the inspector. The 3D module callout is not a physical pin position. Match the selected controller GPIO map. Keep battery and USB disconnected.`,
        componentIds: [...componentIds],
        jumperIds: [...jumperIds],
      });
    }
    for (const connector of board.external_connectors || []) {
      componentIds.push(connector.ref);
      jumperIds.push(connector.ref);
      result.push({
        type: "external-connector",
        connector: connector.ref,
        label: `Connect ${connector.label}`,
        text:
          connector.pins
            .map((pin) => `${pin.number}: ${pin.from} → ${pin.to}`)
            .join("; ") +
          ". Disconnect battery and USB; match mating contacts by continuity before connecting devices.",
        componentIds: [...componentIds],
        jumperIds: [...jumperIds],
      });
    }
    result.push({
      type: "harness",
      label: "Attach the external wires",
      text: "Use the terminal table and the module-to-module connection list, then the written guide for your selected layout. Use one matching ESP model throughout. Disconnect battery and USB. Every listed terminal needs its external connection; follow this layout's ground routing.",
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
