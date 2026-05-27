"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, CheckCircle2, Pencil, X, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { CoachCard } from "@/components/plan/coach-card";
import { FilterBar, type Filters } from "@/components/plan/filter-bar";
import { SelectionBar } from "@/components/plan/selection-bar";
import { GoalIntake } from "@/components/plan/goal-intake";
import { RecommendedBand } from "@/components/plan/recommended-band";
import { ReviewBlend } from "@/components/plan/review-blend";
import { PlanPreview } from "@/components/plan/plan-preview";
import { COACHES, allGoals, LEVELS, getCoach } from "@/lib/coaches";
import { useSelection } from "@/lib/use-selection";
import { useIntake, type GoalKey } from "@/lib/use-intake";
import { scoreCoach, topMatches, GOAL_LABEL, matchingGoals } from "@/lib/matching";

type Phase = "intake" | "marketplace" | "review" | "synthesizing" | "preview" | "activated";

export default function NewArcPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selected, toggle, remove, clear } = useSelection();
  const { intake, hydrated, isComplete, setDays, removeGoal, clearIntake } = useIntake();
  const [reviewNotes, setReviewNotes] = useState("");
  const [justCompletedIntake, setJustCompletedIntake] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    goal: "all",
    level: "all",
  });
  const [phase, setPhase] = useState<Phase>("intake");

  // On first hydration, jump straight to marketplace if intake was previously
  // completed (returning user). Otherwise stay on intake until they click
  // "Find my team" explicitly. Use a one-shot ref so we don't re-trigger when
  // they edit chips later.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (hydrated && !initializedRef.current) {
      initializedRef.current = true;
      setPhase(isComplete ? "marketplace" : "intake");
    }
  }, [hydrated, isComplete]);

  // Honor ?build=true (set when "Build plan" is clicked from a profile page)
  useEffect(() => {
    if (searchParams.get("build") === "true" && selected.length > 0) {
      setPhase("review");
      router.replace("/plan/new", { scroll: false });
    }
  }, [searchParams, selected, router]);

  // Recommended coaches (top 3 by score for the user's goals)
  const recommendedIds = useMemo(
    () => topMatches(COACHES, intake.goals, 3).map((c) => c.id),
    [intake.goals]
  );

  // Filter + rank for the main grid
  const filtered = useMemo(() => {
    const matches = COACHES.filter((c) => {
      if (filters.category !== "all" && c.category !== filters.category) return false;
      if (filters.goal !== "all" && !c.tags.goals.includes(filters.goal)) return false;
      if (filters.level !== "all" && !c.tags.levels.includes(filters.level)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!`${c.name} ${c.handle} ${c.tagline}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    // When user has goals, sort by score so matching coaches surface higher.
    if (intake.goals.length > 0) {
      return [...matches].sort(
        (a, b) => scoreCoach(b, intake.goals) - scoreCoach(a, intake.goals)
      );
    }
    return [...matches].sort((a, b) => a.name.localeCompare(b.name));
  }, [filters, intake.goals]);

  // Marketplace "Build plan" goes to review first
  function handleGoToReview() {
    setPhase("review");
  }

  // Review "Build plan" triggers synthesis
  function handleSynthesize() {
    setPhase("synthesizing");
    setTimeout(() => setPhase("preview"), 3000);
  }

  function handleActivate() {
    setPhase("activated");
  }

  function handleStartOver() {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Clear your intake and team picks?");
      if (!ok) return;
    }
    clearIntake();
    clear();
    setJustCompletedIntake(false);
    setPhase("intake");
  }

  // While hydrating, render nothing to avoid flash
  if (!hydrated) {
    return <div className="max-w-7xl pb-24" />;
  }

  return (
    <div className="max-w-7xl pb-24">
      <div className="flex items-center justify-between mb-2">
        <Link
          href="/plan"
          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] transition-colors"
        >
          <ChevronLeft size={11} /> Back to Plan
        </Link>
        {phase !== "activated" && (
          <button
            type="button"
            onClick={handleStartOver}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] hover:text-[var(--ink-dim)] transition-colors"
          >
            <RotateCcw size={11} /> Start over
          </button>
        )}
      </div>

      {phase === "intake" && (
        <GoalIntake
          onComplete={() => {
            setJustCompletedIntake(true);
            setPhase("marketplace");
          }}
          onSkip={() => {
            clearIntake();
            setJustCompletedIntake(false);
            setPhase("marketplace");
          }}
        />
      )}

      {phase === "marketplace" && (
        <MarketplacePhase
          filters={filters}
          setFilters={(p) => setFilters((prev) => ({ ...prev, ...p }))}
          filtered={filtered}
          recommendedIds={recommendedIds}
          intakeGoals={intake.goals}
          daysPerWeek={intake.daysPerWeek}
          onEditIntake={() => setPhase("intake")}
          onRemoveGoal={removeGoal}
          selected={selected}
          toggle={toggle}
          remove={remove}
          clear={clear}
          onBuild={handleGoToReview}
          animateRecommended={justCompletedIntake}
          onAnimationConsumed={() => setJustCompletedIntake(false)}
        />
      )}

      {phase === "review" && (
        <ReviewBlend
          selected={selected}
          goals={intake.goals}
          daysPerWeek={intake.daysPerWeek ?? 5}
          onChangeDays={setDays}
          notes={reviewNotes}
          onChangeNotes={setReviewNotes}
          onBack={() => setPhase("marketplace")}
          onBuild={handleSynthesize}
        />
      )}

      {phase === "synthesizing" && <SynthesizingPhase selected={selected} />}

      {phase === "preview" && (
        <PlanPreview
          selectedCoachIds={selected}
          onActivate={handleActivate}
          onBack={() => setPhase("review")}
        />
      )}

      {phase === "activated" && <ActivatedPhase onClearSelection={clear} />}
    </div>
  );
}

// ─── Phase: marketplace ────────────────────────────────────────────────────

function MarketplacePhase({
  filters,
  setFilters,
  filtered,
  recommendedIds,
  intakeGoals,
  daysPerWeek,
  onEditIntake,
  onRemoveGoal,
  selected,
  toggle,
  remove,
  clear,
  onBuild,
  animateRecommended,
  onAnimationConsumed,
}: {
  filters: Filters;
  setFilters: (p: Partial<Filters>) => void;
  filtered: typeof COACHES;
  recommendedIds: string[];
  intakeGoals: GoalKey[];
  daysPerWeek: number | null;
  onEditIntake: () => void;
  onRemoveGoal: (g: GoalKey) => void;
  selected: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  onBuild: () => void;
  animateRecommended: boolean;
  onAnimationConsumed: () => void;
}) {
  const router = useRouter();
  const recommendedCoaches = recommendedIds
    .map((id) => COACHES.find((c) => c.id === id))
    .filter((c): c is (typeof COACHES)[number] => !!c);

  const hasGoals = intakeGoals.length > 0;

  useEffect(() => {
    if (animateRecommended) {
      const t = window.setTimeout(onAnimationConsumed, 2000);
      return () => window.clearTimeout(t);
    }
  }, [animateRecommended, onAnimationConsumed]);

  return (
    <>
      {/* Hero with matched-for header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight leading-none">
          Find your training team
        </h1>
        <div className="mt-2 flex items-baseline flex-wrap gap-x-3 gap-y-1">
          <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed">
            Pick the coaches you trust — we'll synthesize their programming.
          </p>
          {hasGoals ? (
            <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-mono text-[var(--ink-muted)] tabular">
              <span className="uppercase tracking-wider text-[10px]">matched for:</span>
              {intakeGoals.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--accent)]"
                >
                  <span className="normal-case tracking-normal">{GOAL_LABEL[g] || g}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveGoal(g)}
                    className="w-4 h-4 grid place-items-center rounded-full hover:bg-[var(--accent-line)] transition-colors"
                    aria-label={`Remove ${GOAL_LABEL[g] || g}`}
                    title="Remove goal"
                  >
                    <X size={9} />
                  </button>
                </span>
              ))}
              {daysPerWeek && (
                <span className="text-[var(--ink-dim)] normal-case tracking-normal">
                  · {daysPerWeek} d/wk
                </span>
              )}
              <button
                onClick={onEditIntake}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 ml-1 text-[var(--ink-muted)] hover:text-[var(--accent)] border border-[var(--line)] rounded-sm hover:border-[var(--accent-line)] transition-colors"
                title="Edit goals"
              >
                <Pencil size={9} /> edit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--ink-muted)] tabular">
              <span className="uppercase tracking-wider text-[10px]">browse all coaches</span>
              <button
                onClick={onEditIntake}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[var(--ink-muted)] hover:text-[var(--accent)] border border-[var(--line)] rounded-sm hover:border-[var(--accent-line)] transition-colors normal-case tracking-normal"
                title="Set goals to personalize"
              >
                Set goals to personalize
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recommended for you band — only when intake has goals */}
      {hasGoals && recommendedCoaches.length > 0 && (
        <RecommendedBand
          coaches={recommendedCoaches}
          selected={selected}
          toggle={toggle}
          onOpen={(id) => router.push(`/plan/coaches/${id}`)}
          goals={intakeGoals}
          animate={animateRecommended}
        />
      )}

      {/* Filter bar */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          goals={allGoals()}
          levels={[...LEVELS]}
          resultCount={filtered.length}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-[12px] text-[var(--ink-muted)]">
          No coaches match those filters.{" "}
          <button
            onClick={() =>
              setFilters({ search: "", category: "all", goal: "all", level: "all" })
            }
            className="text-[var(--accent)] hover:opacity-80 underline"
          >
            Reset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              selected={selected.includes(coach.id)}
              matchingGoals={hasGoals ? matchingGoals(coach, intakeGoals) : []}
              onToggle={() => toggle(coach.id)}
              onOpen={() => router.push(`/plan/coaches/${coach.id}`)}
            />
          ))}
        </div>
      )}

      {/* Bottom selection bar */}
      <SelectionBar
        selected={selected}
        onRemove={remove}
        onClear={clear}
        onBuild={onBuild}
      />
    </>
  );
}

// ─── Phase: synthesizing ───────────────────────────────────────────────────

function SynthesizingPhase({ selected }: { selected: string[] }) {
  const names = selected
    .map((id) => getCoach(id)?.name)
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-8">
        <div className="text-[14px] text-[var(--ink)] mb-1">Composing your plan…</div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1">
          ~ 45 seconds
        </div>
        <div className="text-[11px] text-[var(--ink-muted)] mb-6 truncate">
          synthesizing from: {names}
        </div>
        <div className="space-y-2 text-[12px]">
          <ProgressStep label="Loading coach principles" status="done" />
          <ProgressStep label="Reading your context" status="done" />
          <ProgressStep label="Designing arc structure" status="active" />
          <ProgressStep label="Block 1 · Foundation" status="pending" />
          <ProgressStep label="Block 2 · Power Development" status="pending" />
          <ProgressStep label="Block 3 · Plyometric Ladder" status="pending" />
          <ProgressStep label="Block 4 · Peak" status="pending" />
        </div>
      </div>
    </div>
  );
}

function ProgressStep({
  label,
  status,
}: {
  label: string;
  status: "done" | "active" | "pending";
}) {
  const glyph = status === "done" ? "✓" : status === "active" ? "⟳" : "·";
  const tone =
    status === "done"
      ? "text-[var(--good)]"
      : status === "active"
        ? "text-[var(--accent)]"
        : "text-[var(--ink-muted)]";
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 text-center font-mono ${tone}`}>{glyph}</span>
      <span className={status === "pending" ? "text-[var(--ink-muted)]" : "text-[var(--ink)]"}>
        {label}
      </span>
    </div>
  );
}


// ─── Phase: activated ──────────────────────────────────────────────────────

function ActivatedPhase({ onClearSelection }: { onClearSelection: () => void }) {
  // Clear the selection cart since the plan is now "live"
  useEffect(() => {
    onClearSelection();
  }, [onClearSelection]);

  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-[var(--bg-elev-1)] border border-[var(--accent-line)] rounded-md p-8">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-[var(--accent)]" />
          <span className="text-[16px] text-[var(--ink)]">Your plan is live.</span>
        </div>
        <div className="text-[12px] text-[var(--ink-dim)] mb-2 tabular">
          2026 Fall Vertical Cycle · 16 weeks · 5 days/week
        </div>
        <div className="text-[12px] text-[var(--ink-dim)] mb-6">
          Tomorrow at 6:30 AM you'll get your first session via SMS. Text back
          what you did and the dashboard updates in real time.
        </div>

        <div className="space-y-2">
          <Link
            href="/plan"
            className="block text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 text-center"
          >
            See your plan →
          </Link>
          <button className="block w-full text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm border border-[var(--line)] text-[var(--ink-dim)] hover:text-[var(--ink)]">
            Download .xlsx
          </button>
          <button className="block w-full text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]">
            Skip the first session
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--line-soft)] text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">
          mocked flow · nothing was actually generated
        </div>
      </div>
    </div>
  );
}
