import { getArcSummary, getTodaySession } from "@/lib/bundle";
import { getSetsForDate, getDailyMetrics } from "@/lib/queries";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Badge,
  Stat,
  PageHeader,
} from "@/components/ui";
import { format } from "@/lib/format";
import { CheckCircle2, Circle, Flame, Target, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [arc, session, todaysSets, bw] = await Promise.all([
    getArcSummary(),
    getTodaySession(),
    safeQuery(() => getSetsForDate()),
    safeQuery(() => getDailyMetrics(7)),
  ]);

  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // Group logged sets by exercise
  const setsByExercise = new Map<string, typeof todaysSets>();
  for (const s of todaysSets) {
    const list = setsByExercise.get(s.exercise_name) ?? [];
    list.push(s);
    setsByExercise.set(s.exercise_name, list);
  }

  const lastBw = bw.length ? bw[bw.length - 1].bodyweight_lb : null;
  const prevBw = bw.length >= 2 ? bw[bw.length - 2].bodyweight_lb : null;
  const bwDelta = lastBw && prevBw ? lastBw - prevBw : null;

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={weekday}
        subtitle={
          <div className="flex items-center gap-3">
            <span className="tabular">{monthDay}</span>
            <span className="text-[var(--ink-muted)]">·</span>
            {arc?.currentBlock?.name && (
              <Badge tone="accent">{arc.currentBlock.name}</Badge>
            )}
            {arc?.currentWeek && (
              <span className="text-[var(--ink-muted)]">
                Arc Wk {arc.currentWeek}/{arc.totalWeeks}
              </span>
            )}
          </div>
        }
      />

      {/* Top stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="Body weight"
              value={lastBw ? `${lastBw} lb` : "—"}
              sub={
                bwDelta != null
                  ? `${bwDelta > 0 ? "+" : ""}${bwDelta.toFixed(1)} vs prev`
                  : "no recent log"
              }
              trend={
                bwDelta != null
                  ? {
                      value: bwDelta > 0 ? "▲" : bwDelta < 0 ? "▼" : "·",
                      tone: bwDelta < 0 ? "good" : bwDelta > 0 ? "warn" : "muted",
                    }
                  : undefined
              }
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="Sessions this wk"
              value={uniqueWorkouts(todaysSets).toString()}
              sub="logged today"
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="Sets logged"
              value={todaysSets.length.toString()}
              sub={`${setsByExercise.size} exercises`}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="pt-5">
            <Stat
              label="Arc progress"
              value={
                arc?.currentWeek && arc?.totalWeeks
                  ? `${Math.round((arc.currentWeek / arc.totalWeeks) * 100)}%`
                  : "—"
              }
              sub={
                arc?.start && arc?.end
                  ? `${format.shortDate(arc.start)} → ${format.shortDate(arc.end)}`
                  : ""
              }
            />
          </CardBody>
        </Card>
      </div>

      {/* Today's session */}
      <Card className="mb-8">
        <CardHeader>
          <div>
            <CardTitle>Today's session</CardTitle>
            {session ? (
              <div className="mt-1 text-lg font-medium">{session.title}</div>
            ) : null}
          </div>
          {session && (
            <Badge tone="accent">
              <Target size={11} />
              {session.exercises.length} exercises
            </Badge>
          )}
        </CardHeader>
        <CardBody className="pt-1">
          {!session ? (
            <div className="text-sm text-[var(--ink-muted)] py-2">
              No session scheduled — recovery day or rest.
            </div>
          ) : (
            <div className="space-y-1">
              {session.exercises.map((ex, i) => {
                const logged = matchedSets(setsByExercise, ex.name);
                const done = logged.length > 0;
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[24px_1fr_auto_120px] gap-3 py-2.5 border-b border-[var(--line-soft)] last:border-0 items-center"
                  >
                    <div>
                      {done ? (
                        <CheckCircle2 size={16} className="text-[var(--good)]" />
                      ) : (
                        <Circle size={16} className="text-[var(--ink-muted)]" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{cleanName(ex.name)}</div>
                      {tagOf(ex.name) && (
                        <span className="text-[10px] font-mono text-[var(--ink-muted)] tracking-wider">
                          {tagOf(ex.name)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--ink-dim)] tabular">
                      {ex.prescription}
                    </div>
                    <div className="text-right text-xs text-[var(--ink-muted)] tabular">
                      {logged.length
                        ? `${logged.length} set${logged.length > 1 ? "s" : ""}`
                        : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Today's actual log */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Logged today</CardTitle>
            <div className="mt-1 text-xs text-[var(--ink-muted)]">
              From Supabase. Sets logged via the CLI or chat.
            </div>
          </div>
          <Activity size={16} className="text-[var(--ink-muted)]" />
        </CardHeader>
        <CardBody className="pt-1">
          {todaysSets.length === 0 ? (
            <div className="text-sm text-[var(--ink-muted)] py-3">
              Nothing logged yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {[...setsByExercise.entries()].map(([name, sets]) => (
                <div key={name}>
                  <div className="text-sm font-medium mb-1">{name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sets.map((s) => (
                      <Badge key={s.id} tone="muted">
                        <Flame size={10} />
                        {s.reps ?? "—"}×
                        {s.weight_value
                          ? `${s.weight_value} ${s.weight_unit ?? ""}`
                          : "bw"}
                        {s.rpe ? ` · RPE ${s.rpe}` : ""}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// Helpers

async function safeQuery<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[today] supabase query failed:", (e as Error).message);
    return [];
  }
}

function uniqueWorkouts(sets: { workout_id: string }[]): number {
  return new Set(sets.map((s) => s.workout_id)).size;
}

function tagOf(name: string): string | null {
  const m = name.match(/^\[(\w+)\]/);
  return m ? m[1] : null;
}

function cleanName(name: string): string {
  return name.replace(/^\[\w+\]\s*/, "");
}

function matchedSets(
  byEx: Map<string, { id: string }[]>,
  exerciseName: string
): { id: string }[] {
  const cleaned = cleanName(exerciseName).toLowerCase();
  for (const [n, sets] of byEx.entries()) {
    if (
      n.toLowerCase().includes(cleaned) ||
      cleaned.includes(n.toLowerCase())
    ) {
      return sets;
    }
  }
  return [];
}
