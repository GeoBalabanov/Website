"use client";

import { useSyncExternalStore } from "react";
import { GRADIENT_KEY, LEGACY_LOOK_KEY, THEME_KEY } from "./look-script";

/**
 * The site's look, as two independent switches remembered per browser:
 * Light / Dark (on <html data-theme>, which the inline script in the layout sets
 * before the first paint, see look-script.ts) and Plain / Gradient (the backdrop).
 */
export type Theme = "light" | "dark";

const listeners = new Set<() => void>();
const get = (k: string) => {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
};
const put = (k: string, v: string) => {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    // Storage can be unavailable (private mode); the switch still works for this visit.
  }
};

let theme: Theme | null = null;
let gradient: boolean | null = null;

function readTheme(): Theme {
  const t = get(THEME_KEY);
  if (t === "light" || t === "dark") return t;
  return get(LEGACY_LOOK_KEY) === "dark" ? "dark" : "light";
}
function readGradient(): boolean {
  const g = get(GRADIENT_KEY);
  if (g !== null) return g === "1";
  return get(LEGACY_LOOK_KEY) === "gradient";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(value: Theme) {
  theme = value;
  document.documentElement.dataset.theme = value;
  put(THEME_KEY, value);
  listeners.forEach((l) => l());
}

export function setGradient(value: boolean) {
  gradient = value;
  put(GRADIENT_KEY, value ? "1" : "0");
  listeners.forEach((l) => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, () => (theme ??= readTheme()), () => "light");
}

export function useGradient(): boolean {
  return useSyncExternalStore(subscribe, () => (gradient ??= readGradient()), () => false);
}
