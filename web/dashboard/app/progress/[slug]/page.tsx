import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  resolveExerciseSlug,
  getExerciseSessions,
  getExerciseRepTable,
  nameToSlug,
  type RepTable,
} from "@/lib/queries";
import { PageHeader, Section } from "@/components/ui";
import { LineChartCard } from "@/components/charts";
import { format } from "@/lib/format";

export const dynamic = "force-dynamic";

const KG_PER_LB = 0.45359237;
const kgToLb = (kg: number) => kg / KG_PER_LB;

export default async function ExerciseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = await resolveExerciseSlug(slug);
  if (!name) notFound();

  const [sessions, repTable] = await Promise.all([
    getExerciseSessions(name, 3650),
    getExerciseRepTable(name),
  ]);

  // e1RM trajectory chart data
  const trajectory = sessions
    .filter((s) => s.bestE1rm_kg && s.bestE1rm_kg > 0)
    .map((s) => ({
      date: format.shortDate(s.date),
      e1rm: Math.round(kgToLb(s.bestE1rm_kg ?? 0)),
    }))
    .reverse();
  const current = trajectory[trajectory.length - 1];

  return (
    <div className="max-w-5xl">
      <Link
        href="/strength"
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] transition-colors mb-2"
      >
        <ChevronLeft size={11} /> Strength
      </Link>

      <PageHeader
        title={name}
        subtitle={
          current && repTable.bestE1rmKg > 0
            ? `current ${current.e1rm} lb · best e1RM ${Math.round(kgToLb(repTable.bestE1rmKg))} lb (${repTable.bestE1rmWeight_kg ? Math.round(kgToLb(repTable.bestE1rmWeight_kg)) : "—"} × ${repTable.bestE1rmReps} on ${format.shortDate(repTable.bestE1rmDate)})`
            : "no data"
        }
      />

      <Section label="e1RM Trajectory" meta="Brzycki · session-best · all-time">
        {trajectory.length === 0 ? (
          <div className="text-[12px] text-[var(--ink-muted)] py-4">
            No e1RM-able sets logged.
          </div>
        ) : (
          <LineChartCard data={trajectory} xKey="date" yKey="e1rm" label="e1RM" unit=" lb" />
        )}
      </Section>

      <Section label="Rep Records" meta="actual vs estimated from best e1RM">
        <RepTableView table={repTable} />
      </Section>

      <Section label="Sessions" meta={`${sessions.length} total · most recent first`}>
        <SessionsTable sessions={sessions.slice(0, 30)} exerciseName={name} />
      </Section>
    </div>
  );
}

// ----- Rep table ------------------------------------------------------------

function RepTableView({ table }: { table: RepTable }) {
  if (table.bestE1rmKg <= 0) {
    return (
      <div className="text-[12px] text-[var(--ink-muted)] py-4">
        No weighted sets logged.
      </div>
    );
  }
  return (
    <div className="text-[12px]">
      <div className="grid grid-cols-[50px_1.2fr_1fr_1fr] gap-3 pb-1.5 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
        <div>Reps</div>
        <div>Actual</div>
        <div className="text-right">Date</div>
        <div className="text-right">Estimated</div>
      </div>
      {table.rows.map((row) => {
        const isPRRow = row.reps === table.bestE1rmReps;
        const actualLb = row.actualWeight_kg != null ? Math.round(kgToLb(row.actualWeight_kg)) : null;
        const estLb = row.estimatedWeight_kg != null ? Math.round(kgToLb(row.estimatedWeight_kg)) : null;
        return (
          <div
            key={row.reps}
            className={`grid grid-cols-[50px_1.2fr_1fr_1fr] gap-3 py-1.5 border-b border-[var(--line-soft)] last:border-0 ${
              isPRRow ? "bg-[var(--accent-soft)] -mx-1 px-1 rounded-sm" : ""
            }`}
          >
            <div className="tabular font-mono text-[var(--ink-dim)]">
              {row.reps}
            </div>
            <div className="tabular text-[var(--ink)]">
              {actualLb != null ? (
                <>
                  {actualLb} lb
                  {isPRRow && <span className="text-[var(--accent)] ml-1.5">✦</span>}
                </>
              ) : (
                <span className="text-[var(--ink-muted)]">—</span>
              )}
            </div>
            <div className="text-right tabular text-[10px] font-mono text-[var(--ink-muted)]">
              {row.actualDate ? format.shortDate(row.actualDate) : "—"}
            </div>
            <div className="text-right tabular text-[var(--ink-dim)]">
              {estLb != null ? `${estLb} lb` : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----- Sessions table -------------------------------------------------------
// Each session is broken into per-(reps × weight) groups, one row per group.
// Date repeats on first row of each session; subsequent rows in the same
// session leave date blank for visual grouping.

type SessionGroup = {
  date: string;
  iso: string;
  setCount: number;
  reps: number;
  weight_kg: number | null;
  rpe: number | null;
  bestE1rm_kg: number | null;
  isFirstInSession: boolean;
};

function groupSets(
  sessions: Awaited<ReturnType<typeof getExerciseSessions>>
): SessionGroup[] {
  const out: SessionGroup[] = [];
  for (const s of sessions) {
    // Group by (reps × weight_kg)
    const groups = new Map<
      string,
      { count: number; reps: number; weight: number | null; rpeSum: number; rpeN: number }
    >();
    for (const set of s.sets) {
      if (set.reps == null) continue;
      const key = `${set.reps}·${set.weight_kg ?? "bw"}`;
      const cur = groups.get(key) ?? {
        count: 0,
        reps: set.reps,
        weight: set.weight_kg ?? null,
        rpeSum: 0,
        rpeN: 0,
      };
      cur.count++;
      if (set.rpe != null) {
        cur.rpeSum += set.rpe;
        cur.rpeN++;
      }
      groups.set(key, cur);
    }
    let first = true;
    // Preserve insertion order (first set encountered first)
    for (const g of groups.values()) {
      out.push({
        date: format.shortDate(s.date),
        iso: s.date.slice(0, 10),
        setCount: g.count,
        reps: g.reps,
        weight_kg: g.weight,
        rpe: g.rpeN > 0 ? g.rpeSum / g.rpeN : null,
        bestE1rm_kg: s.bestE1rm_kg,
        isFirstInSession: first,
      });
      first = false;
    }
  }
  return out;
}

function SessionsTable({
  sessions,
  exerciseName,
}: {
  sessions: Awaited<ReturnType<typeof getExerciseSessions>>;
  exerciseName: string;
}) {
  const rows = groupSets(sessions);
  if (rows.length === 0) {
    return <div className="text-[12px] text-[var(--ink-muted)] py-4">No sessions.</div>;
  }
  return (
    <div className="text-[12px]">
      <div className="grid grid-cols-[80px_50px_50px_80px_50px_60px_24px] gap-3 pb-1.5 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
        <div>Date</div>
        <div className="text-right">Sets</div>
        <div className="text-right">Reps</div>
        <div className="text-right">Weight</div>
        <div className="text-right">RPE</div>
        <div className="text-right">e1RM</div>
        <div />
      </div>
      {rows.map((r, i) => {
        const weightLb = r.weight_kg != null ? Math.round(kgToLb(r.weight_kg)) : null;
        const e1rmLb = r.bestE1rm_kg != null ? Math.round(kgToLb(r.bestE1rm_kg)) : null;
        return (
          <Link
            key={`${r.iso}-${i}`}
            href={`/progress/${nameToSlug(exerciseName)}/${r.iso}`}
            className="grid grid-cols-[80px_50px_50px_80px_50px_60px_24px] gap-3 py-1 border-b border-[var(--line-soft)] last:border-0 hover:bg-[var(--bg-elev-2)] -mx-1 px-1 rounded-sm transition-colors group"
          >
            <div className="tabular text-[10px] font-mono text-[var(--ink-muted)]">
              {r.isFirstInSession ? r.date : ""}
            </div>
            <div className="text-right tabular text-[var(--ink)]">{r.setCount}</div>
            <div className="text-right tabular text-[var(--ink)]">{r.reps}</div>
            <div className="text-right tabular text-[var(--ink-dim)]">
              {weightLb != null ? `${weightLb} lb` : "bw"}
            </div>
            <div className="text-right tabular text-[var(--ink-muted)] font-mono text-[10px]">
              {r.rpe != null ? r.rpe.toFixed(1) : "—"}
            </div>
            <div className="text-right tabular text-[10px] font-mono text-[var(--ink-muted)]">
              {r.isFirstInSession && e1rmLb != null ? `${e1rmLb}` : ""}
            </div>
            <div className="text-right text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors">
              {r.isFirstInSession ? "›" : ""}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
