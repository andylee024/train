"use client";

/**
 * Widget Gallery — modal panel for adding a new widget to a dashboard section.
 *
 * Two-step flow: (1) pick a widget kind from the gallery; (2) fill in the
 * minimal config for that kind. Submitting calls `onPick(spec)` with a fully-
 * formed WidgetSpec; cancelling calls `onClose`.
 */
import { useState } from "react";
import type { WidgetSpec, ColumnSpan } from "@/lib/widgets/types";
import type { RenderContext } from "./dashboard-renderer";
import { cn } from "@/lib/cn";
import { X, ChevronLeft } from "lucide-react";

type Kind = WidgetSpec["kind"];

type GalleryEntry = {
  kind: Kind;
  label: string;
  description: string;
  defaultW: ColumnSpan;
};

const ENTRIES: GalleryEntry[] = [
  {
    kind: "kpi",
    label: "KPI Card",
    description: "Big single number with a caption. PRs, sessions, tonnage, etc.",
    defaultW: 3,
  },
  {
    kind: "lift-trajectory",
    label: "Lift Trajectory",
    description: "Bars per session for one lift. e1RM number on each bar.",
    defaultW: 6,
  },
  {
    kind: "pr-log",
    label: "PR Log",
    description: "Chronological list of recent PR events.",
    defaultW: 12,
  },
  {
    kind: "lift-change",
    label: "All Lifts Table",
    description: "Diverging-bar list of every lift with filter chips + search.",
    defaultW: 12,
  },
];

export function WidgetGallery({
  onPick,
  onClose,
  ctx,
}: {
  onPick: (spec: WidgetSpec) => void;
  onClose: () => void;
  ctx: RenderContext;
}) {
  const [picked, setPicked] = useState<GalleryEntry | null>(null);

  return (
    <div className="absolute z-20 top-full mt-2 left-0 right-0 bg-[var(--bg-elev-1)] border border-[var(--line)] rounded-md shadow-xl p-4 max-w-3xl mx-auto">
      <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          {picked && (
            <button
              onClick={() => setPicked(null)}
              className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
              aria-label="Back"
            >
              <ChevronLeft size={14} />
            </button>
          )}
          <span className="section-label">
            {picked ? `Configure · ${picked.label}` : "Add Widget"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {!picked ? (
        <div className="grid grid-cols-2 gap-2">
          {ENTRIES.map((e) => (
            <button
              key={e.kind}
              onClick={() => setPicked(e)}
              className="text-left p-3 rounded-sm border border-[var(--line)] hover:border-[var(--accent-line)] hover:bg-[var(--bg-elev-2)] transition-colors"
            >
              <div className="text-[12px] text-[var(--ink)] font-medium mb-1">
                {e.label}
              </div>
              <div className="text-[10px] text-[var(--ink-muted)] leading-relaxed">
                {e.description}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <ConfigForm
          entry={picked}
          ctx={ctx}
          onSubmit={(props) => {
            onPick({
              kind: picked.kind,
              w: picked.defaultW,
              props,
            } as WidgetSpec);
          }}
        />
      )}
    </div>
  );
}

// ----- per-kind config forms ------------------------------------------------

function ConfigForm({
  entry,
  ctx,
  onSubmit,
}: {
  entry: GalleryEntry;
  ctx: RenderContext;
  onSubmit: (props: WidgetSpec["props"]) => void;
}) {
  switch (entry.kind) {
    case "kpi":
      return <KPIForm onSubmit={onSubmit} ctx={ctx} />;
    case "lift-trajectory":
      return <LiftTrajectoryForm onSubmit={onSubmit} ctx={ctx} />;
    case "pr-log":
      return <PRLogForm onSubmit={onSubmit} />;
    case "lift-change":
      return <LiftChangeForm onSubmit={onSubmit} ctx={ctx} />;
  }
}

const KPI_PRESETS: { label: string; caption: string; pick: (h: NonNullable<RenderContext["headlines"]>) => string | number; trend?: "up" | "down" | "flat" | null }[] = [
  { label: "PRs last 30 days", caption: "PRs last 30 d", pick: (h) => h.prs30d, trend: "up" },
  { label: "Sessions last 30 days", caption: "Sessions 30 d", pick: (h) => h.sessions30d },
  { label: "Tonnage last 7 days (lb)", caption: "Tonnage 7 d · lb", pick: (h) => h.tonnage7d_lb > 0 ? h.tonnage7d_lb.toLocaleString() : "—" },
  { label: "Lifts moving up", caption: "Lifts moving ↗", pick: (h) => h.liftsTotal > 0 ? `${h.liftsUp}/${h.liftsTotal}` : "—" },
];

function KPIForm({ ctx, onSubmit }: { ctx: RenderContext; onSubmit: (props: WidgetSpec["props"]) => void }) {
  const [presetIdx, setPresetIdx] = useState(0);
  return (
    <FormShell
      onSubmit={() => {
        const preset = KPI_PRESETS[presetIdx];
        const h = ctx.headlines;
        const value = h ? preset.pick(h) : 0;
        onSubmit({ caption: preset.caption, value, trend: preset.trend ?? null });
      }}
      submitLabel="Add KPI"
    >
      <Label>Metric</Label>
      <Select value={presetIdx} onChange={setPresetIdx} options={KPI_PRESETS.map((p, i) => ({ value: i, label: p.label }))} />
    </FormShell>
  );
}

function LiftTrajectoryForm({ ctx, onSubmit }: { ctx: RenderContext; onSubmit: (props: WidgetSpec["props"]) => void }) {
  // Available lifts = those with any session count
  const liftOptions = (ctx.keyLifts ?? [])
    .filter((k) => k.sessionCount > 0)
    .map((k) => ({ value: k.name, label: `${k.name} (${k.sessionCount} sessions)` }));
  const fallback = liftOptions[0]?.value ?? "";
  const [liftName, setLiftName] = useState<string>(fallback);
  return (
    <FormShell
      onSubmit={() => onSubmit({ liftName })}
      submitLabel="Add Trajectory"
      disabled={!liftName}
    >
      <Label>Lift</Label>
      {liftOptions.length > 0 ? (
        <Select value={liftName} onChange={setLiftName} options={liftOptions} />
      ) : (
        <div className="text-[11px] text-[var(--ink-muted)]">
          No key lifts with sessions available. Log workouts first.
        </div>
      )}
    </FormShell>
  );
}

function PRLogForm({ onSubmit }: { onSubmit: (props: WidgetSpec["props"]) => void }) {
  const [lookbackDays, setLookbackDays] = useState(90);
  const [limit, setLimit] = useState(10);
  return (
    <FormShell
      onSubmit={() => onSubmit({ lookbackDays, limit })}
      submitLabel="Add PR Log"
    >
      <Label>Lookback (days)</Label>
      <Select
        value={lookbackDays}
        onChange={setLookbackDays}
        options={[7, 30, 90, 365].map((d) => ({ value: d, label: `Last ${d} days` }))}
      />
      <Label>Max rows</Label>
      <Select
        value={limit}
        onChange={setLimit}
        options={[5, 10, 20, 50].map((n) => ({ value: n, label: `${n}` }))}
      />
    </FormShell>
  );
}

function LiftChangeForm({ ctx, onSubmit }: { ctx: RenderContext; onSubmit: (props: WidgetSpec["props"]) => void }) {
  const keyOptions = (ctx.keyLifts ?? []).map((k) => k.name);
  return (
    <FormShell
      onSubmit={() => onSubmit({ keyNames: keyOptions })}
      submitLabel="Add Lifts Table"
    >
      <div className="text-[11px] text-[var(--ink-muted)]">
        Uses default key lifts for the active tab. Filter chips (All / Core / Growing / Declining / Stalled) are built in.
      </div>
    </FormShell>
  );
}

// ----- form atoms -----------------------------------------------------------

function FormShell({
  children,
  onSubmit,
  submitLabel,
  disabled = false,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {children}
      <div className="pt-3 mt-3 border-t border-[var(--line-soft)] flex justify-end">
        <button
          onClick={onSubmit}
          disabled={disabled}
          className={cn(
            "px-3 py-1 rounded-sm text-[11px] font-mono uppercase tracking-wider transition-colors",
            disabled
              ? "text-[var(--ink-muted)] border border-[var(--line)] opacity-40 cursor-not-allowed"
              : "bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90"
          )}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)] pt-1">
      {children}
    </div>
  );
}

function Select<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={String(value)}
      onChange={(e) => {
        const v = e.target.value;
        const next = typeof value === "number" ? (Number(v) as T) : (v as T);
        onChange(next);
      }}
      className="w-full px-2 py-1 text-[12px] rounded-sm bg-[var(--bg-elev-2)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--accent-line)]"
    >
      {options.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
