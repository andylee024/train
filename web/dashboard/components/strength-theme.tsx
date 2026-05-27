import Link from "next/link";
import type { KeyLiftCard, ExerciseSummary } from "@/lib/queries";
import { CompositeChart } from "@/components/composite-chart";
import type { ComponentSeries } from "@/lib/composite";
import { format } from "@/lib/format";

const KG_PER_LB = 0.45359237;

/**
 * One section per theme. Top: composite chart with baseline picker.
 * Middle: key lifts rows (date strip = last 8-10 sessions, e1RM only).
 * Bottom: inventory line (non-key exercises by session count).
 */
export function StrengthTheme({
  label,
  keyLifts,
  all,
  arcStartIso,
}: {
  label: string;
  keyLifts: KeyLiftCard[];
  all: ExerciseSummary[];
  arcStartIso: string;
}) {
  // Key lift names — used to exclude them from the inventory tail
  const keyLiftNames = new Set(keyLifts.map((k) => k.name));
  const inventory = [...all]
    .filter((s) => !keyLiftNames.has(s.name))
    .sort((a, b) => b.sessionCount - a.sessionCount);

  // Build component series for composite (only key lifts with data)
  const components: ComponentSeries[] = keyLifts
    .filter((k) => k.sparkline.length > 0)
    .map((k) => ({
      name: k.name,
      sessions: k.sparkline.map((s) => ({
        date: s.date,
        lb: +(s.e1rm_kg / KG_PER_LB).toFixed(1),
      })),
    }));

  return (
    <section className="pt-5">
      <div className="hairline pt-2 pb-2 flex items-baseline justify-between">
        <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-[var(--accent)] font-semibold">
          {label}
        </span>
        <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">
          {all.length} exercises · {keyLifts.length} tracked
        </span>
      </div>

      {/* Composite */}
      {components.length > 0 && (
        <div className="mt-3 mb-4">
          <CompositeChart components={components} arcStartIso={arcStartIso} />
        </div>
      )}

      {/* Key lifts with date strip */}
      {keyLifts.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1.5">
            Key Lifts
          </div>
          <div className="space-y-3">
            {keyLifts.map((card) => (
              <KeyLiftRow key={card.name} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* Inventory tail */}
      {inventory.length > 0 && (
        <div className="mt-4 text-[11px] text-[var(--ink-muted)] leading-relaxed">
          <span className="font-mono uppercase tracking-wider text-[9px] mr-2">other</span>
          {inventory.map((s, i) => (
            <span key={s.name}>
              <Link
                href={`/progress/${s.slug}`}
                className="hover:text-[var(--accent)] transition-colors"
              >
                <span className="text-[var(--ink-dim)]">{s.name}</span>
                <span className="ml-1 tabular text-[var(--ink-muted)]">{s.sessionCount}</span>
              </Link>
              {i < inventory.length - 1 && (
                <span className="text-[var(--ink-muted)] mx-1.5">·</span>
              )}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function KeyLiftRow({ card }: { card: KeyLiftCard }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const prDate = card.pr ? new Date(card.pr.date) : null;
  const isTodayPR = prDate && prDate.toDateString() === today.toDateString();
  const ageDays = prDate
    ? Math.max(0, Math.floor((today.getTime() - prDate.getTime()) / 86400000))
    : null;

  let ageLabel = "—";
  if (isTodayPR) ageLabel = "today";
  else if (ageDays != null) {
    if (ageDays < 7) ageLabel = `${ageDays}d ago`;
    else if (ageDays < 60) ageLabel = `${Math.round(ageDays / 7)}w ago`;
    else ageLabel = `${Math.round(ageDays / 30)}mo ago`;
  }

  // Last 10 sessions for the date strip
  const recentSessions = card.sparkline.slice(-10);
  const currentLb = card.currentE1rm_kg
    ? +(card.currentE1rm_kg / KG_PER_LB).toFixed(0)
    : null;
  const prLb = card.pr ? +(card.pr.e1rm_kg / KG_PER_LB).toFixed(0) : null;

  return (
    <Link
      href={`/progress/${card.slug}`}
      className="block hover:bg-[var(--bg-elev-2)] -mx-2 px-2 py-1 rounded-sm transition-colors"
    >
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[13px] text-[var(--ink)] font-medium">{card.name}</span>
        <span className="text-[11px] tabular text-[var(--ink-dim)]">
          {currentLb != null ? `${currentLb} lb` : "—"}
          <span className="ml-3 text-[var(--ink-muted)] font-mono">
            {prLb != null ? (
              <>
                PR {prLb} ({ageLabel})
                {isTodayPR && <span className="text-[var(--accent)] ml-1">✦</span>}
              </>
            ) : "—"}
          </span>
        </span>
      </div>
      {recentSessions.length === 0 ? (
        <div className="text-[10px] font-mono text-[var(--ink-muted)]">no sessions</div>
      ) : (
        <DateStrip sessions={recentSessions} prDateIso={card.pr?.date ?? null} />
      )}
    </Link>
  );
}

function DateStrip({
  sessions,
  prDateIso,
}: {
  sessions: { date: string; e1rm_kg: number }[];
  prDateIso: string | null;
}) {
  const prDay = prDateIso ? prDateIso.slice(0, 10) : null;
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${sessions.length}, minmax(0, 1fr))` }}>
      {sessions.map((s) => {
        const lb = Math.round(s.e1rm_kg / KG_PER_LB);
        const isPR = s.date.slice(0, 10) === prDay;
        return (
          <div key={s.date} className="text-center">
            <div className="text-[9px] font-mono text-[var(--ink-muted)] tabular leading-tight">
              {format.shortDate(s.date)}
            </div>
            <div className={
              "text-[11px] tabular font-medium leading-tight " +
              (isPR ? "text-[var(--accent)]" : "text-[var(--ink-dim)]")
            }>
              {lb}{isPR && " ✦"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
