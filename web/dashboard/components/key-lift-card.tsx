import Link from "next/link";
import { Sparkline } from "@/components/charts";
import { Badge, Card, CardBody } from "@/components/ui";
import { format } from "@/lib/format";
import type { KeyLiftCard as KeyLiftCardT } from "@/lib/queries";

const STATUS_TONE: Record<KeyLiftCardT["status"], "good" | "muted" | "warn" | "accent" | "default"> = {
  building: "good",
  stable: "accent",
  "backed-off": "warn",
  "on-hold": "muted",
  "—": "muted",
};

const STATUS_LABEL: Record<KeyLiftCardT["status"], string> = {
  building: "building",
  stable: "stable",
  "backed-off": "backed off",
  "on-hold": "on hold",
  "—": "no data",
};

export function KeyLiftCard({ card }: { card: KeyLiftCardT }) {
  const recentPR = card.pr && new Date(card.pr.date) > addDays(new Date(), -30);
  const delta =
    card.e1rmDelta_kg != null
      ? (card.e1rmDelta_kg / 0.45359237).toFixed(1)
      : null;

  return (
    <Link href={`/progress/${card.slug}`} className="block">
      <Card className="hover:border-[var(--accent-line)] transition-colors h-full">
        <CardBody className="!px-3 !pt-2.5 !pb-2.5">
          <div className="flex items-start justify-between mb-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--ink-muted)] truncate pr-2">
              {card.name}
            </div>
            {recentPR && <span className="text-[var(--accent)] text-[10px] leading-none">✦</span>}
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <div className="text-lg font-semibold tabular leading-none">
              {card.currentE1rm_kg ? format.weight(card.currentE1rm_kg) : "—"}
            </div>
            {delta != null && Number(delta) !== 0 && (
              <span
                className={`text-[11px] tabular leading-none ${
                  Number(delta) > 0 ? "text-[var(--good)]" : "text-[var(--bad)]"
                }`}
              >
                {Number(delta) > 0 ? "▲" : "▼"} {Math.abs(Number(delta))}
              </span>
            )}
          </div>

          <div className="h-6 -mx-1 mb-1">
            <Sparkline data={card.sparkline} yKey="e1rm_kg" height={24} />
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <Badge tone={STATUS_TONE[card.status]} className="!py-0 !text-[10px] !px-1.5">
              {STATUS_LABEL[card.status]}
            </Badge>
            <span className="text-[var(--ink-muted)] tabular">
              {card.pr ? `PR ${format.shortDate(card.pr.date)}` : "no PR"}
            </span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
