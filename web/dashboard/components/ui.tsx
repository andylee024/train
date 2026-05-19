/** Minimal shadcn-style primitives — Card, Badge, Stat, etc. */
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

// ----- Card -------------------------------------------------------------------

export function Card({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[var(--bg-elev-1)] border border-[var(--line)] overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-5 pt-4 pb-3 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--ink-muted)]", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}

// ----- Badge ------------------------------------------------------------------

type Tone = "default" | "accent" | "good" | "warn" | "bad" | "info" | "muted";

const TONE_CLASS: Record<Tone, string> = {
  default: "bg-[var(--bg-elev-3)] text-[var(--ink-dim)] border-[var(--line)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]",
  good: "bg-[rgba(74,222,128,0.12)] text-[var(--good)] border-[rgba(74,222,128,0.25)]",
  warn: "bg-[rgba(250,204,21,0.12)] text-[var(--warn)] border-[rgba(250,204,21,0.25)]",
  bad: "bg-[rgba(239,68,68,0.12)] text-[var(--bad)] border-[rgba(239,68,68,0.25)]",
  info: "bg-[rgba(96,165,250,0.12)] text-[var(--info)] border-[rgba(96,165,250,0.25)]",
  muted: "bg-transparent text-[var(--ink-muted)] border-[var(--line-soft)]",
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
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border tabular",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ----- Stat -------------------------------------------------------------------

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
      <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight tabular">{value}</div>
        {trend && (
          <Badge tone={trend.tone ?? "default"} className="!text-[10px] !py-0">
            {trend.value}
          </Badge>
        )}
      </div>
      {sub && <div className="text-xs text-[var(--ink-muted)]">{sub}</div>}
    </div>
  );
}

// ----- Divider ----------------------------------------------------------------

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-[var(--line)]", className)} />;
}

// ----- Page header ------------------------------------------------------------

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
    <div className="flex items-end justify-between mb-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <div className="mt-1.5 text-sm text-[var(--ink-dim)]">{subtitle}</div>
        )}
      </div>
      {actions}
    </div>
  );
}
