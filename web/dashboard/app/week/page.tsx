import { getArcSummary, getCurrentWeek } from "@/lib/bundle";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Badge } from "@/components/ui";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

const DAY_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default async function WeekPage() {
  const [arc, days] = await Promise.all([getArcSummary(), getCurrentWeek()]);
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const ordered = DAY_ORDER.map((d) => days.find((s) => s.day === d) ?? { day: d, date: "", title: "Rest", exercises: [] });

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="This Week"
        subtitle={
          arc?.currentWeek
            ? `Arc Week ${arc.currentWeek} of ${arc.totalWeeks} · ${arc.currentBlock?.name ?? ""}`
            : undefined
        }
      />

      <div className="grid grid-cols-7 gap-3">
        {ordered.map((d) => {
          const isToday = d.day === today;
          const isRest = d.title.toLowerCase() === "rest";
          return (
            <Card
              key={d.day}
              className={isToday ? "ring-2 ring-[var(--accent)]" : ""}
            >
              <CardHeader className="pb-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {d.day.slice(0, 3)}
                  </div>
                  <div className="text-xs text-[var(--ink-dim)] mt-0.5 tabular">{d.date}</div>
                </div>
                {isToday && <Badge tone="accent">Today</Badge>}
              </CardHeader>
              <CardBody className="pt-1 pb-4">
                <div
                  className={`text-sm font-medium mb-2 leading-tight ${
                    isRest ? "text-[var(--ink-muted)]" : ""
                  }`}
                >
                  {d.title}
                </div>
                {d.exercises.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-[var(--ink-muted)] tabular">
                    <Activity size={11} />
                    {d.exercises.length} ex
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
