"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, Plus, Play, Dumbbell } from "lucide-react";
import { CATEGORIES, getCoach, initials } from "@/lib/coaches";
import { getProfile } from "@/lib/coach-profiles";
import { useSelection } from "@/lib/use-selection";
import { SelectionBar } from "@/components/plan/selection-bar";
import { TeamSidebar } from "@/components/plan/team-sidebar";
import { PairsCarousel } from "@/components/plan/pairs-carousel";
import { cn } from "@/lib/cn";

/**
 * Coach profile page — implements docs/design/coach-profile.md.
 * Section order: Hero · Overview · Equipment · Sample Week · Highlights · Methodology (collapsed) · Pairs.
 */
export default function CoachProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const coach = getCoach(id);
  const profile = getProfile(id);
  const { selected, toggle, remove, clear, addMany, atCap } = useSelection();

  if (!coach) notFound();

  const isSelected = selected.includes(coach.id);
  const disabled = atCap && !isSelected;
  const accent = CATEGORIES[coach.category].accent;
  const catLabel = CATEGORIES[coach.category].label;

  return (
    <div className="max-w-7xl pb-24">
      <Link
        href="/plan/new"
        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] mb-4 transition-colors"
      >
        <ChevronLeft size={11} /> Back to Marketplace
      </Link>

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6 lg:items-start">
        <div className="min-w-0">
          {/* ── 1. HERO ──────────────────────────────────────────────── */}
          <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {coach.headshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coach.headshot}
                  alt={coach.name}
                  className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                />
              ) : (
                <div
                  className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full grid place-items-center text-[16px] sm:text-[20px] font-semibold text-white tabular"
                  style={{ background: accent }}
                >
                  {initials(coach.name)}
                </div>
              )}

              <div className="min-w-0 flex-1 w-full">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h1 className="text-[20px] sm:text-[24px] font-semibold tracking-tight leading-none">
                    {coach.name}
                  </h1>
                  <span className="text-[11px] font-mono text-[var(--ink-muted)] tabular">
                    {coach.handle}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--ink-muted)] tabular">
                    · {coach.stats.followers} followers
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: accent }}
                  />
                  {catLabel}
                </div>
                <p className="mt-3 text-[12px] text-[var(--ink-dim)] leading-snug">
                  {coach.credentials}
                </p>
                <p
                  className="mt-4 text-[17px] sm:text-[19px] font-medium text-[var(--ink)] leading-tight"
                  style={{ fontStyle: "italic" }}
                >
                  &ldquo;{coach.tagline}&rdquo;
                </p>
              </div>

              <button
                onClick={() => !disabled && toggle(coach.id)}
                disabled={disabled}
                title={disabled ? "Max 3 coaches — remove one to add another" : undefined}
                className={cn(
                  "shrink-0 self-stretch sm:self-auto text-[11px] font-mono uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors flex items-center justify-center gap-1.5",
                  isSelected
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]"
                    : disabled
                      ? "bg-[var(--bg-elev-2)] text-[var(--ink-muted)] border border-[var(--line)] opacity-50 cursor-not-allowed"
                      : "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
                )}
              >
                {isSelected ? <Check size={12} /> : <Plus size={12} />}
                {isSelected ? "Added" : disabled ? "Max reached" : "Add to plan"}
              </button>
            </div>
          </div>

          {/* ── 2. OVERVIEW ──────────────────────────────────────────── */}
          <Section label="Overview">
            <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed">
              {coach.overview}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular">
              <Chip>{coach.tags.daysPerWeek} d/wk</Chip>
              <Chip>{coach.tags.sessionLength}</Chip>
              <Chip>{coach.tags.levels.join(" / ")}</Chip>
            </div>
          </Section>

          {/* ── 3. EQUIPMENT ─────────────────────────────────────────── */}
          <Section label="Equipment">
            <ul className="space-y-2 text-[13px] text-[var(--ink-dim)]">
              {coach.tags.equipment.map((e, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Dumbbell
                    size={12}
                    className="shrink-0"
                    style={{ color: accent }}
                  />
                  <span className="leading-snug">{e}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* ── 4. SAMPLE WEEK ───────────────────────────────────────── */}
          {profile?.weekStructure && (
            <Section label="Sample Week">
              <div className="space-y-3">
                {profile.weekStructure.map((day, i) => (
                  <DayCard key={i} dayIdx={i} day={day} accent={accent} />
                ))}
              </div>
            </Section>
          )}

          {/* ── 5. HIGHLIGHTS ────────────────────────────────────────── */}
          {profile?.videos && profile.videos.length > 0 && (
            <Section label="Highlights">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.videos.map((v) => (
                  <a
                    key={v.id}
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md overflow-hidden hover:border-[var(--accent-line)] transition-colors block"
                  >
                    <div className="relative aspect-video bg-[var(--bg-elev-2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors grid place-items-center">
                        <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={14} className="fill-white text-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/70 backdrop-blur text-white text-[9px] font-mono tabular rounded-sm">
                        {v.duration}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[11.5px] text-[var(--ink)] leading-snug line-clamp-2">
                        {v.title}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--ink-muted)] tabular mt-1">
                        {v.views} views
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* ── 6. METHODOLOGY (collapsed) ───────────────────────────── */}
          <details className="mt-6 group">
            <summary className="cursor-pointer flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] py-2 list-none">
              <span className="inline-block w-2 transition-transform group-open:rotate-90">
                ▸
              </span>
              Methodology · Philosophy · Principles · Best for / Not for
            </summary>

            <div className="mt-3 pl-4 border-l border-[var(--line)] space-y-6">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
                  Philosophy
                </div>
                <p className="text-[12.5px] text-[var(--ink-dim)] leading-relaxed">
                  {coach.philosophy}
                </p>
              </div>

              {profile?.principles && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
                    Principles
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.principles.map((p, i) => (
                      <div
                        key={i}
                        className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3"
                      >
                        <div className="text-[11.5px] font-medium text-[var(--ink)] mb-1">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-[var(--ink-dim)] leading-relaxed">
                          {p.body}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2">
                  Fit
                </div>
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
              </div>
            </div>
          </details>

          {/* Pairs carousel — unchanged from prior design */}
          <Section label="Pairs well with">
            <PairsCarousel
              pairIds={coach.pairsWith}
              selected={selected}
              onToggle={toggle}
              onAddAll={() => addMany(coach.pairsWith)}
            />
          </Section>
        </div>

        {/* Right rail — team sidebar */}
        <div className="hidden lg:block sticky top-4">
          <TeamSidebar selected={selected} onRemove={remove} onClear={clear} />
        </div>
      </div>

      {/* Mobile sticky selection bar */}
      <SelectionBar
        selected={selected}
        onClear={clear}
        onRemove={remove}
        onBuild={() => { /* navigate to next step; placeholder */ }}
      />
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-3">
        {label}
      </div>
      {children}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-sm normal-case tracking-normal text-[11px] text-[var(--ink-dim)]">
      {children}
    </span>
  );
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function DayCard({
  dayIdx,
  day,
  accent,
}: {
  dayIdx: number;
  day: import("@/lib/coach-profiles").DaySession;
  accent: string;
}) {
  if (day.isRest) {
    return (
      <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3 flex items-center gap-3 opacity-70">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular w-10">
          {DAY_NAMES[dayIdx]}
        </div>
        <div className="text-[12px] text-[var(--ink-muted)] italic">Rest</div>
      </div>
    );
  }
  return (
    <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-3.5">
      <div className="flex items-baseline gap-3 mb-2.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] tabular w-10 shrink-0 mt-0.5">
          {DAY_NAMES[dayIdx]}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[13.5px] font-medium text-[var(--ink)] leading-snug"
            style={{ color: accent }}
          >
            {day.name}
          </div>
          {day.duration && (
            <div className="text-[10px] font-mono text-[var(--ink-muted)] tabular mt-0.5">
              {day.duration}
            </div>
          )}
        </div>
      </div>

      {day.exercises && day.exercises.length > 0 && (
        <ol className="space-y-1.5 pl-10">
          {day.exercises.map((ex, i) => (
            <li
              key={i}
              className="flex items-baseline gap-2 text-[11.5px] text-[var(--ink-dim)] leading-snug"
            >
              <span className="font-mono text-[10px] text-[var(--ink-muted)] tabular w-4 shrink-0">
                {i + 1}.
              </span>
              <span className="flex-1">
                <span className="text-[var(--ink)]">{ex.name}</span>
                {" — "}
                <span className="font-mono text-[10.5px] tabular">
                  {ex.sets}×{ex.reps}
                </span>
                {ex.load && (
                  <>
                    {" · "}
                    <span className="font-mono text-[10.5px] tabular text-[var(--ink-muted)]">
                      {ex.load}
                    </span>
                  </>
                )}
                {ex.note && (
                  <span className="ml-1 text-[10.5px] italic text-[var(--ink-muted)]">
                    ({ex.note})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
