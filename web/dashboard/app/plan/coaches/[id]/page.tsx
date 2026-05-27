"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, Plus, Play, Star } from "lucide-react";
import { CATEGORIES, getCoach, initials } from "@/lib/coaches";
import { getProfile } from "@/lib/coach-profiles";
import { useSelection } from "@/lib/use-selection";
import { SelectionBar } from "@/components/plan/selection-bar";
import { cn } from "@/lib/cn";

export default function CoachProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const coach = getCoach(id);
  const profile = getProfile(id);
  const { selected, toggle, remove, clear } = useSelection();

  if (!coach) notFound();

  const isSelected = selected.includes(coach.id);
  const accent = CATEGORIES[coach.category].accent;
  const catLabel = CATEGORIES[coach.category].label;

  return (
    <div className="max-w-5xl pb-24">
      <Link
        href="/plan/new"
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] mb-4 transition-colors"
      >
        <ChevronLeft size={11} /> Back to Marketplace
      </Link>

      {/* Hero */}
      <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-6">
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 w-16 h-16 rounded-full grid place-items-center text-[18px] font-semibold text-white tabular"
            style={{ background: accent }}
          >
            {initials(coach.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="text-[22px] font-semibold tracking-tight leading-none">
                {coach.name}
              </h1>
              <span className="text-[11px] font-mono text-[var(--ink-muted)] tabular">
                {coach.handle}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: accent }}
              />
              {catLabel}
            </div>
            <p className="mt-3 text-[13px] text-[var(--ink-dim)] leading-relaxed">
              {coach.tagline}
            </p>
            <div className="mt-3 flex items-center gap-4 text-[10px] font-mono text-[var(--ink-muted)] tabular">
              <span className="flex items-center gap-1">
                <Star size={10} className="fill-[var(--ink-muted)]" />
                {coach.stats.rating}
              </span>
              <span>{coach.stats.followers} followers</span>
              <span>{coach.stats.programs} programs</span>
            </div>
          </div>
          <button
            onClick={() => toggle(coach.id)}
            className={cn(
              "shrink-0 text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm transition-colors flex items-center gap-1.5",
              isSelected
                ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]"
                : "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
            )}
          >
            {isSelected ? <Check size={12} /> : <Plus size={12} />}
            {isSelected ? "Added" : "Add to plan"}
          </button>
        </div>
      </div>

      {/* Philosophy */}
      <Section label="Philosophy">
        <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed">
          {coach.philosophy}
        </p>
      </Section>

      {/* Tags grid */}
      <Section label="At a glance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Goals" value={coach.tags.goals.join(", ")} />
          <Stat label="Levels" value={coach.tags.levels.join(", ")} />
          <Stat label="Equipment" value={coach.tags.equipment.join(", ")} />
          <Stat label="Cadence" value={`${coach.tags.daysPerWeek} d/wk · ${coach.tags.sessionLength}`} />
        </div>
      </Section>

      {/* Principles */}
      {profile?.principles && (
        <Section label="Principles">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.principles.map((p, i) => (
              <div
                key={i}
                className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3"
              >
                <div className="text-[12px] font-medium text-[var(--ink)] mb-1">
                  {p.title}
                </div>
                <div className="text-[11px] text-[var(--ink-dim)] leading-relaxed">
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Week structure */}
      {profile?.weekStructure && (
        <Section label="Sample week">
          <div className="grid grid-cols-7 gap-2 text-[11px]">
            {profile.weekStructure.map((day, i) => {
              const dayLabel = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
              const isRest = /rest/i.test(day);
              return (
                <div
                  key={i}
                  className={cn(
                    "p-2 rounded-sm border text-center",
                    isRest
                      ? "bg-[var(--bg-elev-2)] border-[var(--line-soft)] text-[var(--ink-muted)]"
                      : "bg-[var(--bg-elev-1)] border-[var(--line)] text-[var(--ink)]"
                  )}
                >
                  <div className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                    {dayLabel}
                  </div>
                  <div className="text-[10px]">{day}</div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Videos */}
      {profile?.videos && (
        <Section label="Sample content">
          <div className="space-y-2">
            {profile.videos.map((v, i) => (
              <div
                key={i}
                className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3 flex items-center gap-3 hover:border-[var(--accent-line)] transition-colors"
              >
                <div className="shrink-0 w-10 h-10 rounded-sm bg-[var(--bg-elev-2)] grid place-items-center text-[var(--ink-muted)]">
                  <Play size={14} className="fill-[var(--ink-muted)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] text-[var(--ink)] truncate">{v.title}</div>
                  <div className="text-[10px] font-mono text-[var(--ink-muted)] tabular mt-0.5">
                    {v.duration} · {v.views} views
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Best for / Not for */}
      <Section label="Fit">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--good)] mb-2">
              Best for
            </div>
            <ul className="space-y-1.5 text-[12px] text-[var(--ink-dim)]">
              {coach.bestFor.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--good)] shrink-0">+</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--bad)] mb-2">
              Not for
            </div>
            <ul className="space-y-1.5 text-[12px] text-[var(--ink-dim)]">
              {coach.notFor.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--bad)] shrink-0">−</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Pairs with */}
      {coach.pairsWith.length > 0 && (
        <Section label="Pairs well with">
          <div className="flex flex-wrap gap-2">
            {coach.pairsWith.map((pid) => {
              const c = getCoach(pid);
              if (!c) return null;
              const a = CATEGORIES[c.category].accent;
              return (
                <Link
                  key={pid}
                  href={`/plan/coaches/${pid}`}
                  className="inline-flex items-center gap-2 px-2 py-1.5 rounded-sm bg-[var(--bg-elev-1)] border border-[var(--line)] text-[11px] hover:border-[var(--accent-line)] transition-colors"
                >
                  <span
                    className="w-5 h-5 rounded-full grid place-items-center text-[9px] font-semibold text-white tabular"
                    style={{ background: a }}
                  >
                    {initials(c.name)}
                  </span>
                  <span className="text-[var(--ink)]">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* Selection bar (persisted via localStorage) */}
      <SelectionBar
        selected={selected}
        onRemove={remove}
        onClear={clear}
        onBuild={() => {
          // Navigate to /plan/new with a flag to trigger synthesis
          window.location.href = "/plan/new?build=true";
        }}
      />
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="hairline pt-2 pb-2 mb-3">
        <span className="section-label">{label}</span>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1">
        {label}
      </div>
      <div className="text-[12px] text-[var(--ink)] leading-snug">{value}</div>
    </div>
  );
}
