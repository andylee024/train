"use client";

/**
 * Dashboard config editor state.
 *
 * Wraps a server-built DashboardConfig with localStorage overrides and edit
 * mutators (add / remove / configure / reorder). Save commits the working
 * config to localStorage; cancel reverts to the saved value. Per-tab keyed by
 * `config.id`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DashboardConfig, WidgetSpec } from "@/lib/widgets/types";

// Bumped 2026-05-25 to invalidate saved overrides that referenced now-renamed
// key lifts (Pull-Up → Chin-up/Pull-up, Vertical Jump → Seated Vertical Jumps,
// etc.). All views revert to their current default config on next load.
const STORAGE_PREFIX = "dashboard.v2.";

function loadOverride(id: string): DashboardConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardConfig;
  } catch {
    return null;
  }
}

function saveOverride(id: string, cfg: DashboardConfig | null) {
  if (typeof window === "undefined") return;
  const k = STORAGE_PREFIX + id;
  if (cfg === null) window.localStorage.removeItem(k);
  else window.localStorage.setItem(k, JSON.stringify(cfg));
}

export type DashboardEditor = {
  /** The active config — saved override if present, else the default. */
  config: DashboardConfig;
  /** True while the user is in edit mode. */
  editing: boolean;
  /** True if working config differs from saved. */
  dirty: boolean;
  toggleEdit: () => void;
  /** Add a widget to the end of section `sectionIdx`. */
  addWidget: (sectionIdx: number, spec: WidgetSpec) => void;
  /** Remove widget at (sectionIdx, widgetIdx). */
  removeWidget: (sectionIdx: number, widgetIdx: number) => void;
  /** Replace the props of an existing widget. */
  configureWidget: (sectionIdx: number, widgetIdx: number, props: WidgetSpec["props"]) => void;
  /** Move widget within a section. */
  reorderWidget: (sectionIdx: number, fromIdx: number, toIdx: number) => void;
  /** Persist working config and exit edit mode. */
  save: () => void;
  /** Revert to saved config and exit edit mode. */
  cancel: () => void;
  /** Drop saved override; restore default config. */
  resetToDefault: () => void;
};

export function useDashboardConfig(defaultConfig: DashboardConfig): DashboardEditor {
  // Saved = what's persisted (default + any localStorage override applied)
  // Working = what's currently being edited (mutates during edit mode)
  const [saved, setSaved] = useState<DashboardConfig>(defaultConfig);
  const [working, setWorking] = useState<DashboardConfig>(defaultConfig);
  const [editing, setEditing] = useState(false);

  // Hydrate from localStorage on mount and whenever the default changes (e.g. tab switch)
  const lastIdRef = useRef<string>("");
  useEffect(() => {
    if (lastIdRef.current === defaultConfig.id) return;
    lastIdRef.current = defaultConfig.id;
    const override = loadOverride(defaultConfig.id);
    const base = override ?? defaultConfig;
    setSaved(base);
    setWorking(base);
    setEditing(false);
  }, [defaultConfig]);

  const dirty = useMemo(
    () => JSON.stringify(working) !== JSON.stringify(saved),
    [working, saved]
  );

  const toggleEdit = useCallback(() => {
    setEditing((e) => {
      if (e) setWorking(saved); // discard on toggling off
      return !e;
    });
  }, [saved]);

  const mutate = useCallback(
    (fn: (cfg: DashboardConfig) => DashboardConfig) => {
      setWorking((w) => fn(structuredClone(w)));
    },
    []
  );

  const addWidget = useCallback(
    (sectionIdx: number, spec: WidgetSpec) =>
      mutate((cfg) => {
        cfg.sections[sectionIdx]?.widgets.push(spec);
        return cfg;
      }),
    [mutate]
  );

  const removeWidget = useCallback(
    (sectionIdx: number, widgetIdx: number) =>
      mutate((cfg) => {
        cfg.sections[sectionIdx]?.widgets.splice(widgetIdx, 1);
        return cfg;
      }),
    [mutate]
  );

  const configureWidget = useCallback(
    (sectionIdx: number, widgetIdx: number, props: WidgetSpec["props"]) =>
      mutate((cfg) => {
        const w = cfg.sections[sectionIdx]?.widgets[widgetIdx];
        if (w) (w as { props: WidgetSpec["props"] }).props = props;
        return cfg;
      }),
    [mutate]
  );

  const reorderWidget = useCallback(
    (sectionIdx: number, fromIdx: number, toIdx: number) =>
      mutate((cfg) => {
        const arr = cfg.sections[sectionIdx]?.widgets;
        if (!arr) return cfg;
        const [moved] = arr.splice(fromIdx, 1);
        if (moved) arr.splice(toIdx, 0, moved);
        return cfg;
      }),
    [mutate]
  );

  const save = useCallback(() => {
    saveOverride(working.id, working);
    setSaved(working);
    setEditing(false);
  }, [working]);

  const cancel = useCallback(() => {
    setWorking(saved);
    setEditing(false);
  }, [saved]);

  const resetToDefault = useCallback(() => {
    saveOverride(defaultConfig.id, null);
    setSaved(defaultConfig);
    setWorking(defaultConfig);
    setEditing(false);
  }, [defaultConfig]);

  return {
    config: editing ? working : saved,
    editing,
    dirty,
    toggleEdit,
    addWidget,
    removeWidget,
    configureWidget,
    reorderWidget,
    save,
    cancel,
    resetToDefault,
  };
}
