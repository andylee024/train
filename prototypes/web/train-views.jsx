import { useState } from "react";
import { ChevronRight, ChevronDown, Dumbbell, Target, Flame, Clock, ArrowUp, TrendingUp, Calendar, Award, AlertTriangle, CheckCircle, XCircle, ChevronLeft, Zap, Activity } from "lucide-react";

// ─── SAMPLE DATA (based on Andy's real athlete profile) ────────────────────

const ARC = {
  name: "Dunk by end of summer 2026",
  purpose: "Dunk a volleyball by September 2026. Build the vertical, the strength base, and the body comp to make it inevitable.",
  start: "2026-04-28",
  end: "2026-09-06",
  duration: 18,
  currentWeek: 5,
  goals: [
    { name: "Sky Reach", type: "Vertical", metric: "Approach touch", current: "Rim grab", target: "10\" above rim", cost: 3, status: "active", color: "#3b82f6", icon: "↑" },
    { name: "Iron Ratio", type: "Strength", metric: "Back squat / BW ratio", current: "1.93× (370lb @ 192)", target: "2.2× (405lb @ 184)", cost: 3, status: "active", color: "#f59e0b", icon: "◆" },
    { name: "Iron Habit", type: "Body Comp", metric: "7-day avg bodyweight", current: "192 lb", target: "182-185 lb at ≤12% BF", cost: 2, status: "active", color: "#22c55e", icon: "●" },
  ],
  budget: { total: 10, used: 8, remaining: 2 },
  blocks: [
    { name: "Reset + Base", weeks: "1-3", serves: ["Iron Habit", "Iron Ratio"], status: "completed" },
    { name: "Strength + Power Build", weeks: "4-8", serves: ["Sky Reach", "Iron Ratio"], status: "active" },
    { name: "Power Conversion", weeks: "9-12", serves: ["Sky Reach", "Iron Ratio"], status: "planned" },
    { name: "Realization", weeks: "13-16", serves: ["Sky Reach"], status: "planned" },
    { name: "Consolidation", weeks: "17-18", serves: ["Sky Reach", "Iron Habit"], status: "planned" },
  ],
  priority: [
    { rank: 1, domain: "Vertical / Power", rule: "Never skip jump day" },
    { rank: 2, domain: "Lower Strength", rule: "Squat is non-negotiable — reduce volume before dropping" },
    { rank: 3, domain: "Cut", rule: "Slow the deficit before losing strength" },
  ],
  team: ["Head Coach", "Strength Coach", "Sport Coach", "Olympic Lifting Coach", "Mobility Coach", "Nutritionist"],
};

const BLOCK = {
  name: "Strength + Power Build",
  number: 2,
  totalBlocks: 5,
  weeks: "4-8",
  currentBlockWeek: 2,
  serves: ["Sky Reach", "Iron Ratio"],
  purpose: "Build the squat base and introduce power work. Get back squat to 4×4 @ 80% and start approach jump training with full effort.",
  athleteState: {
    date: "2026-05-19",
    bodyweight: "189 lb",
    bodyFat: "~14%",
    workingMaxes: [
      { exercise: "Back Squat", value: "370 lb (168 kg)", source: "logged", date: "2026-05-16" },
      { exercise: "Front Squat", value: "275 lb (125 kg)", source: "estimated", date: "2026-05-19" },
      { exercise: "Power Clean", value: "185 lb (84 kg)", source: "logged", date: "2026-05-14" },
      { exercise: "Bench Press", value: "225 lb (102 kg)", source: "logged", date: "2026-05-15" },
    ],
    jumpMetrics: "Approach touch: rim grab + 2\"",
    injuries: ["Right shoulder — manageable, avoid heavy OH pressing", "Left wrist (De Quervain's) — wraps on, modified front rack"],
  },
  miniGoals: [
    { description: "Back squat 4×4 @ 80% (296 lb) clean", serves: "Iron Ratio", done: false },
    { description: "10 max-effort approach jumps per session, 2×/week", serves: "Sky Reach", done: false },
    { description: "BW ≤ 187 lb 7-day avg", serves: "Iron Habit", done: true },
  ],
  sessionTypes: [
    { name: "Oly + Strength", focus: "Power clean → squat → accessories → mobility", duration: "~75 min" },
    { name: "Plyo + Strength", focus: "Depth jumps → squat → pull → mobility", duration: "~70 min" },
    { name: "Jump Day", focus: "Approach jumps → sprint work → mobility", duration: "~60 min" },
  ],
  philosophy: {
    squat: "4×4 at 76-80%. Building absolute strength while in a mild deficit. Moderate volume (16 total reps) keeps fatigue manageable. Progress by adding 2-5 lb/week.",
    olympic: "Power clean 3×3 at 70-75%. Skill maintenance + power stimulus. Speed emphasis — if the bar slows, drop weight. Not chasing 1RM this block.",
    jump: "2 jump sessions/week. Session 1: approach jumps (max effort, 8-10 reps). Session 2: depth jumps + reactive work (submax, 15-20 contacts). Volume stays low — quality over quantity.",
    upper: "Maintenance only. Bench 3×5 at 72%, chin-ups 3×8 BW+25lb. Enough to not lose it, not enough to fatigue for lower body days.",
    flexibility: "15 min daily. Hip flexor + adductor focus (side split path). Embedded at end of every session. OH snatch hold 3×15s at 30kg.",
    nutrition: "~2,300 cal/day, ≥200g protein. ~300 cal deficit. Slow cut — if squat stalls, bump to maintenance for 1 week.",
  },
  weeklyProgression: [
    { week: 4, type: "build", squat: "4×4 @ 76%", olympic: "3×3 @ 70%", jumps: "6 approach + 12 depth", bw: "189" },
    { week: 5, type: "build", squat: "4×4 @ 78%", olympic: "3×3 @ 72%", jumps: "8 approach + 15 depth", bw: "188" },
    { week: 6, type: "intensify", squat: "4×4 @ 80%", olympic: "3×3 @ 75%", jumps: "10 approach + 15 depth", bw: "187" },
    { week: 7, type: "intensify", squat: "4×3 @ 82%", olympic: "3×2 @ 78%", jumps: "10 approach + 12 depth", bw: "187" },
    { week: 8, type: "deload", squat: "3×3 @ 70%", olympic: "3×2 @ 65%", jumps: "5 approach only", bw: "186" },
  ],
  exitTests: [
    { description: "Back squat 4×4 @ 80% (296 lb)", serves: "Iron Ratio", pass: "All reps clean, RPE ≤ 8" },
    { description: "10 max-effort approach jumps at ≥ rim+4\"", serves: "Sky Reach", pass: "8/10 reach target height" },
    { description: "7-day avg BW ≤ 187 lb", serves: "Iron Habit", pass: "Weekly average, not single day" },
  ],
};

const WEEK = {
  number: 5,
  blockName: "Strength + Power Build",
  blockWeek: 2,
  totalBlockWeeks: 5,
  type: "build",
  focus: "Push squat intensity to 78%, introduce max-effort approach jumps",
  miniGoals: [
    { description: "Hit 4×4 @ 78% back squat (289 lb)", serves: "Iron Ratio" },
    { description: "8 approach jumps at max effort", serves: "Sky Reach" },
    { description: "Hit protein target ≥200g 6/7 days", serves: "Iron Habit" },
  ],
  nutrition: { calories: "~2,300", protein: "≥200g", cutStatus: "−300 cal deficit", bwTarget: "188 lb" },
};

const DAYS = [
  {
    number: 1, dayOfWeek: "Monday", sessionType: "Oly + Strength", focus: "Power clean + squat",
    time: "~75 min", rpe: "7",
    exercises: [
      { order: 1, name: "Power Clean", prescription: "3×3 @ 72% (133 lb)", goal: "Sky Reach", goalColor: "#3b82f6", pr: "3×3 @ 70% (130 lb) — May 19", rest: "2 min", note: "Catch high, fast elbows. Wrist wraps on." },
      { order: 2, name: "Back Squat", prescription: "4×4 @ 78% (289 lb)", goal: "Iron Ratio", goalColor: "#f59e0b", pr: "4×4 @ 76% (281 lb) — May 19", rest: "3 min", note: "Belt on for working sets. Pause at bottom of first rep each set." },
      { order: 3, name: "Romanian Deadlift", prescription: "3×8 @ 185 lb", goal: "Iron Ratio", goalColor: "#f59e0b", pr: "3×8 @ 175 lb — May 12", rest: "90s", note: "Slow eccentric, hamstring stretch at bottom." },
      { order: 4, name: "Weighted Chin-up", prescription: "3×6 @ BW+25 lb", goal: null, goalColor: null, pr: "3×6 @ BW+20 lb — May 19", rest: "90s", note: "Full ROM. Dead hang at bottom." },
      { order: 5, name: "Hip Flexor Stretch + Adductor Work", prescription: "3×60s each side", goal: null, goalColor: null, pr: null, rest: null, note: "Side split path. Contract-relax method." },
    ],
  },
  {
    number: 2, dayOfWeek: "Tuesday", sessionType: "Jump Day", focus: "Approach jumps + sprint",
    time: "~60 min", rpe: "9 (max effort jumps)",
    exercises: [
      { order: 1, name: "Approach Jump (max effort)", prescription: "8 jumps, full rest between", goal: "Sky Reach", goalColor: "#3b82f6", pr: "Best touch: rim + 3\" — May 20", rest: "90s", note: "Full approach. Reach for target. Stop if quality drops." },
      { order: 2, name: "Sprint Work", prescription: "4×30m from standing start", goal: "Sky Reach", goalColor: "#3b82f6", pr: null, rest: "2 min", note: "Flat shoes. Drive phase focus." },
      { order: 3, name: "Single-leg Box Jump", prescription: "3×4 each leg", goal: "Sky Reach", goalColor: "#3b82f6", pr: null, rest: "60s", note: "24\" box. Stick the landing 2s." },
      { order: 4, name: "Ankle Mobility + Calf Stretch", prescription: "3×45s each side", goal: null, goalColor: null, pr: null, rest: null, note: null },
    ],
  },
  {
    number: 3, dayOfWeek: "Wednesday", sessionType: null, focus: "Active recovery",
    time: null, rpe: null, isRest: true,
    exercises: [
      { order: 1, name: "Light Stretching / Walk", prescription: "20-30 min", goal: null, goalColor: null, pr: null, rest: null, note: "Easy movement. Side split work if feeling good." },
    ],
  },
  {
    number: 4, dayOfWeek: "Thursday", sessionType: "Plyo + Strength", focus: "Depth jumps + squat + pull",
    time: "~70 min", rpe: "7-8",
    exercises: [
      { order: 1, name: "Depth Jump", prescription: "5×3 from 18\" box", goal: "Sky Reach", goalColor: "#3b82f6", pr: "5×3 from 16\" box — May 15", rest: "90s", note: "Minimize ground contact time. Reactive, not muscular." },
      { order: 2, name: "Front Squat", prescription: "3×4 @ 75% (206 lb)", goal: "Iron Ratio", goalColor: "#f59e0b", pr: "3×4 @ 72% (198 lb) — May 15", rest: "2.5 min", note: "Wrist wraps. Modified grip if wrist flares." },
      { order: 3, name: "Bench Press", prescription: "3×5 @ 72% (162 lb)", goal: null, goalColor: null, pr: "3×5 @ 70% (158 lb) — May 15", rest: "2 min", note: "Shoulder check — if pain > 3/10, swap for floor press." },
      { order: 4, name: "Barbell Row", prescription: "3×8 @ 155 lb", goal: null, goalColor: null, pr: "3×8 @ 145 lb — May 15", rest: "90s", note: null },
      { order: 5, name: "OH Snatch Hold", prescription: "3×15s @ 30 kg", goal: null, goalColor: null, pr: null, rest: "60s", note: "Overhead stability. Active shoulders." },
      { order: 6, name: "Hip Flexor + Adductor Stretch", prescription: "3×60s each side", goal: null, goalColor: null, pr: null, rest: null, note: "Side split path." },
    ],
  },
  {
    number: 5, dayOfWeek: "Friday", sessionType: "Oly + Strength", focus: "Clean pulls + squat variation",
    time: "~65 min", rpe: "6-7", optional: true,
    exercises: [
      { order: 1, name: "Clean Pull", prescription: "4×3 @ 80% of clean (148 lb)", goal: "Sky Reach", goalColor: "#3b82f6", pr: "4×3 @ 75% (139 lb) — May 16", rest: "2 min", note: "Triple extension focus. Speed off the floor." },
      { order: 2, name: "Pause Back Squat", prescription: "3×3 @ 72% (266 lb)", goal: "Iron Ratio", goalColor: "#f59e0b", pr: "3×3 @ 70% (259 lb) — May 16", rest: "3 min", note: "3s pause at bottom. Build out of the hole." },
      { order: 3, name: "DB Shoulder Press", prescription: "3×10 @ 40 lb", goal: null, goalColor: null, pr: "3×10 @ 35 lb — May 16", rest: "60s", note: "Light. Shoulder prehab, not strength. Stop if pain." },
      { order: 4, name: "Side Split Stretch", prescription: "5 min progressive", goal: null, goalColor: null, pr: null, rest: null, note: "Contract-relax. Track hip-to-floor distance." },
    ],
  },
  {
    number: 6, dayOfWeek: "Saturday", sessionType: null, focus: "Basketball / active",
    time: null, rpe: null, isRest: true,
    exercises: [{ order: 1, name: "Pickup Basketball or Skills", prescription: "60-90 min", goal: null, goalColor: null, pr: null, rest: null, note: "Maintenance. Don't overdo it before Monday." }],
  },
  {
    number: 7, dayOfWeek: "Sunday", sessionType: null, focus: "Rest + review + meal prep",
    time: null, rpe: null, isRest: true,
    exercises: [{ order: 1, name: "Rest Day", prescription: "Full rest", goal: null, goalColor: null, pr: null, rest: null, note: "Review the week. Meal prep. Sleep." }],
  },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

const goalDot = (color) => (
  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", backgroundColor: color, marginRight: 6 }} />
);

const Badge = ({ children, color = "#6b7280", bg = "#f3f4f6" }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, backgroundColor: bg, color, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const typeBadge = (type) => {
  const map = { build: ["#2563eb","#dbeafe"], intensify: ["#d97706","#fef3c7"], deload: ["#16a34a","#dcfce7"], test: ["#dc2626","#fee2e2"] };
  const [c, bg] = map[type] || ["#6b7280","#f3f4f6"];
  return <Badge color={c} bg={bg}>{type}</Badge>;
};

const Card = ({ children, style, onClick, ...props }) => (
  <div style={{ background: "var(--vz-box-bg, #ffffff)", border: "1px solid var(--vz-stroke, #e5e7eb)", borderRadius: 10, padding: 16, ...style }} onClick={onClick} {...props}>
    {children}
  </div>
);

const SectionHeader = ({ children, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--vz-text, #1f2937)" }}>{children}</h3>
    {right}
  </div>
);

// ─── TODAY VIEW ─────────────────────────────────────────────────────────────

function TodayView({ day, onBack }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }));

  if (!day) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--vz-text-secondary, #6b7280)" }}><ChevronLeft size={18} /></button>}
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>
          {day.dayOfWeek}
        </h2>
        {day.optional && <Badge color="#6b7280" bg="#f3f4f6">Optional</Badge>}
      </div>

      <div style={{ fontSize: 13, color: "var(--vz-text-secondary, #6b7280)", marginBottom: 16, marginLeft: onBack ? 30 : 0 }}>
        {day.sessionType && <span style={{ fontWeight: 600 }}>{day.sessionType}</span>}
        {day.sessionType && " — "}{day.focus}
        {day.time && <span> · {day.time}</span>}
        {day.rpe && <span> · RPE {day.rpe}</span>}
      </div>

      {day.isRest ? (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🧘</div>
          <div style={{ fontSize: 14, color: "var(--vz-text-secondary, #6b7280)" }}>{day.exercises[0]?.note || "Rest day"}</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {day.exercises.map((ex, i) => (
            <Card key={i} style={{ cursor: "pointer", transition: "border-color 0.15s", borderLeft: ex.goalColor ? `3px solid ${ex.goalColor}` : undefined }} onClick={() => toggle(i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: "var(--vz-text-secondary, #9ca3af)", fontWeight: 600, minWidth: 18 }}>{ex.order}.</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--vz-text, #1f2937)" }}>{ex.name}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--vz-text, #374151)", marginLeft: 24 }}>
                    {ex.prescription}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {ex.goal && <Badge color={ex.goalColor} bg={ex.goalColor + "1a"}>{ex.goal}</Badge>}
                  {expanded[i] ? <ChevronDown size={14} color="var(--vz-text-secondary, #9ca3af)" /> : <ChevronRight size={14} color="var(--vz-text-secondary, #9ca3af)" />}
                </div>
              </div>

              {expanded[i] && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--vz-stroke, #f3f4f6)", marginLeft: 24, fontSize: 12 }}>
                  {ex.pr && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "var(--vz-text, #374151)" }}>
                      <TrendingUp size={13} color="#f59e0b" />
                      <span style={{ fontWeight: 600 }}>PR to beat:</span> {ex.pr}
                    </div>
                  )}
                  {ex.rest && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: "var(--vz-text-secondary, #6b7280)" }}>
                      <Clock size={13} />
                      <span>Rest: {ex.rest}</span>
                    </div>
                  )}
                  {ex.note && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--vz-text-secondary, #6b7280)" }}>
                      <AlertTriangle size={13} color="#f59e0b" />
                      <span>{ex.note}</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!day.isRest && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--vz-green-bg, #f0fdf4)", borderRadius: 8, border: "1px solid var(--vz-green, #bbf7d0)", fontSize: 12, color: "var(--vz-text, #374151)" }}>
          <span style={{ fontWeight: 600 }}>Nutrition:</span> {WEEK.nutrition.calories} · Protein {WEEK.nutrition.protein} · {WEEK.nutrition.cutStatus}
        </div>
      )}
    </div>
  );
}

// ─── WEEK VIEW ──────────────────────────────────────────────────────────────

function WeekView({ onDayClick }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>Week {WEEK.number}</h2>
        {typeBadge(WEEK.type)}
      </div>
      <div style={{ fontSize: 13, color: "var(--vz-text-secondary, #6b7280)", marginBottom: 16 }}>
        {WEEK.blockName} — Week {WEEK.blockWeek} of {WEEK.totalBlockWeeks} · {WEEK.focus}
      </div>

      {/* Mini-goals */}
      <SectionHeader>Mini-goals</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {WEEK.miniGoals.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--vz-text, #374151)" }}>
            <Target size={14} color={ARC.goals.find(a => a.name === g.serves)?.color || "#6b7280"} />
            <span>{g.description}</span>
            <Badge color={ARC.goals.find(a => a.name === g.serves)?.color || "#6b7280"} bg={(ARC.goals.find(a => a.name === g.serves)?.color || "#6b7280") + "1a"}>{g.serves}</Badge>
          </div>
        ))}
      </div>

      {/* Nutrition */}
      <SectionHeader>Nutrition</SectionHeader>
      <Card style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #9ca3af)", marginBottom: 2 }}>Calories</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>{WEEK.nutrition.calories}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #9ca3af)", marginBottom: 2 }}>Protein</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>{WEEK.nutrition.protein}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #9ca3af)", marginBottom: 2 }}>Deficit</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>{WEEK.nutrition.cutStatus}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #9ca3af)", marginBottom: 2 }}>BW Target</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>{WEEK.nutrition.bwTarget}</div>
        </div>
      </Card>

      {/* Days */}
      <SectionHeader>Days</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {DAYS.map((d, i) => {
          const goalColors = [...new Set(d.exercises.filter(e => e.goalColor).map(e => e.goalColor))];
          return (
            <Card key={i} onClick={() => onDayClick(d)} style={{ cursor: "pointer", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--vz-text-secondary, #9ca3af)", minWidth: 28 }}>{d.dayOfWeek.slice(0, 3)}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--vz-text, #1f2937)" }}>{d.focus}</div>
                    <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #9ca3af)" }}>
                      {d.isRest ? "Recovery" : `${d.exercises.length} exercises`}
                      {d.sessionType && ` · ${d.sessionType}`}
                      {d.time && ` · ${d.time}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {goalColors.map((c, j) => <span key={j}>{goalDot(c)}</span>)}
                  {d.optional && <Badge>Optional</Badge>}
                  <ChevronRight size={14} color="var(--vz-text-secondary, #9ca3af)" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── BLOCK VIEW ─────────────────────────────────────────────────────────────

function BlockView() {
  const [showPhilosophy, setShowPhilosophy] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>Block {BLOCK.number}: {BLOCK.name}</h2>
      </div>
      <div style={{ fontSize: 13, color: "var(--vz-text-secondary, #6b7280)", marginBottom: 16 }}>
        Weeks {BLOCK.weeks} · Block {BLOCK.number} of {BLOCK.totalBlocks} · Week {BLOCK.currentBlockWeek} of {BLOCK.weeklyProgression.length}
      </div>

      {/* Purpose */}
      <Card style={{ marginBottom: 16, borderLeft: "3px solid var(--vz-accent, #3b82f6)" }}>
        <div style={{ fontSize: 13, color: "var(--vz-text, #374151)", lineHeight: 1.5 }}>{BLOCK.purpose}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          {BLOCK.serves.map((s, i) => {
            const g = ARC.goals.find(g => g.name === s);
            return g ? <Badge key={i} color={g.color} bg={g.color + "1a"}>{g.name}</Badge> : null;
          })}
        </div>
      </Card>

      {/* Mini-goals */}
      <SectionHeader>Mini-goals</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {BLOCK.miniGoals.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            {g.done ? <CheckCircle size={16} color="#22c55e" /> : <XCircle size={16} color="var(--vz-stroke, #d1d5db)" />}
            <span style={{ color: "var(--vz-text, #374151)", flex: 1 }}>{g.description}</span>
            <Badge color={ARC.goals.find(a => a.name === g.serves)?.color || "#6b7280"} bg={(ARC.goals.find(a => a.name === g.serves)?.color || "#6b7280") + "1a"}>{g.serves}</Badge>
          </div>
        ))}
      </div>

      {/* Athlete State */}
      <SectionHeader>Athlete State <span style={{ fontSize: 11, fontWeight: 400, color: "var(--vz-text-secondary, #9ca3af)" }}>({BLOCK.athleteState.date})</span></SectionHeader>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--vz-text-secondary, #6b7280)" }}>BW: <span style={{ fontWeight: 600, color: "var(--vz-text, #1f2937)" }}>{BLOCK.athleteState.bodyweight}</span></div>
          <div style={{ fontSize: 12, color: "var(--vz-text-secondary, #6b7280)" }}>BF: <span style={{ fontWeight: 600, color: "var(--vz-text, #1f2937)" }}>{BLOCK.athleteState.bodyFat}</span></div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--vz-text-secondary, #6b7280)", marginBottom: 6 }}>Working Maxes</div>
        {BLOCK.athleteState.workingMaxes.map((wm, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--vz-text, #374151)", padding: "3px 0" }}>
            <span>{wm.exercise}</span>
            <span style={{ fontWeight: 600 }}>{wm.value} <span style={{ fontSize: 10, color: wm.source === "logged" ? "#22c55e" : "#f59e0b" }}>({wm.source})</span></span>
          </div>
        ))}
        {BLOCK.athleteState.injuries.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--vz-stroke, #f3f4f6)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--vz-text-secondary, #6b7280)", marginBottom: 4 }}>Injuries</div>
            {BLOCK.athleteState.injuries.map((inj, i) => (
              <div key={i} style={{ fontSize: 12, color: "#d97706", display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <AlertTriangle size={12} /> {inj}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Programming Philosophy */}
      <SectionHeader right={
        <button onClick={() => setShowPhilosophy(!showPhilosophy)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--vz-accent, #3b82f6)", fontWeight: 600 }}>
          {showPhilosophy ? "Hide" : "Show"} details
        </button>
      }>Programming Philosophy</SectionHeader>

      {showPhilosophy && (
        <Card style={{ marginBottom: 20, fontSize: 12, lineHeight: 1.6, color: "var(--vz-text, #374151)" }}>
          {Object.entries(BLOCK.philosophy).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: "var(--vz-text, #1f2937)", textTransform: "capitalize", marginBottom: 2 }}>{key.replace(/_/g, " ")}</div>
              <div>{val}</div>
            </div>
          ))}
        </Card>
      )}

      {/* Weekly Progression */}
      <SectionHeader>Weekly Progression</SectionHeader>
      <Card style={{ marginBottom: 20, overflow: "auto" }}>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--vz-stroke, #e5e7eb)" }}>
              {["Wk", "Type", "Squat", "Olympic", "Jumps", "BW"].map(h => (
                <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--vz-text-secondary, #9ca3af)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOCK.weeklyProgression.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--vz-stroke, #f3f4f6)", background: row.week === ARC.currentWeek + ARC.blocks[0].weeks.split("-").map(Number)[0] - 1 ? "var(--vz-accent-bg, #eff6ff)" : undefined }}>
                <td style={{ padding: "6px 8px", fontWeight: 600 }}>{row.week}</td>
                <td style={{ padding: "6px 8px" }}>{typeBadge(row.type)}</td>
                <td style={{ padding: "6px 8px" }}>{row.squat}</td>
                <td style={{ padding: "6px 8px" }}>{row.olympic}</td>
                <td style={{ padding: "6px 8px" }}>{row.jumps}</td>
                <td style={{ padding: "6px 8px" }}>{row.bw}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Exit Tests */}
      <SectionHeader>Exit Tests <span style={{ fontSize: 11, fontWeight: 400, color: "var(--vz-text-secondary, #9ca3af)" }}>(end of block)</span></SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {BLOCK.exitTests.map((t, i) => (
          <Card key={i} style={{ padding: "10px 14px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--vz-text, #1f2937)", marginBottom: 3 }}>{t.description}</div>
            <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #6b7280)" }}>
              Pass: {t.pass} · Serves: <span style={{ color: ARC.goals.find(g => g.name === t.serves)?.color }}>{t.serves}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── ARC VIEW ───────────────────────────────────────────────────────────────

function ArcView() {
  const pct = Math.round((ARC.currentWeek / ARC.duration) * 100);

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>{ARC.name}</h2>
      <div style={{ fontSize: 13, color: "var(--vz-text-secondary, #6b7280)", marginBottom: 16 }}>
        {ARC.start} → {ARC.end} · {ARC.duration} weeks · Week {ARC.currentWeek}
      </div>

      {/* Purpose */}
      <Card style={{ marginBottom: 16, borderLeft: "3px solid var(--vz-accent, #3b82f6)" }}>
        <div style={{ fontSize: 13, color: "var(--vz-text, #374151)", lineHeight: 1.5 }}>{ARC.purpose}</div>
      </Card>

      {/* Progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--vz-text-secondary, #6b7280)", marginBottom: 4 }}>
          <span>Week {ARC.currentWeek} of {ARC.duration}</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "var(--vz-stroke, #e5e7eb)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--vz-accent, #3b82f6)", borderRadius: 3, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Goals */}
      <SectionHeader>Goals <span style={{ fontSize: 11, fontWeight: 400, color: "var(--vz-text-secondary, #9ca3af)" }}>({ARC.budget.used}/{ARC.budget.total} slots used)</span></SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {ARC.goals.map((g, i) => (
          <Card key={i} style={{ borderLeft: `3px solid ${g.color}`, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{g.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--vz-text, #1f2937)" }}>{g.name}</span>
                <Badge color={g.color} bg={g.color + "1a"}>{g.type}</Badge>
              </div>
              <span style={{ fontSize: 11, color: "var(--vz-text-secondary, #9ca3af)" }}>{g.cost} slots</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--vz-text-secondary, #6b7280)" }}>
              {g.metric}: <span style={{ color: "var(--vz-text, #374151)" }}>{g.current}</span> → <span style={{ fontWeight: 600, color: g.color }}>{g.target}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Blocks Timeline */}
      <SectionHeader>Blocks</SectionHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {ARC.blocks.map((b, i) => {
          const statusColors = { completed: "#22c55e", active: "#3b82f6", planned: "#d1d5db" };
          const statusBg = { completed: "#f0fdf4", active: "#eff6ff", planned: "#f9fafb" };
          return (
            <Card key={i} style={{ padding: "10px 14px", background: statusBg[b.status], borderColor: statusColors[b.status] }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--vz-text, #1f2937)" }}>
                    Block {i + 1}: {b.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #6b7280)", marginTop: 2 }}>
                    Weeks {b.weeks} · Serves: {b.serves.join(", ")}
                  </div>
                </div>
                <Badge color={statusColors[b.status]} bg={statusColors[b.status] + "1a"}>{b.status}</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Priority Stack */}
      <SectionHeader>Priority Stack</SectionHeader>
      <Card style={{ marginBottom: 20 }}>
        {ARC.priority.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < ARC.priority.length - 1 ? "1px solid var(--vz-stroke, #f3f4f6)" : undefined }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--vz-accent, #3b82f6)", minWidth: 20, textAlign: "center" }}>{p.rank}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--vz-text, #1f2937)" }}>{p.domain}</div>
              <div style={{ fontSize: 11, color: "var(--vz-text-secondary, #6b7280)" }}>{p.rule}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Team */}
      <SectionHeader>Coaching Team</SectionHeader>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {ARC.team.map((t, i) => <Badge key={i}>{t}</Badge>)}
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function TrainApp() {
  const [view, setView] = useState("today");
  const [selectedDay, setSelectedDay] = useState(null);

  const today = DAYS[0]; // Monday

  const tabs = [
    { id: "today", label: "Today", icon: <Zap size={14} /> },
    { id: "week", label: "Week", icon: <Calendar size={14} /> },
    { id: "block", label: "Block", icon: <Activity size={14} /> },
    { id: "arc", label: "Arc", icon: <Target size={14} /> },
  ];

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--vz-box-bg, #f3f4f6)", borderRadius: 10, padding: 3 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setView(t.id); setSelectedDay(null); }}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer",
              fontSize: 13, fontWeight: view === t.id ? 700 : 500,
              background: view === t.id ? "var(--vz-accent, #3b82f6)" : "transparent",
              color: view === t.id ? "white" : "var(--vz-text-secondary, #6b7280)",
              transition: "all 0.15s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Views */}
      {view === "today" && !selectedDay && <TodayView day={today} />}
      {view === "today" && selectedDay && <TodayView day={selectedDay} onBack={() => setSelectedDay(null)} />}
      {view === "week" && !selectedDay && <WeekView onDayClick={(d) => { setSelectedDay(d); setView("today"); }} />}
      {view === "week" && selectedDay && <TodayView day={selectedDay} onBack={() => setSelectedDay(null)} />}
      {view === "block" && <BlockView />}
      {view === "arc" && <ArcView />}
    </div>
  );
}
