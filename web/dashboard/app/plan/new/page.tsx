"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
import { TeamSidebar } from "@/components/plan/team-sidebar";
import { COACHES, allGoals, LEVELS, getCoach } from "@/lib/coaches";
import { useSelection } from "@/lib/use-selection";
import { useIntake, useReviewNotes, type GoalKey } from "@/lib/use-intake";
import { scoreCoach, topMatches, GOAL_LABEL, matchingGoals } from "@/lib/matching";
import { buildSamplePlan, type SamplePlan } from "@/lib/sample-plan";

type Phase = "intake" | "marketplace" | "review" | "synthesizing" | "preview" | "activated";

export default function NewArcPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl pb-24" />}>
      <NewArcPageInner />
    </Suspense>
  );
}

function NewArcPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selected, toggle, remove, clear, atCap } = useSelection();
  const { intake, hydrated, isComplete, setDays, removeGoal, clearIntake } = useIntake();
  const { notes: reviewNotes, setNotes: setReviewNotes, clear: clearReviewNotes } = useReviewNotes();
  const [justCompletedIntake, setJustCompletedIntake] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    goal: "all",
    level: "all",
  });
  const [phase, setPhase] = useState<Phase>("intake");
  const [synthesizedPlan, setSynthesizedPlan] = useState<SamplePlan | null>(null);
  const [synthesisInfo, setSynthesisInfo] = useState<{
    synthesized: boolean;
    reason?: string;
  } | null>(null);
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [activationResult, setActivationResult] = useState<{
    slug?: string;
    paths?: { bundle?: string; arc?: string; currentWeek?: string; xlsx?: string };
    wrote?: boolean;
    archived?: string | null;
    reason?: string;
  } | null>(null);

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

  // Review "Build plan" triggers synthesis — POSTs to /api/synthesize and
  // streams progress events. Falls back to the local mocked plan if the API
  // returns synthesized=false (no key) or any error occurs.
  async function handleSynthesize() {
    setPhase("synthesizing");
    setProgressSteps([]);
    setSynthesizedPlan(null);
    setSynthesisInfo(null);

    const coaches = selected
      .map((id) => getCoach(id))
      .filter((c): c is NonNullable<ReturnType<typeof getCoach>> => !!c);
    const fallbackPlan = buildSamplePlan(coaches, intake.goals as GoalKey[]);

    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          coachIds: selected,
          intake,
          notes: reviewNotes,
        }),
      });

      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        // No-key fallback path: JSON response.
        const data = (await res.json()) as {
          plan: SamplePlan;
          synthesized: boolean;
          reason?: string;
        };
        setSynthesizedPlan(data.plan);
        setSynthesisInfo({ synthesized: data.synthesized, reason: data.reason });
        setPhase("preview");
        return;
      }

      if (!res.body) throw new Error("no response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalPlan: SamplePlan | null = null;
      let info: { synthesized: boolean; reason?: string } = { synthesized: true };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE messages are separated by blank lines.
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const lines = chunk.split("\n");
          let event = "message";
          let data = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) event = line.slice(7).trim();
            else if (line.startsWith("data: ")) data += line.slice(6);
          }
          if (!data) continue;
          try {
            const parsed = JSON.parse(data) as Record<string, unknown>;
            if (event === "progress" && typeof parsed.label === "string") {
              setProgressSteps((prev) => [...prev, parsed.label as string]);
            } else if (event === "done") {
              finalPlan = (parsed.plan as SamplePlan) ?? null;
              info = {
                synthesized: parsed.synthesized !== false,
                reason: typeof parsed.reason === "string" ? parsed.reason : undefined,
              };
            }
          } catch {
            // Ignore malformed chunk.
          }
        }
      }

      if (finalPlan) {
        setSynthesizedPlan(finalPlan);
        setSynthesisInfo(info);
      } else {
        setSynthesizedPlan(fallbackPlan);
        setSynthesisInfo({ synthesized: false, reason: "stream ended without plan" });
      }
      setPhase("preview");
    } catch (err) {
      setSynthesizedPlan(fallbackPlan);
      setSynthesisInfo({
        synthesized: false,
        reason: err instanceof Error ? err.message : "synthesis request failed",
      });
      setPhase("preview");
    }
  }

  async function handleActivate() {
    setPhase("activated");
    setActivationResult(null);
    if (!synthesizedPlan) return;
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan: synthesizedPlan,
          coachIds: selected,
          intake,
          notes: reviewNotes,
        }),
      });
      const data = await res.json();
      setActivationResult(data);
    } catch (err) {
      setActivationResult({
        reason: err instanceof Error ? err.message : "activation request failed",
      });
    }
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
          atCap={atCap}
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

      {phase === "synthesizing" && (
        <SynthesizingPhase selected={selected} steps={progressSteps} />
      )}

      {phase === "preview" && (
        <PlanPreview
          selectedCoachIds={selected}
          goals={intake.goals}
          plan={synthesizedPlan ?? undefined}
          synthesized={synthesisInfo?.synthesized}
          fallbackReason={synthesisInfo?.reason}
          onActivate={handleActivate}
          onBack={() => setPhase("review")}
        />
      )}

      {phase === "activated" && (
        <ActivatedPhase
          plan={synthesizedPlan}
          result={activationResult}
          onClearSelection={() => {
            clear();
            clearReviewNotes();
          }}
        />
      )}
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
  atCap,
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
  atCap: boolean;
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
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6 lg:items-start">
        <div className="min-w-0">
      {/* Hero with matched-for header */}
      <div className="mb-6">
        <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight leading-none">
          Find your training team
        </h1>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline sm:flex-wrap gap-x-3 gap-y-2">
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
          atCap={atCap}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filtered.map((coach) => (
            <CoachCard
              key={coach.id}
              coach={coach}
              selected={selected.includes(coach.id)}
              matchingGoals={hasGoals ? matchingGoals(coach, intakeGoals) : []}
              onToggle={() => toggle(coach.id)}
              onOpen={() => router.push(`/plan/coaches/${coach.id}`)}
              atCap={atCap}
            />
          ))}
        </div>
      )}
        </div>
        <TeamSidebar
          selected={selected}
          onRemove={remove}
          onClear={clear}
          onBuild={onBuild}
        />
      </div>

      {/* Bottom selection bar — mobile/tablet only; desktop uses TeamSidebar */}
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

function SynthesizingPhase({
  selected,
  steps,
}: {
  selected: string[];
  steps: string[];
}) {
  const names = selected
    .map((id) => getCoach(id)?.name)
    .filter(Boolean)
    .join(" · ");
  // Show streamed steps as `done`, plus an `active` placeholder line.
  const lines = steps.length > 0
    ? steps
    : ["Loading coach principles", "Reading your context", "Designing arc structure"];
  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-8">
        <div className="text-[14px] text-[var(--ink)] mb-1">Composing your plan…</div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-1">
          ~ 30–60 seconds
        </div>
        <div className="text-[11px] text-[var(--ink-muted)] mb-6 truncate">
          synthesizing from: {names}
        </div>
        <div className="space-y-2 text-[12px]">
          {lines.map((label, i) => (
            <ProgressStep
              key={`${i}-${label}`}
              label={label}
              status={i === lines.length - 1 ? "active" : "done"}
            />
          ))}
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
//
// Two-step flow (TR-335):
//   step 1 ("form")    — phone-number input + Activate button
//   step 2 ("sending") — spinner while POSTing to /api/welcome-sms
//   step 3 ("done")    — confirmation card with masked phone
//
// On submit we run /api/activate (bundle build) and /api/welcome-sms in
// parallel; the SMS is what the athlete actually feels, so its result
// drives the confirmation copy.

const PHONE_DIGITS = /^\d{10}$/;

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function formatPhoneInput(s: string): string {
  // Live-format as (XXX) XXX-XXXX for the 10-digit US case.
  const d = digitsOnly(s).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function maskPhone(digits: string): string {
  // 10 digits → "***-***-1234"
  const d = digitsOnly(digits);
  if (d.length < 4) return "***-***-****";
  return `***-***-${d.slice(-4)}`;
}

function ActivatedPhase({
  plan,
  result,
  onClearSelection,
}: {
  plan: SamplePlan | null;
  result: {
    slug?: string;
    paths?: { bundle?: string; arc?: string; currentWeek?: string; xlsx?: string };
    wrote?: boolean;
    archived?: string | null;
    reason?: string;
  } | null;
  onClearSelection: () => void;
}) {
  // Clear the selection cart since the plan is now "live"
  useEffect(() => {
    onClearSelection();
  }, [onClearSelection]);

  const [step, setStep] = useState<"form" | "sending" | "done">("form");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [smsResult, setSmsResult] = useState<{ sent: boolean; reason?: string } | null>(null);
  const [submittedDigits, setSubmittedDigits] = useState("");

  const title = plan?.meta.title ?? "Your new arc";
  const horizon = plan?.meta.horizon ?? "16 weeks";
  const dpw = plan?.meta.daysPerWeek ?? 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = digitsOnly(phoneInput);
    if (!PHONE_DIGITS.test(digits)) {
      setPhoneError("Enter a 10-digit US phone number.");
      return;
    }
    setPhoneError(null);
    setSubmittedDigits(digits);
    setStep("sending");

    try {
      const res = await fetch("/api/welcome-sms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone: digits, planTitle: title }),
      });
      const data = (await res.json()) as { sent: boolean; reason?: string };
      setSmsResult(data);
    } catch (err) {
      setSmsResult({
        sent: false,
        reason: err instanceof Error ? err.message : "request failed",
      });
    }
    setStep("done");
  }

  if (step === "form") {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-[var(--bg-elev-1)] border border-[var(--accent-line)] rounded-md p-8">
          <div className="text-[16px] text-[var(--ink)] mb-1">Activate your plan</div>
          <div className="text-[12px] text-[var(--ink-dim)] mb-2 tabular">
            {title} · {horizon} · {dpw} days/week
          </div>
          <div className="text-[12px] text-[var(--ink-dim)] mb-6">
            Enter your phone number — we'll text you a confirmation now and
            your daily session each morning.
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <label
              htmlFor="welcome-phone"
              className="block text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2"
            >
              Phone (US)
            </label>
            <input
              id="welcome-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(555) 123-4567"
              value={phoneInput}
              onChange={(e) => {
                setPhoneInput(formatPhoneInput(e.target.value));
                if (phoneError) setPhoneError(null);
              }}
              aria-invalid={phoneError ? "true" : "false"}
              aria-describedby={phoneError ? "welcome-phone-error" : undefined}
              className="w-full px-3 py-2 rounded-sm bg-[var(--bg-elev-2)] border border-[var(--line)] text-[14px] text-[var(--ink)] tabular focus:outline-none focus:border-[var(--accent-line)]"
            />
            {phoneError && (
              <div
                id="welcome-phone-error"
                role="alert"
                className="mt-2 text-[11px] text-[var(--bad,#c33)]"
              >
                {phoneError}
              </div>
            )}
            <button
              type="submit"
              className="mt-6 block w-full text-[11px] font-mono uppercase tracking-wider px-3 py-2 rounded-sm bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
            >
              Activate
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "sending") {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <div className="bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md p-8 text-center">
          <div className="inline-block w-5 h-5 mb-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <div className="text-[13px] text-[var(--ink)] mb-1">Sending your welcome text…</div>
          <div className="text-[11px] text-[var(--ink-muted)] font-mono uppercase tracking-wider">
            usually ~5s
          </div>
        </div>
      </div>
    );
  }

  // step === "done"
  const sent = smsResult?.sent === true;
  const masked = maskPhone(submittedDigits);

  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="bg-[var(--bg-elev-1)] border border-[var(--accent-line)] rounded-md p-8">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={18} className="text-[var(--accent)]" />
          <span className="text-[16px] text-[var(--ink)]">
            {sent
              ? `✓ Plan activated · text sent to ${masked}`
              : "Plan activated · text not sent"}
          </span>
        </div>
        <div className="text-[12px] text-[var(--ink-dim)] mb-2 tabular">
          {title} · {horizon} · {dpw} days/week
        </div>
        <div className="text-[12px] text-[var(--ink-dim)] mb-6">
          {sent
            ? "Tomorrow at 6:30 AM you'll get your first session via SMS. Text back what you did and the dashboard updates in real time."
            : `We couldn't send your welcome text${smsResult?.reason ? ` (${smsResult.reason})` : ""}. Your plan is still saved — try again later.`}
        </div>

        {result?.paths && (
          <div className="mb-6 rounded-sm border border-[var(--line)] bg-[var(--bg-elev-2)] p-3 text-[10px] font-mono leading-relaxed text-[var(--ink-dim)] tabular">
            <div className="text-[var(--ink-muted)] uppercase tracking-wider mb-1">
              bundle{result.wrote ? "" : " (dry run)"}
            </div>
            {result.slug && <div>slug: {result.slug}</div>}
            {result.paths.bundle && <div>{result.paths.bundle}/</div>}
            {result.paths.arc && <div>  {result.paths.arc.replace(`${result.paths.bundle ?? ""}/`, "")}</div>}
            {result.paths.currentWeek && (
              <div>  {result.paths.currentWeek.replace(`${result.paths.bundle ?? ""}/`, "")}</div>
            )}
            {result.archived && (
              <div className="mt-1">archived: {result.archived}</div>
            )}
            {result.reason && (
              <div className="mt-1 text-[var(--ink-muted)]">{result.reason}</div>
            )}
          </div>
        )}

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
      </div>
    </div>
  );
}
