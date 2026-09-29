"use client";

import { useSyncExternalStore } from "react";

/** Plain / Gradient preference, shared by the header and the backdrop and remembered per browser. */

const KEY = "gb:gradient";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

let current: boolean | null = null;

function getSnapshot(): boolean {
  if (current === null) current = read();
  return current;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setGradient(value: boolean) {
  current = value;
  try {
    window.localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    // Storage can be unavailable (private mode); the toggle still works for this visit.
  }
  listeners.forEach((l) => l());
}

export function useGradient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
