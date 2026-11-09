"use client";

import { useMemo, useState } from "react";

import { BodyweightChart, E1rmChart, TonnageChart, TouchChart } from "@/components/charts";
import { formatDate, formatInches, formatLb, formatPct, formatSignedLb, formatStamp } from "@/lib/format";
import { liftView, weeklyTonnage } from "@/lib/series";
import type { DashboardData, PeriodKind } from "@/lib/types";

const PERIODS: { id: PeriodKind; label: string; hint: string }[] = [
  { id: "2w", label: "2 weeks", hint: "Fourteen days ending today, then the fourteen before that." },
  { id: "4w", label: "4 weeks", hint: "Twenty-eight days ending today, then the twenty-eight before that." },
  { id: "month", label: "Month", hint: "Calendar months. The open month runs through today." },
  {
    id: "block",
    label: "Block",
    hint: "Four-week blocks from arc week 1 on May 24, 2026. Earlier chunks are pre-arc, same length.",
  },
];

/** Analyst view: one lift's estimated max, period volume, and the log around it. */
export function Dashboard({ data }: { data: DashboardData }) {
  const [liftKey, setLiftKey] = useState("back-squat");
  const [period, setPeriod] = useState<PeriodKind>("4w");
  const lift = data.lifts.find((item) => item.key === liftKey) ?? data.lifts[0];
  const view = useMemo(() => liftView(data.sets, lift, period, data.today), [data.sets, lift, period, data.today]);
  const weeks = useMemo(() => weeklyTonnage(data.sets, data.today), [data.sets, data.today]);
  const pinned = data.lifts.filter((item) =>
    ["back-squat", "power-clean", "clean-and-jerk", "power-snatch"].includes(item.key),
  );
  const others = data.lifts.filter((item) => !pinned.some((itemPinned) => itemPinned.key === item.key));
  const hint = PERIODS.find((item) => item.id === period)?.hint ?? "";
  const gap = lift.goalLb != null && view.best ? Math.round(lift.goalLb - view.best.e1rmLb) : null;
  const sessions = new Set(
    data.sets.filter((set) => set.liftKey === lift.key && set.date <= data.today).map((set) => set.workoutId),
  ).size;

  return (
    <main className="shell">
      <header className="top">
        <div>
          <p className="mark">Analyst</p>
          <h1>Andy Lee</h1>
        </div>
        <div className="meta">
          <span className={data.source === "fixture" ? "badge warn" : "badge live"}>
            {data.source === "fixture" ? "Fixture data" : "Live log"}
          </span>
          <span>Pounds</span>
          <span>As of {formatStamp(data.generatedAt)}</span>
        </div>
      </header>

      {data.source === "fixture" ? (
        <p className="banner">
          These numbers are the built-in fixture, not the training log. Set SUPABASE_URL and SUPABASE_KEY on the
          server to read Supabase. The page rechecks about every five minutes.
        </p>
      ) : (
        <p className="banner quiet">Read from Supabase. The page rechecks about every five minutes.</p>
      )}

      <section className="card lift-card">
        <div className="lift-row">
          <div className="pills" role="group" aria-label="Primary lifts">
            {pinned.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={item.key === lift.key}
                onClick={() => setLiftKey(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="more">
            <span>All lifts</span>
            <select id="lift" value={lift.key} onChange={(event) => setLiftKey(event.target.value)}>
              <optgroup label="Goals">
                {pinned.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Logged">
                {others.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>

        <div className="hero">
          <div>
            <p className="eyebrow">Estimated 1RM</p>
            <p className="figure">
              {view.best ? formatLb(view.best.e1rmLb) : "—"}
              <span>lb</span>
            </p>
            <p className="sub">
              {view.best
                ? `${formatLb(view.best.weightLb)} × ${view.best.reps} · ${formatDate(view.best.date)}`
                : "No set of 10 reps or fewer."}
            </p>
          </div>
          <dl className="stats">
            <div>
              <dt>Goal</dt>
              <dd>{lift.goalLb != null ? `${formatLb(lift.goalLb)} lb` : "—"}</dd>
            </div>
            <div>
              <dt>To goal</dt>
              <dd>
                {gap == null ? "—" : gap > 0 ? `${formatLb(gap)} lb` : gap < 0 ? `${formatLb(Math.abs(gap))} past` : "Met"}
              </dd>
            </div>
            <div>
              <dt>Latest</dt>
              <dd>{view.latest ? `${formatLb(view.latest.e1rmLb)} lb` : "—"}</dd>
            </div>
            <div>
              <dt>Sessions</dt>
              <dd>{sessions}</dd>
            </div>
          </dl>
        </div>

        {view.points.length > 0 ? (
          <E1rmChart points={view.points} goalLb={lift.goalLb} />
        ) : (
          <p className="empty-inline">No estimated 1RM yet for {lift.label}.</p>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>Period</h2>
            <p>{hint}</p>
          </div>
          <div className="pills" role="group" aria-label="Period">
            {PERIODS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === period}
                onClick={() => setPeriod(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {view.periods.length === 0 ? (
          <p className="empty-inline">No loaded sets for {lift.label}.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption>{lift.label} loaded volume, newest period first. Delta is tonnage against the previous period.</caption>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Sessions</th>
                  <th>Loaded sets</th>
                  <th>Tonnage</th>
                  <th>Δ tonnage</th>
                </tr>
              </thead>
              <tbody>
                {view.periods.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    <td>{row.sessions}</td>
                    <td>{row.loadedSets}</td>
                    <td>{formatLb(row.tonnageLb)} lb</td>
                    <td className={deltaClass(row.deltaTonnageLb)}>
                      {row.deltaTonnageLb == null ? (
                        "—"
                      ) : (
                        <>
                          {formatSignedLb(row.deltaTonnageLb)} lb
                          {row.deltaPct != null ? <span className="pct"> {formatPct(row.deltaPct)}</span> : null}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="split">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Weekly tonnage</h2>
              <p>All lifts. Sunday weeks. Loaded sets only.</p>
            </div>
          </div>
          {weeks.length > 0 ? <TonnageChart weeks={weeks} /> : <p className="empty-inline">No loaded sets.</p>}
        </section>
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Bodyweight</h2>
              <p>Daily log, pounds.</p>
            </div>
          </div>
          {data.bodyweight.length > 0 ? (
            <BodyweightChart points={data.bodyweight} />
          ) : (
            <p className="empty-inline">No bodyweight logged.</p>
          )}
        </section>
      </div>

      <div className="split">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Last 10 top sets</h2>
              <p>Best estimated 1RM in each of the last ten sessions.</p>
            </div>
          </div>
          {view.topSets.length === 0 ? (
            <p className="empty-inline">No top set yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Set</th>
                    <th>e1RM</th>
                  </tr>
                </thead>
                <tbody>
                  {view.topSets.map((set) => (
                    <tr key={`${set.date}-${set.weightLb}-${set.reps}`}>
                      <th scope="row">{formatDate(set.date)}</th>
                      <td>
                        {formatLb(set.weightLb)} × {set.reps}
                      </td>
                      <td>{formatLb(set.e1rmLb)} lb</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h2>Approach touch</h2>
              <p>Height from the set note. Box heights are ignored.</p>
            </div>
          </div>
          {data.jumps.length === 0 ? (
            <div className="empty">
              <p className="empty-title">Not logged yet</p>
              <p>Write the touch in the set note, like 10&apos;2&quot; or 122 in.</p>
              {data.jumpWork.length > 0 ? (
                <ul className="jump-work">
                  {data.jumpWork.slice(0, 4).map((work) => (
                    <li key={work.exercise}>
                      <span>{work.exercise}</span>
                      <span>
                        {work.sessions} session{work.sessions === 1 ? "" : "s"} · {formatDate(work.lastDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <>
              <TouchChart attempts={data.jumps} />
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Height</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.jumps].reverse().slice(0, 10).map((attempt) => (
                      <tr key={`${attempt.date}-${attempt.exercise}-${attempt.inches}`}>
                        <th scope="row">{formatDate(attempt.date)}</th>
                        <td>{formatInches(attempt.inches)}</td>
                        <td className="note">{attempt.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      <footer>
        Epley estimated 1RM uses sets of 10 reps or fewer. Tonnage is pounds times reps on loaded sets.
        Power clean and jerk is read as clean and jerk. Weeks start Sunday. Arc week 1 is May 24, 2026.
      </footer>
    </main>
  );
}

function deltaClass(delta: number | null): string {
  if (delta == null || Math.round(delta) === 0) return "flat";
  return delta > 0 ? "up" : "down";
}
