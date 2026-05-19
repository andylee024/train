import { getArcSummary } from "@/lib/bundle";
import { format } from "@/lib/format";
import { ChevronRight, Clock } from "lucide-react";

export async function TopBar() {
  const arc = await getArcSummary();
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="h-16 shrink-0 border-b border-[var(--line)] bg-[var(--bg)] px-10 flex items-center justify-between">
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--ink)] font-semibold">{arc?.athlete ?? "Andy Lee"}</span>
        <ChevronRight size={14} className="text-[var(--ink-muted)]" />
        <span className="text-[var(--ink-dim)]">{arc?.name ?? "—"}</span>
        {arc?.currentWeek && arc?.totalWeeks ? (
          <>
            <ChevronRight size={14} className="text-[var(--ink-muted)]" />
            <span className="text-[var(--ink-dim)]">
              Week {arc.currentWeek} of {arc.totalWeeks}
            </span>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-2 text-sm text-[var(--ink-dim)]">
        <Clock size={14} />
        <span className="tabular">{dateLabel}</span>
        <span className="text-[var(--ink-muted)]">·</span>
        <span className="tabular text-[var(--ink-muted)]">{format.time(today)}</span>
      </div>
    </header>
  );
}
