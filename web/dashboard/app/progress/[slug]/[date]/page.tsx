import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  resolveExerciseSlug,
  getSessionDetail,
  getExerciseRepRecords,
  e1rm,
  nameToSlug,
} from "@/lib/queries";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Badge } from "@/components/ui";
import { format } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SessionDetail({
  params,
}: {
  params: Promise<{ slug: string; date: string }>;
}) {
  const { slug, date } = await params;
  const name = await resolveExerciseSlug(slug);
  if (!name) notFound();

  const [session, reps] = await Promise.all([
    getSessionDetail(name, date),
    getExerciseRepRecords(name),
  ]);
  if (!session) notFound();

  const allTimePR = reps.reduce((m, r) => Math.max(m, r.e1rm_kg), 0);

  const avgRpe = (() => {
    const r = session.sets.filter((s) => s.rpe != null);
    return r.length ? r.reduce((a, b) => a + (b.rpe ?? 0), 0) / r.length : null;
  })();

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href={`/progress/${nameToSlug(name)}`}
        className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] transition-colors"
      >
        <ChevronLeft size={12} /> {name}
      </Link>

      <PageHeader
        title={`Session · ${format.date(session.date)}`}
        subtitle={
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="text-[var(--ink-dim)]">{name}</span>
            <span className="text-[var(--ink-muted)]">·</span>
            <span className="text-[var(--ink-dim)] tabular">{session.sets.length} sets</span>
            {avgRpe != null && (
              <>
                <span className="text-[var(--ink-muted)]">·</span>
                <span className="text-[var(--ink-dim)] tabular">avg RPE {avgRpe.toFixed(1)}</span>
              </>
            )}
            {session.bodyweight_lb != null && (
              <>
                <span className="text-[var(--ink-muted)]">·</span>
                <span className="text-[var(--ink-dim)] tabular">BW {session.bodyweight_lb} lb</span>
              </>
            )}
          </div>
        }
      />

      {/* Sets table */}
      <Card>
        <CardHeader>
          <CardTitle>Sets</CardTitle>
          <div className="text-[10px] font-mono text-[var(--ink-muted)] tracking-wider">
            vs PR = e1RM gap to {allTimePR > 0 ? format.weight(allTimePR) : "—"}
          </div>
        </CardHeader>
        <CardBody className="pt-1">
          <div className="text-sm">
            <div className="grid grid-cols-[40px_1fr_0.6fr_0.6fr_0.8fr_0.8fr_1.2fr] gap-3 px-1 pb-2 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--ink-muted)]">
              <div>Set</div>
              <div>Weight</div>
              <div className="text-right">Reps</div>
              <div className="text-right">RPE</div>
              <div className="text-right">e1RM</div>
              <div className="text-right">vs PR</div>
              <div>Notes</div>
            </div>
            {session.sets.map((s) => {
              const e = e1rm(s.weight_kg, s.reps);
              const delta = allTimePR > 0 ? e - allTimePR : null;
              const weightLabel =
                s.weight_value != null
                  ? `${s.weight_value} ${s.weight_unit ?? ""}`
                  : "—";
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-[40px_1fr_0.6fr_0.6fr_0.8fr_0.8fr_1.2fr] gap-3 px-1 py-2.5 border-b border-[var(--line-soft)] last:border-0"
                >
                  <div className="font-mono text-xs text-[var(--ink-muted)] tabular">
                    {s.set_index}
                  </div>
                  <div className="tabular font-medium">{weightLabel}</div>
                  <div className="text-right tabular">{s.reps ?? "—"}</div>
                  <div className="text-right tabular text-[var(--ink-dim)]">
                    {s.rpe ?? "—"}
                  </div>
                  <div className="text-right tabular text-[var(--ink-dim)]">
                    {e > 0 ? format.weight(e) : "—"}
                  </div>
                  <div
                    className={`text-right tabular ${
                      delta == null
                        ? "text-[var(--ink-muted)]"
                        : delta >= 0
                          ? "text-[var(--good)]"
                          : "text-[var(--ink-dim)]"
                    }`}
                  >
                    {delta == null
                      ? "—"
                      : `${delta >= 0 ? "+" : "−"}${format.weight(Math.abs(delta))}`}
                  </div>
                  <div className="text-[var(--ink-muted)] text-xs">—</div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Session context */}
      <Card>
        <CardHeader>
          <CardTitle>Session context</CardTitle>
        </CardHeader>
        <CardBody className="pt-1">
          <dl className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-4 text-sm">
            <dt className="text-[var(--ink-muted)] text-xs font-mono uppercase tracking-wider pt-0.5">
              Other in session
            </dt>
            <dd className="text-[var(--ink-dim)]">
              {session.otherExercises.length === 0 ? (
                <span className="text-[var(--ink-muted)]">—</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {session.otherExercises.map((n) => (
                    <Badge key={n} tone="muted">
                      {n}
                    </Badge>
                  ))}
                </div>
              )}
            </dd>

            <dt className="text-[var(--ink-muted)] text-xs font-mono uppercase tracking-wider pt-0.5">
              Body weight
            </dt>
            <dd className="text-[var(--ink-dim)] tabular">
              {session.bodyweight_lb != null ? `${session.bodyweight_lb} lb` : "—"}
            </dd>

            <dt className="text-[var(--ink-muted)] text-xs font-mono uppercase tracking-wider pt-0.5">
              Time of day
            </dt>
            <dd className="text-[var(--ink-dim)] tabular">
              {format.time(session.date)}
            </dd>

            <dt className="text-[var(--ink-muted)] text-xs font-mono uppercase tracking-wider pt-0.5">
              Workout ID
            </dt>
            <dd className="text-[var(--ink-muted)] font-mono text-xs">
              {session.workout_id.slice(0, 8)}
            </dd>
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
