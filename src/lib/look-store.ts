"use client";

import { useSyncExternalStore } from "react";
import { LOOK_KEY as KEY, OLD_LOOK_KEY as OLD_KEY } from "./look-script";

/**
 * Plain / Gradient / Dark: the site's look, shared by the header and the backdrop
 * and remembered per browser. It lives on <html data-look>, which the inline script
 * in the layout sets before the first paint (see look-script.ts), so dark never flashes.
 */
export type Look = "plain" | "gradient" | "dark";

const listeners = new Set<() => void>();

function read(): Look {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "plain" || v === "gradient" || v === "dark") return v;
    return window.localStorage.getItem(OLD_KEY) === "1" ? "gradient" : "plain";
  } catch {
    return "plain";
  }
}

let current: Look | null = null;

function getSnapshot(): Look {
  if (current === null) current = read();
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setLook(value: Look) {
  current = value;
  document.documentElement.dataset.look = value;
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Storage can be unavailable (private mode); the switch still works for this visit.
  }
  listeners.forEach((l) => l());
}

export function useLook(): Look {
  return useSyncExternalStore(subscribe, getSnapshot, () => "plain");
}
