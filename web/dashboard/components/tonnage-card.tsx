"use client";

import { useMemo, useState } from "react";
import { VolumeBars } from "@/components/charts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  { id: "all", label: "All", match: () => true },
  { id: "squat", label: "Squat", match: (n: string) => /squat/i.test(n) },
  { id: "bench", label: "Bench", match: (n: string) => /bench/i.test(n) },
  { id: "dl", label: "Deadlift", match: (n: string) => /(deadlift|sldl|stiff)/i.test(n) },
  { id: "snatch", label: "Snatch", match: (n: string) => /snatch/i.test(n) },
  { id: "clean", label: "Clean", match: (n: string) => /clean/i.test(n) },
  { id: "pull", label: "Pull", match: (n: string) => /(pull-up|pullup|row|chin)/i.test(n) },
  { id: "jump", label: "Jump", match: (n: string) => /(jump|pogo|plyo|sprint|cmj)/i.test(n) },
];

type SetSummary = { exercise_name: string; performed_at: string; weight_kg: number; reps: number };

export function TonnageCard({ sets }: { sets: SetSummary[] }) {
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];
    return sets.filter((s) => cat.match(s.exercise_name));
  }, [sets, activeCat]);

  const data = useMemo(() => {
    // Group by ISO week start (Sunday)
    const byWk = new Map<string, number>();
    for (const s of filtered) {
      const d = new Date(s.performed_at);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      const k = d.toISOString().slice(0, 10);
      byWk.set(k, (byWk.get(k) ?? 0) + s.weight_kg * s.reps);
    }
    // Build last 12 weeks contiguously
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    now.setDate(now.getDate() - now.getDay());
    const out: { label: string; kg: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const k = d.toISOString().slice(0, 10);
      out.push({
        label: i === 0 ? "now" : `W-${i}`,
        kg: Math.round(byWk.get(k) ?? 0),
      });
    }
    return out;
  }, [filtered]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Tonnage by week</CardTitle>
          <div className="mt-1 text-xs text-[var(--ink-muted)]">
            Total kg lifted (reps × weight), 12-week window
          </div>
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-md border transition-colors",
                activeCat === c.id
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-line)]"
                  : "bg-transparent text-[var(--ink-muted)] border-[var(--line)] hover:text-[var(--ink-dim)] hover:border-[var(--bg-elev-3)]"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardBody className="pt-1">
        <VolumeBars data={data} xKey="label" yKey="kg" />
      </CardBody>
    </Card>
  );
}
