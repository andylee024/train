/**
 * Kindle-tight primitives.
 *
 * No card backgrounds, no shadows. Sections separated by hairline rules + tracked
 * mono section labels. Single accent color, otherwise grayscale ink.
 */
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

// ----- Card --- structural only, no visible chrome ---------------------------

export function Card({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("pb-2 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("section-label", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

// ----- Section --- the canonical Kindle pattern -----------------------------
// Hairline rule + tracked mono label + body. Use this in place of Card.

export function Section({
  label,
  meta,
  children,
  className,
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("pt-5", className)}>
      <div className="hairline pt-2 pb-3 flex items-baseline justify-between">
        <span className="section-label">{label}</span>
        {meta && <span className="text-[10px] font-mono text-[var(--ink-muted)] tabular">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

// ----- Badge --- minimal, neutral by default --------------------------------

type Tone = "default" | "accent" | "good" | "warn" | "bad" | "info" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  default: "text-[var(--ink-dim)] border-[var(--line)]",
  accent:  "text-[var(--accent)] border-[var(--accent-line)]",
  good:    "text-[var(--good)] border-[var(--line)]",
  warn:    "text-[var(--warn)] border-[var(--line)]",
  bad:     "text-[var(--bad)] border-[var(--line)]",
  info:    "text-[var(--info)] border-[var(--line)]",
  muted:   "text-[var(--ink-muted)] border-[var(--line-soft)]",
};

export function Badge({
  tone = "default",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0 rounded text-[10px] font-mono uppercase tracking-wider tabular border",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ----- Headline --- the canonical "one number per pillar" primitive ----------

export function Headline({
  value,
  unit,
  caption,
  delta,
  deltaTone = "default",
}: {
  value: ReactNode;
  unit?: string;
  caption?: ReactNode;
  delta?: ReactNode;
  deltaTone?: Tone;
}) {
  const deltaToneClass =
    deltaTone === "good" ? "text-[var(--good)]" :
    deltaTone === "bad" ? "text-[var(--bad)]" :
    deltaTone === "warn" ? "text-[var(--warn)]" :
    "text-[var(--ink-dim)]";
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[32px] font-semibold tabular leading-none">{value}</span>
      {unit && <span className="text-sm text-[var(--ink-muted)] tabular">{unit}</span>}
      {delta && <span className={cn("text-xs tabular", deltaToneClass)}>{delta}</span>}
      {caption && <span className="text-[11px] text-[var(--ink-muted)] ml-2">{caption}</span>}
    </div>
  );
}

// ----- Stat --- legacy, kept for back-compat ---------------------------------

export function Stat({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  trend?: { value: string; tone?: Tone };
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="section-label">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight tabular">{value}</div>
        {trend && (
          <Badge tone={trend.tone ?? "default"}>{trend.value}</Badge>
        )}
      </div>
      {sub && <div className="text-xs text-[var(--ink-muted)]">{sub}</div>}
    </div>
  );
}

// ----- Divider --------------------------------------------------------------

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-[var(--line)]", className)} />;
}

// ----- PageHeader -----------------------------------------------------------

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-2">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight leading-none">{title}</h1>
        {subtitle && (
          <div className="mt-1.5 text-[11px] text-[var(--ink-muted)] font-mono uppercase tracking-wider">
            {subtitle}
          </div>
        )}
      </div>
      {actions}
    </div>
  );
}
