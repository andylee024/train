"use client";

/**
 * Intake state — goals + days/wk + constraints chips picked during onboarding.
 * Persisted to localStorage so it survives navigation. Used by the marketplace
 * to rank coaches and by the synthesis step to inform the plan generator.
 */
import { useCallback, useEffect, useState } from "react";

const KEY = "plan.intake.v1";

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
