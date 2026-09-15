"use client";

import { useState } from "react";
import type { LiftChange, KeyLiftCard, TabHeadlines, ExerciseSummary } from "@/lib/queries";
import { Panel } from "@/components/panel";
import { LiftCard } from "@/components/lift-card";
import { AllLifts } from "@/components/all-lifts";
import { PRLog, prEventsFromSummaries } from "@/components/pr-log";
import { BigNumber } from "@/components/viz/big-number";
import { viewFor, VIEWS, KEY_LIFTS, type View } from "@/lib/view";
import { cn } from "@/lib/cn";

/** Upper / Lower / Power lenses on the same data. Layout is fixed; edit this file to change it. */
export function PerformanceViews({
  lifts,
  keyLifts,
  summaries,
  headlines,
  initialView = "Upper",
}: {
  lifts: LiftChange[];
  keyLifts: KeyLiftCard[];
  summaries: ExerciseSummary[];
  headlines: Record<string, TabHeadlines>;
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);
  const inView = (name: string) => viewFor(name) === view;
  const viewLifts = lifts.filter((l) => inView(l.name));
  const h = headlines[view] ?? { prs30d: 0, sessions30d: 0, tonnage7d_lb: 0, liftsUp: 0, liftsTotal: 0 };
  const cards = KEY_LIFTS[view].map((name) => keyLifts.find((k) => k.name === name) ?? emptyCard(name));
  const prEvents = prEventsFromSummaries(summaries, 90, inView);

  return (
    <div>
      <div className="flex items-baseline gap-6 mb-5 border-b border-[var(--line)]">
        {VIEWS.map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "pb-2 -mb-px text-[11px] font-mono uppercase tracking-wider transition-colors",
              v === view
                ? "text-[var(--accent)] border-b border-[var(--accent)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink-dim)]",
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Panel><BigNumber caption="PRs last 30 d" value={h.prs30d} trend={h.prs30d > 0 ? "up" : null} /></Panel>
          <Panel><BigNumber caption="Sessions 30 d" value={h.sessions30d} /></Panel>
          <Panel><BigNumber caption="Tonnage 7 d" unit="lb" value={h.tonnage7d_lb > 0 ? h.tonnage7d_lb.toLocaleString() : "—"} /></Panel>
          <Panel><BigNumber caption="Lifts moving ↗" value={h.liftsTotal > 0 ? `${h.liftsUp}/${h.liftsTotal}` : "—"} /></Panel>
        </div>

        <section>
          <SectionRule label="Core Lifts" meta="e1RM trajectory · last 6 months" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((c) => <LiftCard key={c.name} card={c} />)}
          </div>
        </section>

        <Panel title="All Lifts">
          <AllLifts lifts={viewLifts} keyNames={KEY_LIFTS[view]} />
        </Panel>

        <Panel title="Recent PRs" meta="last 90 days" empty={prEvents.length === 0} emptyMessage="no PRs in window">
          <PRLog events={prEvents} limit={10} />
        </Panel>
      </div>
    </div>
  );
}

function SectionRule({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="hairline pt-2 pb-2 mb-3 flex items-baseline justify-between">
      <span className="section-label">{label}</span>
      {meta && <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">{meta}</span>}
    </div>
  );
}

function emptyCard(name: string): KeyLiftCard {
  return {
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    lastTouched: null,
    sessionCount: 0,
    tonnage_kg: 0,
    e1rmDelta_kg: null,
    currentE1rm_kg: null,
    pr: null,
    sparkline: [],
    status: "—",
  };
}
