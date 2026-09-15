import { Clock } from "lucide-react";
import { format } from "@/lib/format";

export function TopBar() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  return (
    <header className="h-16 shrink-0 border-b border-[var(--line)] bg-[var(--bg)] px-10 flex items-center justify-between">
      <div className="text-sm text-[var(--ink)] font-semibold">Andy Lee</div>
      <div className="flex items-center gap-2 text-sm text-[var(--ink-dim)]">
        <Clock size={14} />
        <span className="tabular">{dateLabel}</span>
        <span className="text-[var(--ink-muted)]">·</span>
        <span className="tabular text-[var(--ink-muted)]">{format.time(today)}</span>
      </div>
    </header>
  );
}
