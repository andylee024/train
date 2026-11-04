import { addDays, weekStartSunday } from "./dates";
import { periodsFor, type PeriodWindow } from "./periods";
import type { E1rmPoint, LiftMeta, LiftView, LoadedSet, PeriodKind, PeriodRow, TopSet, WeekBar } from "./types";

/** Best estimated 1RM per day, newest top sets, and the period table for one lift. */
export function liftView(sets: LoadedSet[], lift: LiftMeta, kind: PeriodKind, today: string): LiftView {
  const mine = sets.filter((set) => set.liftKey === lift.key && set.date <= today);
  const points = bestByDate(mine);
  const first = mine.reduce<string | null>((earliest, set) => {
    if (!earliest || set.date < earliest) return set.date;
    return earliest;
  }, null);
  return {
    lift,
    points,
    topSets: lastTopSets(mine, 10),
    periods: first ? periodRows(mine, periodsFor(kind, today, first)) : [],
    best: points.reduce<E1rmPoint | null>((top, point) => {
      if (!top || point.e1rmLb > top.e1rmLb) return point;
      return top;
    }, null),
    latest: points.length > 0 ? points[points.length - 1] : null,
  };
}

/** Loaded tonnage for every Sunday week from the first set through today. */
export function weeklyTonnage(sets: LoadedSet[], today: string): WeekBar[] {
  const dated = sets.filter((set) => set.date <= today);
  if (dated.length === 0) return [];
  const first = dated.reduce((earliest, set) => (set.date < earliest ? set.date : earliest), dated[0].date);
  const totals = new Map<string, number>();
  for (const set of dated) {
    const week = weekStartSunday(set.date);
    totals.set(week, (totals.get(week) ?? 0) + set.tonnageLb);
  }
  const bars: WeekBar[] = [];
  for (let week = weekStartSunday(first); week <= weekStartSunday(today); week = addDays(week, 7)) {
    bars.push({ weekStart: week, tonnageLb: totals.get(week) ?? 0 });
  }
  return bars;
}

function bestByDate(sets: LoadedSet[]): E1rmPoint[] {
  const byDate = new Map<string, E1rmPoint>();
  for (const set of sets) {
    if (set.e1rmLb == null) continue;
    const previous = byDate.get(set.date);
    if (!previous || set.e1rmLb > previous.e1rmLb) {
      byDate.set(set.date, {
        date: set.date,
        e1rmLb: set.e1rmLb,
        weightLb: set.weightLb,
        reps: set.reps,
      });
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function lastTopSets(sets: LoadedSet[], count: number): TopSet[] {
  const byWorkout = new Map<string, TopSet>();
  for (const set of sets) {
    if (set.e1rmLb == null) continue;
    const previous = byWorkout.get(set.workoutId);
    if (!previous || set.e1rmLb > previous.e1rmLb) {
      byWorkout.set(set.workoutId, {
        date: set.date,
        weightLb: set.weightLb,
        reps: set.reps,
        e1rmLb: set.e1rmLb,
      });
    }
  }
  return [...byWorkout.values()]
    .sort((a, b) => b.date.localeCompare(a.date) || b.e1rmLb - a.e1rmLb)
    .slice(0, count);
}

function periodRows(sets: LoadedSet[], windows: PeriodWindow[]): PeriodRow[] {
  const rows: PeriodRow[] = windows.map((window) => {
    const inside = sets.filter((set) => set.date >= window.start && set.date <= window.end);
    return {
      ...window,
      sessions: new Set(inside.map((set) => set.workoutId)).size,
      loadedSets: inside.length,
      tonnageLb: inside.reduce((sum, set) => sum + set.tonnageLb, 0),
      deltaTonnageLb: null,
      deltaPct: null,
    };
  });
  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1].tonnageLb;
    const delta = rows[index].tonnageLb - previous;
    rows[index].deltaTonnageLb = delta;
    rows[index].deltaPct = previous > 0 ? (delta / previous) * 100 : null;
  }
  return rows.reverse();
}
