"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Units = "metric" | "imperial";

export type Settings = {
  stepGoal: number;
  weeklyZoneGoal: number;
  units: Units;
};

export const DEFAULT_SETTINGS: Settings = {
  stepGoal: 10_000,
  weeklyZoneGoal: 150,
  units: "metric",
};

const KEY = "wristside:settings";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Settings } = { raw: null, value: DEFAULT_SETTINGS };

/** Per-viewer preferences in localStorage; falls back to defaults when storage is unavailable. */
function read(): Settings {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {}
  if (raw !== cache.raw) {
    let parsed: Partial<Settings> = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {}
    cache = { raw, value: { ...DEFAULT_SETTINGS, ...parsed } };
  }
  return cache.value;
}

function write(next: Settings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: keep the change for this session only.
    cache = { raw: cache.raw, value: next };
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type Ctx = Settings & { update: (patch: Partial<Settings>) => void };
const SettingsContext = createContext<Ctx>({ ...DEFAULT_SETTINGS, update: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS);
  const update = (patch: Partial<Settings>) => write({ ...settings, ...patch });
  return <SettingsContext.Provider value={{ ...settings, update }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);

const KM_PER_MILE = 1.609344;

/** Formats a distance given in km according to the viewer's unit preference. */
export function useDistance() {
  const { units } = useSettings();
  const unit = units === "imperial" ? "mi" : "km";
  const convert = (km: number) => (units === "imperial" ? km / KM_PER_MILE : km);
  return {
    unit,
    value: (km: number | null | undefined, digits = 1) =>
      km === null || km === undefined ? "–" : convert(km).toFixed(digits),
    label: (km: number | null | undefined, digits = 2) =>
      km === null || km === undefined || km === 0 ? "–" : `${convert(km).toFixed(digits)} ${unit}`,
  };
}
