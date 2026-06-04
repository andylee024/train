"use client";

/**
 * Intake state — goals + days/wk + constraints chips picked during onboarding.
 * Persisted to localStorage so it survives navigation. Used by the marketplace
 * to rank coaches and by the synthesis step to inform the plan generator.
 *
 * Also exports useReviewNotes (same persistence pattern) for the textarea on
 * the review-blend step (A24-291).
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "plan.intake.v1";
const NOTES_KEY = "plan.reviewNotes.v1";

export type GoalKey =
  | "stronger"
  | "build-muscle"
  | "jump-higher"
  | "run-faster"
  | "look-ripped"
  | "more-flexible"
  | "hybrid"
  | "longevity"
  | "sport-prep";

export type ConstraintKey =
  | "shoulder"
  | "knees"
  | "wrists"
  | "lower-back"
  | "hips"
  | "limited-equipment"
  | "no-gym"
  | "time-constrained"
  | "travel-often";

export type Intake = {
  goals: GoalKey[];
  daysPerWeek: number | null;
  constraints: ConstraintKey[];
};

const EMPTY: Intake = { goals: [], daysPerWeek: null, constraints: [] };

function read(): Intake {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Intake;
    return {
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      daysPerWeek: typeof parsed.daysPerWeek === "number" ? parsed.daysPerWeek : null,
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(intake: Intake) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(intake));
}

export function useIntake() {
  const [intake, setIntake] = useState<Intake>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIntake(read());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setIntake(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setGoals = useCallback((goals: GoalKey[]) => {
    setIntake((prev) => {
      const next = { ...prev, goals };
      write(next);
      return next;
    });
  }, []);

  const setDays = useCallback((daysPerWeek: number | null) => {
    setIntake((prev) => {
      const next = { ...prev, daysPerWeek };
      write(next);
      return next;
    });
  }, []);

  const setConstraints = useCallback((constraints: ConstraintKey[]) => {
    setIntake((prev) => {
      const next = { ...prev, constraints };
      write(next);
      return next;
    });
  }, []);

  const toggleGoal = useCallback((g: GoalKey) => {
    setIntake((prev) => {
      const next = {
        ...prev,
        goals: prev.goals.includes(g)
          ? prev.goals.filter((x) => x !== g)
          : [...prev.goals, g],
      };
      write(next);
      return next;
    });
  }, []);

  const removeGoal = useCallback((g: GoalKey) => {
    setIntake((prev) => {
      const next = { ...prev, goals: prev.goals.filter((x) => x !== g) };
      write(next);
      return next;
    });
  }, []);

  const toggleConstraint = useCallback((c: ConstraintKey) => {
    setIntake((prev) => {
      const next = {
        ...prev,
        constraints: prev.constraints.includes(c)
          ? prev.constraints.filter((x) => x !== c)
          : [...prev.constraints, c],
      };
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setIntake(EMPTY);
    write(EMPTY);
  }, []);

  const isComplete = intake.goals.length > 0 && intake.daysPerWeek !== null;

  return {
    intake,
    hydrated,
    isComplete,
    setGoals,
    setDays,
    setConstraints,
    toggleGoal,
    toggleConstraint,
    removeGoal,
    clear,
    clearIntake: clear,
  };
}

// ─── Review notes — A24-291 ───────────────────────────────────────────────

function readNotes(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeNotes(value: string) {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(NOTES_KEY, value);
  else window.localStorage.removeItem(NOTES_KEY);
}

export function useReviewNotes() {
  const [notes, setNotesState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setNotesState(readNotes());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === NOTES_KEY) setNotesState(readNotes());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setNotes = useCallback((value: string) => {
    setNotesState(value);
    writeNotes(value);
  }, []);

  const clear = useCallback(() => {
    setNotesState("");
    writeNotes("");
  }, []);

  return { notes, hydrated, setNotes, clear };
}
