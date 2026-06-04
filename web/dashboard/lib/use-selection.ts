"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Coach selection state, persisted to localStorage so it survives navigation
 * between /plan/new (marketplace) and /plan/coaches/[id] (profile).
 *
 * Cross-tab sync via the `storage` event so two open windows stay aligned.
 */

const KEY = "plan.selection.v1";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(ids));
}

export function useSelection() {
  const [selected, setSelected] = useState<string[]>([]);

  // Hydrate on mount + listen for cross-tab changes
  useEffect(() => {
    setSelected(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setSelected(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((prev) => {
      const next = prev.filter((x) => x !== id);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
    write([]);
  }, []);

  const has = useCallback((id: string) => selected.includes(id), [selected]);

  const addMany = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const next = [...prev];
      for (const id of ids) if (!next.includes(id)) next.push(id);
      write(next);
      return next;
    });
  }, []);

  return { selected, toggle, remove, clear, has, addMany };
}
