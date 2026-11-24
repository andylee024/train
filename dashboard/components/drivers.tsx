"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CONTACTS_PLAN,
  DRIVERS,
  STATUS_LABEL,
  TODO,
  TOUCH_TARGET_IN,
  type DriverConfig,
} from "@/lib/drivers";
import { formatShort } from "@/lib/format";
import type { DriverNow, DriversView, DriverStatus, DriverWeek } from "@/lib/types";

const AXIS = "#8d887f";
const GRID = "rgba(242, 239, 232, 0.08)";
const LIME = "#d6ff4a";
const BLUE = "#8eb6ff";
const PAPER = "#f2efe8";

const fmt = (value: number | null | undefined, digits: number) =>
  value == null ? "—" : value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

function Frame({ height, children }: { height: number; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <div style={{ height, width: "100%", minWidth: 0 }}>{ready ? children : null}</div>;
}

function Tip({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="tip">
      <p>{title}</p>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function tone(status: DriverStatus): string {
  if (status === "improving" || status === "dose-on") return "good";
  if (status === "slipping" || status === "dose-none") return "bad";
  if (status === "flat" || status === "dose-light") return "mid";
  return "none";
}

function valueText(driver: DriverConfig, value: number | null): string {
  if (value == null) return "—";
  if (driver.key === "strength") return `${fmt(value, 2)}× bodyweight`;
  if (driver.key === "bodyweight") return `${fmt(value, 1)} lb`;
  if (driver.key === "explosive") return `Ratio ${fmt(value, 2)}`;
  return `Gap ${value > 0 ? "+" : ""}${fmt(value, 1)} in`;
}

function goalText(driver: DriverConfig): string {
  if (driver.key === "strength") return `${fmt(driver.target, 2)}×`;
  if (driver.key === "bodyweight") return `${driver.target} lb`;
  if (driver.key === "explosive") return fmt(driver.target, 2);
  return `+${fmt(driver.target, 0)} in`;
}

function Info({ driver }: { driver: DriverConfig }) {
  return (
    <details className="jd-info">
      <summary aria-label={`What ${driver.name} means`}>i</summary>
      <div className="jd-info-body">
        <p>
          <b>{driver.oneLiner}</b>
        </p>
        <p>
          <span>Measure</span> {driver.measure}.
          {driver.retest
            ? " Tested at the W4 and W8 retests (wall, best of 3, inches from the floor) and carried forward until the next one."
            : driver.key === "bodyweight"
              ? " Latest weigh-in."
              : " Best set in the last 6 weeks, else the last 12. e1RM = weight × (1 + reps ÷ 30)."}
        </p>
        {driver.key === "reactive" ? (
          <p>
            <span>Each week</span> Reactive contacts: logged reps of depth jumps, pogos, hurdle hops and bounds,
            against about {CONTACTS_PLAN}. That shows whether you did the work, not how springy you are.
          </p>
        ) : null}
        <p>
          <span>Score</span> 0 at {driver.floor}, 100 at {driver.target} (your Jan 30 goal), straight line in between.
          Weight in the composite: {driver.weight}%.
        </p>
      </div>
    </details>
  );
}

function Spark({ weeks, driver }: { weeks: DriverWeek[]; driver: DriverConfig }) {
  const rows = weeks.slice(-16);
  if (driver.key === "reactive") {
    const bars = weeks.slice(-12).map((week) => ({ weekStart: week.weekStart, contacts: week.reactiveContacts }));
    return (
      <Frame height={64}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
            <ReferenceLine y={CONTACTS_PLAN} stroke={AXIS} strokeDasharray="3 3" />
            <YAxis hide domain={[0, (max: number) => Math.max(CONTACTS_PLAN, max)]} />
            <Tooltip
              cursor={{ fill: "rgba(242,239,232,0.05)" }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <Tip
                    title={`Week of ${formatShort(String(payload[0].payload.weekStart))}`}
                    lines={[`${payload[0].payload.contacts} contacts`]}
                  />
                ) : null
              }
            />
            <Bar dataKey="contacts" fill={LIME} radius={[3, 3, 0, 0]} minPointSize={1} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Frame>
    );
  }
  const data = rows.map((week) => ({
    weekStart: week.weekStart,
    score: week.scores[driver.key],
    value: week.values[driver.key],
  }));
  if (!data.some((row) => row.score != null)) return <p className="jd-none">No readings yet</p>;
  return (
    <Frame height={64}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <Tip
                  title={`Week of ${formatShort(String(payload[0].payload.weekStart))}`}
                  lines={[
                    valueText(driver, payload[0].payload.value as number | null),
                    `Score ${payload[0].payload.score ?? "—"}`,
                  ]}
                />
              ) : null
            }
          />
          <Line
            type="linear"
            dataKey="score"
            stroke={LIME}
            strokeWidth={2}
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Frame>
  );
}

function DriverCard({
  driver,
  now,
  weeks,
  isLimiter,
}: {
  driver: DriverConfig;
  now: DriverNow;
  weeks: DriverWeek[];
  isLimiter: boolean;
}) {
  const read = now.drivers.find((item) => item.key === driver.key);
  if (!read) return null;
  const testDate = driver.key === "reactive" ? now.reactiveTestDate : now.approachTestDate;
  const tested = testDate ? `tested ${formatShort(testDate)}` : "first test at the W4 retest";
  const todo = TODO[driver.key][read.status];
  const trackLabel = read.track.charAt(0).toUpperCase() + read.track.slice(1);
  return (
    <article className={`card jd-card${isLimiter ? " is-limiter" : ""}`}>
      <div className="jd-card-head">
        <h3>
          {driver.name}
          <Info driver={driver} />
        </h3>
        <span className={`jd-pill ${tone(read.status)}`}>{STATUS_LABEL[read.status]}</span>
      </div>
      <p className="jd-oneliner">{driver.oneLiner}</p>
      {driver.key === "reactive" ? (
        <>
          <p className="jd-big">
            {now.reactiveContacts}
            <span>of ~{CONTACTS_PLAN} contacts this week</span>
          </p>
          <p className="jd-raw">
            Retest score {read.score ?? "—"}/100 · {valueText(driver, read.value)} · {tested}
          </p>
        </>
      ) : (
        <>
          <p className="jd-big">
            {read.score ?? "—"}
            <span>/ 100</span>
          </p>
          <p className="jd-raw">
            {valueText(driver, read.value)}
            {driver.retest ? ` · ${tested}` : ""}
          </p>
        </>
      )}
      <p className="jd-goal">
        Goal by Jan 30: <b>{goalText(driver)}</b> ·{" "}
        <span className={read.track === "behind" ? "down" : read.track === "no reading" ? "flat" : "up"}>
          {trackLabel}
        </span>
        {read.track === "on pace" || read.track === "behind" ? (
          <span className="jd-pace">
            {" "}
            · should be {fmt(read.expected, driver.digits)} by now; needs {read.pace != null && read.pace > 0 ? "+" : ""}
            {fmt(read.pace, driver.digits + 1)} a week
          </span>
        ) : null}
      </p>
      <Spark weeks={weeks} driver={driver} />
      {todo ? (
        <div className="jd-todo">
          <h4>What to do</h4>
          <p>{todo}</p>
        </div>
      ) : null}
    </article>
  );
}

function CompositeChart({ weeks }: { weeks: DriverWeek[] }) {
  const data = weeks.map((week) => ({ weekStart: week.weekStart, composite: week.composite, measured: week.measured }));
  return (
    <Frame height={220}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickFormatter={formatShort}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <Tip
                  title={`Week of ${formatShort(String(payload[0].payload.weekStart))}`}
                  lines={[
                    `Composite ${payload[0].payload.composite ?? "—"}`,
                    `${payload[0].payload.measured} of 5 drivers counted`,
                  ]}
                />
              ) : null
            }
          />
          <Line type="linear" dataKey="composite" stroke={LIME} strokeWidth={2.4} dot={false} connectNulls isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Frame>
  );
}

function TouchRetests({ weeks }: { weeks: DriverWeek[] }) {
  const seen = new Set<string>();
  const tests = weeks.flatMap((week) => {
    if (week.approachTouchIn == null || !week.approachTestDate || seen.has(week.approachTestDate)) return [];
    seen.add(week.approachTestDate);
    return [{ date: week.approachTestDate, touch: week.approachTouchIn }];
  });
  if (tests.length === 0) {
    return <p className="jd-none">No touch tested yet. The first reading comes from the W4 retest on Tue Dec 1.</p>;
  }
  const low = Math.min(...tests.map((test) => test.touch), TOUCH_TARGET_IN) - 4;
  return (
    <Frame height={180}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={tests} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatShort} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[Math.floor(low), TOUCH_TARGET_IN + 2]} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
          <ReferenceLine y={TOUCH_TARGET_IN} stroke={BLUE} strokeDasharray="4 4" label={{ value: "Dunk 127", fill: BLUE, fontSize: 11, position: "insideTopLeft" }} />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <Tip title={formatShort(String(payload[0].payload.date))} lines={[`Approach touch ${payload[0].payload.touch} in`]} />
              ) : null
            }
          />
          <Line type="linear" dataKey="touch" stroke={PAPER} strokeWidth={2} dot={{ r: 3, fill: PAPER }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </Frame>
  );
}

/** Jump Drivers: the qualities the dunk plan trains, a composite, and what to change next week. */
export function JumpDrivers({ view }: { view: DriversView }) {
  const now = view.now;
  if (!now) return null;
  const limiter = DRIVERS.find((driver) => driver.key === now.limiter);
  const change = now.compositeChange;
  return (
    <section className="jd" aria-labelledby="jd-title">
      <div className="card jd-hero">
        <div>
          <p className="eyebrow" id="jd-title">
            Jump Drivers · dunk Jan 30
          </p>
          <p className="figure">
            {now.composite ?? "—"}
            <span>/ 100 composite</span>
          </p>
          <p className="sub">
            {change == null ? "—" : `${change > 0 ? "+" : ""}${change}`} vs 4 weeks ago · {now.measured} of 5 drivers
            measured · week of {formatShort(now.weekStart)}
          </p>
          {limiter ? (
            <p className="jd-limiter">
              Limiter: <b>{limiter.name}</b>. Give it the most attention this week.
            </p>
          ) : null}
        </div>
        <CompositeChart weeks={view.weeks} />
      </div>

      <div className="jd-grid">
        {DRIVERS.map((driver) => (
          <DriverCard key={driver.key} driver={driver} now={now} weeks={view.weeks} isLimiter={driver.key === now.limiter} />
        ))}
      </div>

      <div className="card">
        <div className="section-head">
          <div>
            <h2>Is your jump going up?</h2>
            <p>
              The drivers are what you train; touch is the result. If the composite rises but touch doesn&apos;t
              across retests, the score is measuring the wrong things.
            </p>
          </div>
        </div>
        <dl className="stats jd-check">
          <div>
            <dt>Approach touch, last retest</dt>
            <dd>{now.approachTouchIn != null ? `${now.approachTouchIn} in` : "—"}</dd>
            <dd className="jd-small">goal {TOUCH_TARGET_IN} in (10&apos;7&quot;)</dd>
          </div>
          <div>
            <dt>Ball ladder</dt>
            <dd>rung {now.ladderRung ?? "—"}</dd>
            <dd className="jd-small">goal rung 4, the volleyball</dd>
          </div>
          <div>
            <dt>Jump sessions this week</dt>
            <dd>{now.jumpSessions} of 2</dd>
            <dd className="jd-small">J1 + J2</dd>
          </div>
        </dl>
        <TouchRetests weeks={view.weeks} />
      </div>

      <div className="card">
        <div className="section-head">
          <div>
            <h2>Week by week</h2>
            <p>The numbers behind each score, newest week first. Retest values carry forward.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Week of</th>
                <th>Composite</th>
                <th>Contacts</th>
                <th>DJ gap (in)</th>
                <th>Clean ÷ squat</th>
                <th>Approach gap (in)</th>
                <th>Squat × BW</th>
                <th>BW (lb)</th>
                <th>Jump sessions</th>
              </tr>
            </thead>
            <tbody>
              {[...view.weeks].reverse().map((week) => (
                <tr key={week.weekStart}>
                  <th scope="row">{formatShort(week.weekStart)}</th>
                  <td>{week.composite ?? "—"}</td>
                  <td>{week.reactiveContacts}</td>
                  <td>{fmt(week.values.reactive, 1)}</td>
                  <td>{fmt(week.values.explosive, 2)}</td>
                  <td>{fmt(week.values.approach, 1)}</td>
                  <td>{fmt(week.values.strength, 2)}</td>
                  <td>{fmt(week.values.bodyweight, 1)}</td>
                  <td>{week.jumpSessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="jd-more">
          <summary>How to use this each Sunday</summary>
          <ol>
            <li>Look at the limiter: it gets the most attention next week.</li>
            <li>Read each card&apos;s status and do what its &quot;What to do&quot; says.</li>
            <li>Reactive: check the week&apos;s contacts reached about {CONTACTS_PLAN}. Log reps for depth jumps, pogos and hops so they count.</li>
            <li>At the W4 and W8 retests, log the wall test: standing touch, depth-jump touch off 18&quot;, approach touch.</li>
          </ol>
        </details>
        <details className="jd-more">
          <summary>How each driver is scored</summary>
          <p>
            Each driver is scaled 0–100 between its floor and its Jan 30 goal. The composite is the weighted geometric
            mean of the drivers with a reading (each score floored at 5), so one weak driver pulls it down. Status
            compares the score with 3 weeks earlier (±3 points); retest drivers compare with the previous retest.
            Goal pace is a straight line from the first reading since Nov 8 to the goal. Lifts use the best set in the
            last 6 weeks, else the last 12.
          </p>
        </details>
      </div>
    </section>
  );
}
