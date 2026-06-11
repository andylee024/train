import Link from "next/link";
import type { KeyLiftCard } from "@/lib/queries";
import { format } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * PR Scoreboard — table view of key lifts.
 * Columns: name · current e1RM · PR (weight + date) · age · trend arrow
 */
export function PRScoreboard({ cards }: { cards: KeyLiftCard[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="text-[12px]">
      {/* Header */}
      <div className="grid grid-cols-[1.4fr_0.9fr_1.1fr_0.7fr_0.6fr] gap-3 pb-1.5 border-b border-[var(--line)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
        <div>Lift</div>
        <div className="text-right">Current</div>
        <div className="text-right">PR</div>
        <div className="text-right">Age</div>
        <div className="text-right">Trend</div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-[var(--line-soft)]">
        {cards.map((card) => (
          <Row key={card.name} card={card} today={today} />
        ))}
      </div>
    </div>
  );
}

function Row({ card, today }: { card: KeyLiftCard; today: Date }) {
  const hasData = !!card.currentE1rm_kg;
  const prDate = card.pr ? new Date(card.pr.date) : null;
  const isToday = prDate && prDate.toDateString() === today.toDateString();
  const ageDays = prDate
    ? Math.max(0, Math.floor((today.getTime() - prDate.getTime()) / 86400000))
    : null;

  let ageLabel = "—";
  if (isToday) ageLabel = "today";
  else if (ageDays != null) {
    if (ageDays < 7) ageLabel = `${ageDays}d`;
    else if (ageDays < 30) ageLabel = `${Math.round(ageDays / 7)}w`;
    else ageLabel = `${Math.round(ageDays / 30)}mo`;
  }

  const trend = card.status === "building"
    ? { glyph: "↗", tone: "text-[var(--good)]" }
    : card.status === "backed-off"
      ? { glyph: "↘", tone: "text-[var(--bad)]" }
      : card.status === "stable"
        ? { glyph: "→", tone: "text-[var(--ink-dim)]" }
        : { glyph: "—", tone: "text-[var(--ink-muted)]" };

  return (
    <Link
      href={`/progress/${card.slug}`}
      className="grid grid-cols-[1.4fr_0.9fr_1.1fr_0.7fr_0.6fr] gap-3 items-baseline py-2 hover:bg-[var(--bg-elev-2)] -mx-2 px-2 rounded-sm transition-colors"
    >
      <div className="flex items-center gap-2 text-[var(--ink)]">
        <span>{card.name}</span>
        {isToday && (
          <span className="text-[var(--accent)] text-[11px] leading-none">✦</span>
        )}
      </div>
      <div className="text-right tabular text-[var(--ink-dim)]">
        {hasData ? format.weight(card.currentE1rm_kg!) : "—"}
      </div>
      <div className="text-right tabular text-[var(--ink-dim)]">
        {card.pr ? (
          <>
            {format.weight(card.pr.e1rm_kg)}
            <span className="ml-2 text-[10px] text-[var(--ink-muted)] font-mono">
              {format.shortDate(card.pr.date)}
            </span>
          </>
        ) : (
          "—"
        )}
      </div>
      <div className="text-right tabular text-[10px] font-mono text-[var(--ink-muted)]">
        {ageLabel}
      </div>
      <div className={cn("text-right text-[14px] leading-none", trend.tone)}>
        {trend.glyph}
      </div>
    </Link>
  );
}
