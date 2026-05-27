"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Check, Plus } from "lucide-react";
import { CATEGORIES, getCoach, initials, type Coach } from "@/lib/coaches";
import { getExtras } from "@/lib/coach-extras";
import { useSelection } from "@/lib/use-selection";
import { cn } from "@/lib/cn";

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="max-w-5xl pb-24" />}>
      <ComparePageInner />
    </Suspense>
  );
}

function ComparePageInner() {
  const params = useSearchParams();
  const idsParam = params.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const coaches = ids
    .map((id) => getCoach(id))
    .filter((c): c is Coach => !!c);

  const { selected, toggle } = useSelection();

  if (coaches.length === 0) {
    return (
      <div className="max-w-5xl pb-24">
        <BackLink />
        <div className="py-16 text-center">
          <h1 className="text-[20px] font-semibold tracking-tight mb-2">
            Nothing to compare yet.
          </h1>
          <p className="text-[12px] text-[var(--ink-dim)] mb-6">
            Pick 2–3 coaches from the marketplace, then come back here to see them side-by-side.
          </p>
          <Link
            href="/plan/new"
            className="inline-flex text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
          >
            Browse coaches →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl pb-24">
      <BackLink />

      <h1 className="text-[24px] font-semibold tracking-tight leading-none mb-2">
        Compare your picks
      </h1>
      <p className="text-[12px] text-[var(--ink-dim)] mb-6">
        Side-by-side on what matters: focus, cadence, and how the blend reads.
      </p>

      {/* Coach header cards */}
      <div
        className={cn(
          "grid gap-3 mb-4",
          coaches.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"
        )}
      >
        {coaches.map((coach) => {
          const accent = CATEGORIES[coach.category].accent;
          const isSelected = selected.includes(coach.id);
          return (
            <div
              key={coach.id}
              className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-[11px] font-semibold text-white tabular"
                  style={{ background: accent }}
                >
                  {initials(coach.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/plan/coaches/${coach.id}`}
                    className="text-[13px] font-medium text-[var(--ink)] hover:text-[var(--accent)] truncate block"
                  >
                    {coach.name}
                  </Link>
                  <div className="text-[10px] font-mono text-[var(--ink-muted)] tabular truncate">
                    {coach.handle}
                  </div>
                </div>
                <button
                  onClick={() => toggle(coach.id)}
                  className={cn(
                    "shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-colors",
                    isSelected
                      ? "bg-[var(--accent)] text-[var(--accent-ink)] border-[var(--accent)]"
                      : "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] border-[var(--line)] hover:border-[var(--accent-line)] hover:text-[var(--accent)]"
                  )}
                  aria-label={isSelected ? "Remove" : "Add to plan"}
                >
                  {isSelected ? <Check size={12} /> : <Plus size={12} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison table — stacked on mobile, columns on >=sm */}
      <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md overflow-hidden">
        <CompareRow label="Category" coaches={coaches}>
          {(c) => {
            const cat = CATEGORIES[c.category];
            return (
              <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink)]">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: cat.accent }}
                />
                {cat.label}
              </div>
            );
          }}
        </CompareRow>

        <CompareRow label="Days / wk · session" coaches={coaches}>
          {(c) => (
            <div className="text-[12px] text-[var(--ink)] tabular">
              {c.tags.daysPerWeek} d/wk · {c.tags.sessionLength}
            </div>
          )}
        </CompareRow>

        <CompareRow label="Best for" coaches={coaches}>
          {(c) => (
            <ul className="space-y-1 text-[11px] text-[var(--ink-dim)] leading-snug">
              {c.bestFor.map((b, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-[var(--good)] shrink-0">+</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </CompareRow>

        <CompareRow label="What you'll gain" coaches={coaches}>
          {(c) => {
            const extras = getExtras(c.id);
            if (!extras?.whatYoullGain) {
              return (
                <span className="text-[11px] text-[var(--ink-muted)] italic">
                  Not yet documented.
                </span>
              );
            }
            return (
              <ul className="space-y-1 text-[11px] text-[var(--ink-dim)] leading-snug">
                {extras.whatYoullGain.slice(0, 3).map((g, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-[var(--accent)] shrink-0">·</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            );
          }}
        </CompareRow>

        <CompareRow label="Pairs well with" coaches={coaches}>
          {(c) => {
            const others = c.pairsWith
              .map((id) => getCoach(id))
              .filter((p): p is Coach => !!p)
              .slice(0, 3);
            if (others.length === 0) {
              return <span className="text-[11px] text-[var(--ink-muted)]">—</span>;
            }
            return (
              <div className="flex flex-wrap gap-1.5">
                {others.map((p) => (
                  <Link
                    key={p.id}
                    href={`/plan/coaches/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm bg-[var(--bg-elev-2)] border border-[var(--line)] text-[10px] hover:border-[var(--accent-line)] transition-colors"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full grid place-items-center text-[7px] font-semibold text-white tabular"
                      style={{ background: CATEGORIES[p.category].accent }}
                    >
                      {initials(p.name)}
                    </span>
                    <span className="text-[var(--ink)]">{p.name}</span>
                  </Link>
                ))}
              </div>
            );
          }}
        </CompareRow>

        <CompareRow label="Will this blend?" coaches={coaches} last>
          {(c) => {
            const verdict = blendVerdict(c, coaches);
            return (
              <div
                className={cn(
                  "text-[11px] leading-snug",
                  verdict.tone === "good" && "text-[var(--good)]",
                  verdict.tone === "warn" && "text-[var(--warn)]",
                  verdict.tone === "neutral" && "text-[var(--ink-dim)]"
                )}
              >
                {verdict.text}
              </div>
            );
          }}
        </CompareRow>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/plan/new"
          className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={11} /> back to marketplace
        </Link>
        <Link
          href="/plan/new?build=true"
          className="text-[11px] font-mono uppercase tracking-wider px-4 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
        >
          Build plan with these →
        </Link>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/plan/new"
      className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] mb-4 transition-colors"
    >
      <ChevronLeft size={11} /> Back to Marketplace
    </Link>
  );
}

function CompareRow({
  label,
  coaches,
  last,
  children,
}: {
  label: string;
  coaches: Coach[];
  last?: boolean;
  children: (c: Coach) => React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-y-2 sm:gap-y-0",
        !last && "border-b border-[var(--line)]"
      )}
    >
      <div className="px-3 py-3 sm:py-3 sm:border-r border-[var(--line-soft)] bg-[var(--bg-elev-2)] sm:bg-transparent">
        <span className="section-label">{label}</span>
      </div>
      <div
        className={cn(
          "grid gap-3 px-3 py-3",
          coaches.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"
        )}
      >
        {coaches.map((c) => (
          <div key={c.id} className="min-w-0">
            {children(c)}
          </div>
        ))}
      </div>
    </div>
  );
}

function blendVerdict(
  coach: Coach,
  all: Coach[]
): { tone: "good" | "warn" | "neutral"; text: string } {
  const others = all.filter((o) => o.id !== coach.id);
  const pairsWithAny = others.some((o) => coach.pairsWith.includes(o.id));
  const sameCategory = others.some((o) => o.category === coach.category);

  if (pairsWithAny) {
    return {
      tone: "good",
      text: "Coach-recommended pairing — philosophies complement each other.",
    };
  }
  if (sameCategory && others.length > 0) {
    return {
      tone: "warn",
      text: "Same category as another pick — may produce overlapping work.",
    };
  }
  if (others.length === 0) {
    return { tone: "neutral", text: "Add another coach to see the blend." };
  }
  return {
    tone: "neutral",
    text: "Different categories — the AI will distribute across the week.",
  };
}
