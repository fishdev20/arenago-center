"use client";

import * as React from "react";

type Mode = "create" | "edit";

let listeners: Array<() => void> = [];
let state = { open: false, mode: "create" as Mode };

function setState(next: typeof state) {
  state = next;
  listeners.forEach((l) => l());
}

export function useFieldDialog() {
  const [, force] = React.useState(0);

  React.useEffect(() => {
    const onChange = () => force((x) => x + 1);
    listeners.push(onChange);
    return () => {
      listeners = listeners.filter((l) => l !== onChange);
    };
  }, []);

  return {
    dialogOpen: state.open,
    mode: state.mode,
    openCreate: () => setState({ open: true, mode: "create" }),
    openEdit: () => setState({ open: true, mode: "edit" }),
    close: () => setState({ open: false, mode: "create" }),
  };
}
