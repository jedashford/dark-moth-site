/* Pure assembly navigation, shared by the browser and Node tests. */
(function (scope) {
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
    ];
  }
  function steps(board) {
    const result = [
      {
        type: "prepare",
        label: "Check the blank board",
        text: "Disconnect all power. Check that neighboring copper pads are separate. Mark A1 on the component side and the same physical corner underneath. Identify transistor leg roles from the actual manufacturer's data sheet before inserting them.",
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
        text: part.notes.join(" "),
        componentIds: [...componentIds],
        jumperIds: [],
      });
    }
    for (const jumper of board.jumpers) {
      jumperIds.push(jumper.id);
      result.push({
        type: "jumper",
        jumper: jumper.id,
        activeNet: jumper.net,
        label: `Wire ${jumper.from} → ${jumper.to}`,
        text:
          jumper.connection_style === "continuous_ground_bus"
            ? `Continue the same insulated ground-bus wire from ${jumper.from} to ${jumper.to}. The complete bus visits C2, C4, C6, C8, C10 and C13. Strip a small window only at each named pad, solder it to the source/pulldown junction, and keep the spans insulated. Check continuity at this segment.`
            : `On the solder side, add an insulated wire between ${jumper.from} and ${jumper.to} for ${jumper.net}. Solder only the ends to those pads or their trimmed component legs. A crossing is not a connection. Check continuity between the two endpoints.`,
        componentIds: [...componentIds],
        jumperIds: [...jumperIds],
      });
    }
    result.push({
      type: "harness",
      label: "Attach the external wires",
      text: "Use the terminal table and the three module-to-module connections below, then section 7 of the written guide. Use one matching ESP model throughout. Disconnect battery and USB. Every listed terminal needs its external connection, including the ground return between boards.",
      componentIds: [...componentIds],
      jumperIds: [...jumperIds],
    });
    result.push({
      type: "check",
      label: "Check one prototype",
      text: "Check every wire endpoint, diode stripe, transistor role and neighboring pad before power. The circuit still needs the electrical qualification in the written guide before powered batch assembly.",
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
  const api = { members, steps, terminalRows };
  if (typeof module !== "undefined") module.exports = api;
  else scope.DarkMothPerfboardState = api;
})(typeof window !== "undefined" ? window : {});
