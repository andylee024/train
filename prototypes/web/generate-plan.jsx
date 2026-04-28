import { useState, useMemo, useCallback } from "react";
import * as XLSX from "sheetjs";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const COACHES = [
  {
    id: "head",
    name: "Head Coach",
    icon: "🧠",
    specialty: "Synthesizes all inputs, resolves conflicts, owns arc structure",
    always: true,
    description: "Makes the hard calls when goals compete. Cuts through complexity.",
  },
  {
    id: "strength",
    name: "Strength Coach",
    icon: "🏋️",
    specialty: "Squat, pull, press progressions",
    always: false,
    description:
      "Methodical. Simple programs run hard. Fixed menus, progressive overload, Dylan Shannon PR rotation.",
  },
  {
    id: "sport",
    name: "Sport Coach",
    icon: "⚡",
    specialty: "Jumps, sprints, dunk mechanics",
    always: false,
    description:
      "Explosive. Thinks in power output and rate of force development. Fewer reps, max intent.",
  },
  {
    id: "olympic",
    name: "Olympic Coach",
    icon: "🏅",
    specialty: "Clean, jerk, snatch programming",
    always: false,
    description:
      "Technical. Olympic lifts are highest-ROI for athletes. Patient with technique, sacrifices load for position.",
  },
  {
    id: "mobility",
    name: "Mobility Coach",
    icon: "🧘",
    specialty: "Flexibility, prehab, injury mods",
    always: false,
    description:
      "Persistent. Daily mobility is non-negotiable. Embedded in every session, never a separate day.",
  },
  {
    id: "nutrition",
    name: "Nutritionist",
    icon: "🥗",
    specialty: "Calories, macros, cut strategy",
    always: false,
    description:
      "Realistic. Sets protein floors not ceilings. Designs nutrition that supports training.",
  },
];

const GOALS = [
  {
    id: "sky-reach",
    name: "Sky Reach",
    coach: "sport",
    type: "Vertical",
    metric: "Approach touch height",
    example: "Rim grab → 10\" above rim",
    cost: 3,
    costDesc: "2 jump/plyo + 1 sprint session/wk",
    why: "The dunk goal. Turns strength into vertical through plyometrics, approach mechanics, and max-intent jumping.",
  },
  {
    id: "iron-ratio",
    name: "Iron Ratio",
    coach: "strength",
    type: "Strength",
    metric: "Back squat to bodyweight ratio",
    example: "BS 370 → 405 lb at lower BW",
    cost: 3,
    costDesc: "2 squat + 1 pull/press session/wk",
    why: "Squat strength is the engine for everything — jumping, sprinting, Olympic lifts. Push the foundation higher.",
  },
  {
    id: "press-authority",
    name: "Press Authority",
    coach: "strength",
    type: "Strength",
    metric: "Overhead or bench press",
    example: "OH Press 50 → 60 kg",
    cost: 2,
    costDesc: "2 pressing sessions/wk",
    why: "Balanced upper body strength. Modify for shoulder injuries — incline or floor press variations.",
  },
  {
    id: "pull-power",
    name: "Pull Power",
    coach: "strength",
    type: "Strength",
    metric: "Weighted chin-up or deadlift",
    example: "Chin-up 25 → 50 kg 5RM",
    cost: 2,
    costDesc: "2 pull sessions/wk",
    why: "Pull strength balances push strength and builds grip, lats, and posterior chain for athleticism.",
  },
  {
    id: "sprint-machine",
    name: "Sprint Machine",
    coach: "sport",
    type: "Sport",
    metric: "Sprint acceleration",
    example: "10m acceleration improvement",
    cost: 2,
    costDesc: "2 sprint sessions/wk",
    why: "Approach velocity drives jump height. Faster approach = higher dunk. Shares slots with jump training.",
  },
  {
    id: "fast-hips",
    name: "Fast Hips",
    coach: "olympic",
    type: "Olympic",
    metric: "Clean & Jerk",
    example: "C&J 100 → 120 kg",
    cost: 3,
    costDesc: "3 Olympic lifting sessions/wk",
    why: "Hip extension power transfers directly to jumping. Triple extension pattern is the athletic movement.",
  },
  {
    id: "clean-foundation",
    name: "Clean Foundation",
    coach: "olympic",
    type: "Olympic",
    metric: "Power clean",
    example: "Power Clean 80 → 100 kg",
    cost: 2,
    costDesc: "Olympic lift embedded in sessions",
    why: "Entry-level Olympic lifting exposure without dedicating full sessions. Embedded in strength days.",
  },
  {
    id: "snatch-position",
    name: "Snatch Position",
    coach: "olympic",
    type: "Olympic",
    metric: "Snatch or overhead squat",
    example: "Snatch 60 → 80 kg",
    cost: 2,
    costDesc: "2 snatch-focused sessions/wk",
    why: "Full Olympic development. Great for shoulder health and overhead position if no active shoulder injury.",
  },
  {
    id: "side-split",
    name: "Side Split",
    coach: "mobility",
    type: "Flexibility",
    metric: "Hip-to-floor distance",
    example: "140° → 170°",
    cost: 1,
    costDesc: "15 min daily embedded",
    why: "Hip mobility for deep squats, high kicks, and long-term athletic durability. Low cost, long timeline.",
  },
  {
    id: "overhead-freedom",
    name: "Overhead Freedom",
    coach: "mobility",
    type: "Mobility",
    metric: "Overhead position quality",
    example: "Full OH squat with barbell",
    cost: 1,
    costDesc: "Embedded mobility work",
    why: "Better overhead position for Olympic lifts and pressing. Complements snatch and press goals.",
  },
  {
    id: "bulletproof",
    name: "Bulletproof",
    coach: "mobility",
    type: "Prehab",
    metric: "Injury status improvement",
    example: "Pain-free pressing & front rack",
    cost: 0,
    costDesc: "Embedded in warm-ups",
    why: "Active injuries need active management. Modifications and prehab within existing sessions.",
  },
  {
    id: "lean-machine",
    name: "Lean Machine",
    coach: "nutrition",
    type: "Body Comp",
    metric: "Bodyweight / body fat",
    example: "192 → 182-185 lb, 15% → 11%",
    cost: 0,
    costDesc: "Nutrition changes, not training time",
    why: "Power-to-weight ratio for jumping. Controlled deficit during build phases, maintenance during intensity.",
  },
  {
    id: "fuel-right",
    name: "Fuel Right",
    coach: "nutrition",
    type: "Consistency",
    metric: "Nutrition tracking adherence",
    example: "Track 6 of 7 days/wk",
    cost: 0,
    costDesc: "Behavioral habit",
    why: "If nutrition is a known weak point, tracking is the first step. Low cost, high impact.",
  },
  {
    id: "iron-habit",
    name: "Iron Habit",
    coach: "head",
    type: "Consistency",
    metric: "Training adherence",
    example: "5 sessions/wk × 16 weeks",
    cost: 0,
    costDesc: "Meta-goal",
    why: "None of the other goals matter if you don't show up. The foundation everything else sits on.",
  },
];

const TYPE_COLORS = {
  Vertical: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  Strength: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  Olympic: { bg: "#F3E8FF", text: "#6B21A8", border: "#DDD6FE" },
  Sport: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  Flexibility: { bg: "#FFF1F2", text: "#9F1239", border: "#FECDD3" },
  Mobility: { bg: "#FFF1F2", text: "#9F1239", border: "#FECDD3" },
  Prehab: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  "Body Comp": { bg: "#FFF7ED", text: "#9A3412", border: "#FED7AA" },
  Consistency: { bg: "#F8FAFC", text: "#475569", border: "#CBD5E1" },
};

// ─── SPREADSHEET GENERATOR ─────────────────────────────────────────────────────

function generateWorkouts(profile, goals, coaches, numWeeks) {
  // Build blocks based on arc length
  const numBlocks = numWeeks <= 8 ? 3 : numWeeks <= 14 ? 4 : 5;
  const weeksPerBlock = Math.floor(numWeeks / numBlocks);
  const blocks = [];

  const hasGoal = (id) => goals.some((g) => g.id === id);
  const hasCoach = (id) => coaches.includes(id);

  // Session types based on selected coaches
  const sessionTypes = [];
  if (hasCoach("olympic"))
    sessionTypes.push({ name: "Oly + Strength", focus: "Power → Strength" });
  if (hasCoach("sport"))
    sessionTypes.push({ name: "Plyo + Strength", focus: "Explosive → Strength" });
  if (hasCoach("sport"))
    sessionTypes.push({ name: "Jump Day", focus: "Max-intent jumping" });
  if (sessionTypes.length === 0)
    sessionTypes.push(
      { name: "Strength A", focus: "Squat + Push" },
      { name: "Strength B", focus: "Pull + Accessories" }
    );

  const daysPerWeek = parseInt(profile.trainingDays) || 5;

  // Exercise library based on goals
  const exercises = {
    warmup: ["Band Pull-Aparts 2×15", "Hip Circles 2×10/side", "Cat-Cow 2×10"],
    squat: [
      { name: "Back Squat", schemes: ["4×4", "3×8", "5×3", "3×5", "4×6"] },
      { name: "Front Squat", schemes: ["3×5", "4×3", "3×6", "5×2"] },
      { name: "Pause Squat", schemes: ["3×3", "4×4", "3×5"] },
    ],
    olympic: [
      { name: "Power Clean", schemes: ["5×2", "4×3", "6×1", "3×3"] },
      { name: "Clean & Jerk", schemes: ["5×1+1", "4×2+1", "3×1+2"] },
      { name: "Clean Pull", schemes: ["4×3", "3×4", "5×2"] },
      { name: "Hang Clean", schemes: ["4×2", "3×3", "5×2"] },
    ],
    jump: [
      { name: "Approach Jumps", schemes: ["5×3", "4×3", "6×2"] },
      { name: "Depth Jumps", schemes: ["4×3", "3×4", "5×2"] },
      { name: "Box Jumps (max height)", schemes: ["5×2", "4×3", "3×3"] },
      { name: "Broad Jumps", schemes: ["4×3", "5×2"] },
    ],
    press: [
      { name: "Bench Press", schemes: ["4×5", "3×8", "5×3", "3×6"] },
      { name: "OH Press", schemes: ["4×5", "3×6", "5×3"] },
      { name: "Incline DB Press", schemes: ["3×10", "4×8", "3×12"] },
    ],
    pull: [
      { name: "Weighted Chin-up", schemes: ["4×5", "3×6", "5×3", "3×8"] },
      { name: "Barbell Row", schemes: ["4×6", "3×8", "3×10"] },
      { name: "Face Pulls", schemes: ["3×15", "4×12"] },
    ],
    mobility: [
      "Side Split Hold 3×45s",
      "Pigeon Stretch 2×60s/side",
      "Thoracic Rotations 2×10/side",
      "Hip 90/90 2×30s/side",
      "Banded Shoulder Distraction 2×30s/side",
    ],
    prehab: [
      "Band External Rotations 2×15/side",
      "Wrist CARs 2×10/direction",
      "Scapular Push-ups 2×12",
    ],
  };

  const blockPhases = ["Foundation", "Build", "Intensify", "Realize", "Consolidate"];
  const weekTypes = (bLen) => {
    if (bLen <= 3) return ["Build", "Intensify", "Deload"];
    if (bLen <= 4) return ["Build", "Build", "Intensify", "Deload"];
    return ["Build", "Build", "Intensify", "Intensify", "Deload"];
  };

  for (let b = 0; b < numBlocks; b++) {
    const startWeek = b * weeksPerBlock + 1;
    const endWeek = b === numBlocks - 1 ? numWeeks : (b + 1) * weeksPerBlock;
    const bLen = endWeek - startWeek + 1;
    const wTypes = weekTypes(bLen);

    const blockGoals = goals.filter((g) => {
      if (b === 0) return true; // block 1 serves all goals
      if (b < numBlocks - 1) return g.cost > 0 || g.cost === 0;
      return true;
    });

    const weeks = [];
    for (let w = 0; w < bLen; w++) {
      const wType = wTypes[Math.min(w, wTypes.length - 1)];
      const isDeload = wType === "Deload";
      const intensity = isDeload ? "60-65%" : w === 0 ? "72-76%" : w === 1 ? "76-80%" : "80-85%";

      const days = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const sType = sessionTypes[d % sessionTypes.length];
        const dayExercises = [];

        // Power movement first
        if (sType.name.includes("Oly") && hasCoach("olympic")) {
          const ex = exercises.olympic[b % exercises.olympic.length];
          const scheme = ex.schemes[(w + d) % ex.schemes.length];
          dayExercises.push(`${ex.name} ${isDeload ? "3×2 @ 60%" : `${scheme} @ ${intensity}`}`);
        } else if (sType.name.includes("Plyo") || sType.name.includes("Jump")) {
          const ex = exercises.jump[d % exercises.jump.length];
          const scheme = ex.schemes[w % ex.schemes.length];
          dayExercises.push(`${ex.name} ${isDeload ? "3×2" : scheme}`);
        }

        // Strength
        if (!sType.name.includes("Jump")) {
          const sq = exercises.squat[(b + d) % exercises.squat.length];
          const sqScheme = sq.schemes[(w + d) % sq.schemes.length];
          dayExercises.push(`${sq.name} ${isDeload ? "3×5 @ 60%" : `${sqScheme} @ ${intensity}`}`);
        }

        // Upper
        if (d % 2 === 0 && !sType.name.includes("Jump")) {
          const pr = exercises.press[(b + w) % exercises.press.length];
          const prScheme = pr.schemes[(w + d) % pr.schemes.length];
          dayExercises.push(`${pr.name} ${isDeload ? "3×8 @ 60%" : `${prScheme} @ ${intensity}`}`);
        } else if (!sType.name.includes("Jump")) {
          const pl = exercises.pull[(b + w) % exercises.pull.length];
          const plScheme = pl.schemes[(w + d) % pl.schemes.length];
          dayExercises.push(`${pl.name} ${isDeload ? "3×8 @ 60%" : `${plScheme} @ ${intensity}`}`);
        }

        // Accessories
        if (!isDeload && !sType.name.includes("Jump")) {
          dayExercises.push(exercises.pull[2]?.schemes ? "Face Pulls 3×15" : "Band Pull-Aparts 3×15");
        }

        // Mobility
        const mob = exercises.mobility[(d + w) % exercises.mobility.length];
        dayExercises.push(mob);

        if (profile.injuries && profile.injuries.trim()) {
          dayExercises.push(exercises.prehab[d % exercises.prehab.length]);
        }

        days.push({
          day: d + 1,
          sessionType: sType.name,
          focus: sType.focus,
          exercises: dayExercises,
        });
      }

      weeks.push({
        weekNum: startWeek + w,
        blockWeek: w + 1,
        type: wType,
        intensity,
        days,
      });
    }

    blocks.push({
      num: b + 1,
      name: `Block ${b + 1}: ${blockPhases[b] || "Build"}`,
      weeks: `${startWeek}-${endWeek}`,
      purpose: `${blockPhases[b] || "Build"} phase — ${blockGoals.map((g) => g.name).join(", ")}`,
      goals: blockGoals,
      weekData: weeks,
    });
  }

  return blocks;
}

function buildSpreadsheet(profile, selectedCoaches, selectedGoals) {
  const wb = XLSX.utils.book_new();
  const numWeeks = parseInt(profile.arcWeeks) || 16;

  // ─── TAB 1: Athlete Profile ───
  const profileData = [
    ["ATHLETE PROFILE"],
    [],
    ["Identity"],
    ["Name", profile.name || ""],
    ["North Star", profile.northStar || ""],
    [],
    ["Body Stats"],
    ["Weight (lb)", profile.weight || ""],
    ["Body Fat %", profile.bodyFat || ""],
    ["Height", profile.height || ""],
    [],
    ["Key Lifts", "Current", "Target"],
    ["Back Squat", profile.backSquat || "", profile.backSquatTarget || ""],
    ["Front Squat", profile.frontSquat || "", profile.frontSquatTarget || ""],
    ["Power Clean", profile.powerClean || "", profile.powerCleanTarget || ""],
    ["Bench Press", profile.bench || "", profile.benchTarget || ""],
    ["OH Press", profile.ohPress || "", profile.ohPressTarget || ""],
    ["Weighted Chin-up", profile.chinUp || "", profile.chinUpTarget || ""],
    [],
    ["Jump Metrics", "Current", "Target"],
    ["Approach Touch", profile.approachTouch || "", profile.approachTouchTarget || ""],
    ["Standing Vert", profile.standingVert || "", profile.standingVertTarget || ""],
    [],
    ["Injuries"],
    [profile.injuries || "None reported"],
    [],
    ["Constraints"],
    ["Training Days/Week", profile.trainingDays || "5"],
    ["Session Length", profile.sessionLength || "75 min"],
    ["Equipment", profile.equipment || "Full gym"],
    ["Location", profile.location || ""],
    [],
    ["Coaching Team"],
    ...selectedCoaches.map((id) => {
      const c = COACHES.find((c) => c.id === id);
      return [c?.name || id, c?.specialty || ""];
    }),
    [],
    ["Selected Goals"],
    ...selectedGoals.map((g) => [g.name, g.type, `${g.cost} slots`, g.example]),
  ];

  const wsProfile = XLSX.utils.aoa_to_sheet(profileData);
  wsProfile["!cols"] = [{ wch: 20 }, { wch: 25 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsProfile, "Athlete Profile");

  // ─── TAB 2: Arc Overview ───
  const totalSlots = (parseInt(profile.trainingDays) || 5) * 2;
  const usedSlots = selectedGoals.reduce((s, g) => s + g.cost, 0);

  const blocks = generateWorkouts(profile, selectedGoals, selectedCoaches, numWeeks);

  const arcData = [
    ["ARC OVERVIEW"],
    [],
    ["Arc Name", profile.arcName || `${profile.name || "Athlete"}'s Arc`],
    ["Purpose", profile.northStar || ""],
    ["Duration", `${numWeeks} weeks`],
    ["Training Days", `${profile.trainingDays || 5}/week`],
    [],
    ["GOALS", "Type", "Metric", "Cost", "Status"],
    ...selectedGoals.map((g) => [g.name, g.type, g.example, `${g.cost} slots`, "Active"]),
    [],
    ["Budget", `${usedSlots} / ${totalSlots} slots used`],
    [],
    ["BLOCK TIMELINE", "Weeks", "Purpose"],
    ...blocks.map((b) => [`Block ${b.num}`, b.weeks, b.purpose]),
    [],
    ["PRIORITY STACK", "Rule"],
    ...selectedGoals
      .filter((g) => g.cost > 0)
      .map((g, i) => [`#${i + 1} ${g.name}`, `Protect ${g.costDesc}`]),
  ];

  const wsArc = XLSX.utils.aoa_to_sheet(arcData);
  wsArc["!cols"] = [{ wch: 22 }, { wch: 18 }, { wch: 35 }, { wch: 12 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsArc, "Arc Overview");

  // ─── BLOCK TABS ───
  blocks.forEach((block) => {
    const blockData = [
      [block.name.toUpperCase()],
      ["Purpose", block.purpose],
      ["Weeks", block.weeks],
      ["Goals", block.goals.map((g) => g.name).join(", ")],
      [],
    ];

    block.weekData.forEach((week) => {
      blockData.push([
        `WEEK ${week.weekNum}`,
        `Block week ${week.blockWeek}`,
        week.type,
        `Intensity: ${week.intensity}`,
      ]);
      blockData.push([]);

      week.days.forEach((day) => {
        blockData.push([
          `Day ${day.day} — ${day.sessionType}`,
          day.focus,
        ]);
        day.exercises.forEach((ex, i) => {
          blockData.push(["", `${i + 1}. ${ex}`]);
        });
        blockData.push([]);
      });
      blockData.push(["─".repeat(40)]);
      blockData.push([]);
    });

    const wsBlock = XLSX.utils.aoa_to_sheet(blockData);
    wsBlock["!cols"] = [{ wch: 30 }, { wch: 45 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsBlock, `Block ${block.num}`);
  });

  // ─── WORKOUT LOG ───
  const logHeaders = ["Date", "Exercise", "Prescription", "Actual Sets", "Actual Reps", "Actual Weight", "RPE", "Notes"];
  const logData = [logHeaders];
  // Pre-fill a few sample rows
  for (let i = 0; i < 5; i++) {
    logData.push(["", "", "", "", "", "", "", ""]);
  }
  const wsLog = XLSX.utils.aoa_to_sheet(logData);
  wsLog["!cols"] = logHeaders.map((h) => ({ wch: h.length < 8 ? 12 : h.length + 4 }));
  XLSX.utils.book_append_sheet(wb, wsLog, "Workout Log");

  // ─── NUTRITION LOG ───
  const nutHeaders = ["Date", "Calories", "Protein (g)", "Carbs (g)", "Fat (g)", "BW (lb)", "Sleep (hrs)", "Notes"];
  const nutData = [nutHeaders];
  for (let i = 0; i < 7; i++) {
    nutData.push(["", "", "", "", "", "", "", ""]);
  }
  nutData.push([]);
  nutData.push(["7-Day Avg", { t: "n", f: `AVERAGE(B2:B8)` }, { t: "n", f: `AVERAGE(C2:C8)` }, { t: "n", f: `AVERAGE(D2:D8)` }, { t: "n", f: `AVERAGE(E2:E8)` }, { t: "n", f: `AVERAGE(F2:F8)` }, { t: "n", f: `AVERAGE(G2:G8)` }, ""]);
  const wsNut = XLSX.utils.aoa_to_sheet(nutData);
  wsNut["!cols"] = nutHeaders.map((h) => ({ wch: h.length < 8 ? 12 : h.length + 2 }));
  XLSX.utils.book_append_sheet(wb, wsNut, "Nutrition Log");

  return wb;
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────────

function ProgressBar({ step, totalSteps }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div
            className={`h-1.5 w-full rounded-full transition-all duration-500 ${
              i < step ? "bg-indigo-500" : i === step ? "bg-indigo-300" : "bg-gray-200"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

function StepHeader({ step, title, subtitle }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">
        Step {step + 1}
      </p>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text", half = false }) {
  return (
    <div className={half ? "w-1/2" : "w-full"}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white resize-none"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

// ─── STEP 1: PROFILE ───────────────────────────────────────────────────────────

function ProfileStep({ profile, setProfile }) {
  const set = (key) => (val) => setProfile((p) => ({ ...p, [key]: val }));

  return (
    <div>
      <StepHeader
        step={0}
        title="Who are you?"
        subtitle="Your character sheet. Everything downstream builds on this."
      />
      <div className="space-y-6">
        {/* Identity */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Identity</h3>
          <FormField label="Name" value={profile.name} onChange={set("name")} placeholder="Andy" />
          <FormField
            label="North Star"
            value={profile.northStar}
            onChange={set("northStar")}
            placeholder="I want to dunk a volleyball by end of summer"
            type="textarea"
          />
          <FormField
            label="Arc Name"
            value={profile.arcName}
            onChange={set("arcName")}
            placeholder="Summer Dunk 2026"
          />
          <div className="flex gap-3">
            <FormField
              label="Arc Duration (weeks)"
              value={profile.arcWeeks}
              onChange={set("arcWeeks")}
              placeholder="16"
              type="number"
              half
            />
            <FormField
              label="Training Days/Week"
              value={profile.trainingDays}
              onChange={set("trainingDays")}
              placeholder="5"
              type="number"
              half
            />
          </div>
        </div>

        {/* Body */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Body</h3>
          <div className="flex gap-3">
            <FormField label="Weight (lb)" value={profile.weight} onChange={set("weight")} placeholder="192" half />
            <FormField label="Body Fat %" value={profile.bodyFat} onChange={set("bodyFat")} placeholder="15" half />
          </div>
          <FormField label="Height" value={profile.height} onChange={set("height")} placeholder="5'10\"" />
        </div>

        {/* Lifts */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Key Lifts</h3>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Back Squat" value={profile.backSquat} onChange={set("backSquat")} placeholder="370 lb" half />
            <FormField label="→ Target" value={profile.backSquatTarget} onChange={set("backSquatTarget")} placeholder="405 lb" half />
            <FormField label="Front Squat" value={profile.frontSquat} onChange={set("frontSquat")} placeholder="275 lb" half />
            <FormField label="→ Target" value={profile.frontSquatTarget} onChange={set("frontSquatTarget")} placeholder="330 lb" half />
            <FormField label="Power Clean" value={profile.powerClean} onChange={set("powerClean")} placeholder="90 kg" half />
            <FormField label="→ Target" value={profile.powerCleanTarget} onChange={set("powerCleanTarget")} placeholder="100 kg" half />
            <FormField label="Bench Press" value={profile.bench} onChange={set("bench")} placeholder="225 lb" half />
            <FormField label="→ Target" value={profile.benchTarget} onChange={set("benchTarget")} placeholder="250 lb" half />
            <FormField label="OH Press" value={profile.ohPress} onChange={set("ohPress")} placeholder="50 kg" half />
            <FormField label="→ Target" value={profile.ohPressTarget} onChange={set("ohPressTarget")} placeholder="60 kg" half />
            <FormField label="Weighted Chin-up" value={profile.chinUp} onChange={set("chinUp")} placeholder="25 kg" half />
            <FormField label="→ Target" value={profile.chinUpTarget} onChange={set("chinUpTarget")} placeholder="50 kg 5RM" half />
          </div>
        </div>

        {/* Jump */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Jump Metrics</h3>
          <div className="flex gap-3">
            <FormField label="Approach Touch" value={profile.approachTouch} onChange={set("approachTouch")} placeholder="Rim grab" half />
            <FormField label="→ Target" value={profile.approachTouchTarget} onChange={set("approachTouchTarget")} placeholder='10" above rim' half />
          </div>
          <div className="flex gap-3">
            <FormField label="Standing Vert" value={profile.standingVert} onChange={set("standingVert")} placeholder='28"' half />
            <FormField label="→ Target" value={profile.standingVertTarget} onChange={set("standingVertTarget")} placeholder='34"' half />
          </div>
        </div>

        {/* Injuries & Constraints */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Injuries & Constraints</h3>
          <FormField
            label="Active Injuries"
            value={profile.injuries}
            onChange={set("injuries")}
            placeholder="Right shoulder — affects overhead pressing. Left wrist — De Quervain's."
            type="textarea"
          />
          <div className="flex gap-3">
            <FormField label="Session Length" value={profile.sessionLength} onChange={set("sessionLength")} placeholder="75 min" half />
            <FormField label="Location" value={profile.location} onChange={set("location")} placeholder="LA" half />
          </div>
          <FormField label="Equipment Access" value={profile.equipment} onChange={set("equipment")} placeholder="Full gym — barbell, rack, Olympic platform, dumbbells" />
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: PICK TEAM ─────────────────────────────────────────────────────────

function CoachCard({ coach, selected, onToggle }) {
  const isLocked = coach.always;
  return (
    <button
      onClick={() => !isLocked && onToggle(coach.id)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      } ${isLocked ? "cursor-default" : "cursor-pointer"}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{coach.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm">{coach.name}</span>
            {isLocked && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                Always
              </span>
            )}
            {selected && !isLocked && (
              <span className="text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded font-medium">
                Selected
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{coach.specialty}</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{coach.description}</p>
        </div>
      </div>
    </button>
  );
}

function TeamStep({ selectedCoaches, setSelectedCoaches }) {
  const toggle = (id) => {
    setSelectedCoaches((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <StepHeader
        step={1}
        title="Pick Your Team"
        subtitle="Assemble your coaching staff. Each coach unlocks goal proposals in the next step."
      />
      <div className="space-y-3">
        {COACHES.map((coach) => (
          <CoachCard
            key={coach.id}
            coach={coach}
            selected={selectedCoaches.includes(coach.id)}
            onToggle={toggle}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">
        {selectedCoaches.length} coach{selectedCoaches.length !== 1 ? "es" : ""} selected
      </p>
    </div>
  );
}

// ─── STEP 3: GOAL SHOP ─────────────────────────────────────────────────────────

function GoalCard({ goal, selected, onToggle, disabled }) {
  const colors = TYPE_COLORS[goal.type] || TYPE_COLORS.Consistency;
  const coach = COACHES.find((c) => c.id === goal.coach);

  return (
    <button
      onClick={() => !disabled && onToggle(goal.id)}
      disabled={disabled && !selected}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-indigo-500 bg-white shadow-sm"
          : disabled
          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
          : "border-gray-200 bg-white hover:border-gray-300 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">{goal.name}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              {goal.type}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">{goal.example}</p>
          <p className="text-xs text-gray-400 mt-1">{goal.why}</p>
          <p className="text-xs text-gray-400 mt-1">
            {coach?.icon} {coach?.name} · {goal.costDesc}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-lg font-bold ${
              goal.cost === 0 ? "text-green-600" : "text-amber-600"
            }`}
          >
            {goal.cost === 0 ? "Free" : `${goal.cost}`}
          </span>
          {goal.cost > 0 && <span className="text-xs text-gray-400">slots</span>}
          {selected && (
            <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-medium mt-1">
              ✓
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function GoalShopStep({ selectedCoaches, selectedGoals, setSelectedGoals, budget }) {
  const availableGoals = GOALS.filter(
    (g) => selectedCoaches.includes(g.coach)
  );
  const usedSlots = selectedGoals.reduce((s, g) => s + g.cost, 0);
  const remaining = budget - usedSlots;

  const toggle = (id) => {
    const goal = GOALS.find((g) => g.id === id);
    if (!goal) return;
    if (selectedGoals.some((g) => g.id === id)) {
      setSelectedGoals((prev) => prev.filter((g) => g.id !== id));
    } else if (remaining >= goal.cost) {
      setSelectedGoals((prev) => [...prev, goal]);
    }
  };

  const pct = Math.min((usedSlots / budget) * 100, 100);

  return (
    <div>
      <StepHeader
        step={2}
        title="Goal Shop"
        subtitle="Your coaches propose goals. Pick what fits your budget — you can't take everything."
      />

      {/* Budget bar */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-700">
            Budget: {usedSlots} / {budget} slots
          </span>
          <span className="text-sm text-gray-500">{remaining} remaining</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-indigo-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {selectedGoals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedGoals.map((g) => (
              <span
                key={g.id}
                className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium"
              >
                {g.name} ({g.cost === 0 ? "free" : `${g.cost}`})
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {availableGoals.map((goal) => {
          const isSelected = selectedGoals.some((g) => g.id === goal.id);
          const cantAfford = !isSelected && goal.cost > remaining;
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              selected={isSelected}
              onToggle={toggle}
              disabled={cantAfford}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── STEP 4: GENERATE ──────────────────────────────────────────────────────────

function GenerateStep({ profile, selectedCoaches, selectedGoals, budget }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const usedSlots = selectedGoals.reduce((s, g) => s + g.cost, 0);
  const numWeeks = parseInt(profile.arcWeeks) || 16;
  const numBlocks = numWeeks <= 8 ? 3 : numWeeks <= 14 ? 4 : 5;

  const download = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      try {
        const wb = buildSpreadsheet(profile, selectedCoaches, selectedGoals);
        const filename = `${(profile.arcName || "training-plan").replace(/\s+/g, "-").toLowerCase()}.xlsx`;
        XLSX.writeFile(wb, filename);
        setDone(true);
      } catch (e) {
        console.error(e);
        alert("Error generating spreadsheet: " + e.message);
      }
      setGenerating(false);
    }, 800);
  }, [profile, selectedCoaches, selectedGoals]);

  return (
    <div>
      <StepHeader
        step={3}
        title="Generate Your Plan"
        subtitle="Everything's locked in. Here's what we're building."
      />

      {/* Summary */}
      <div className="space-y-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Athlete</h3>
          <p className="text-sm text-gray-600">
            {profile.name || "Athlete"} · {profile.weight || "?"} lb · {profile.trainingDays || 5} days/wk
          </p>
          <p className="text-xs text-gray-400 mt-1">{profile.northStar || ""}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Team</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCoaches.map((id) => {
              const c = COACHES.find((c) => c.id === id);
              return (
                <span
                  key={id}
                  className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full"
                >
                  {c?.icon} {c?.name}
                </span>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            Goals ({usedSlots}/{budget} slots)
          </h3>
          <div className="space-y-2">
            {selectedGoals.map((g) => {
              const colors = TYPE_COLORS[g.type] || TYPE_COLORS.Consistency;
              return (
                <div key={g.id} className="flex items-center gap-2">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    {g.type}
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{g.name}</span>
                  <span className="text-xs text-gray-400">
                    {g.cost === 0 ? "free" : `${g.cost} slots`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Spreadsheet Contents</h3>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Tab 1: Athlete Profile</p>
            <p>Tab 2: Arc Overview — {numWeeks} weeks, {numBlocks} blocks</p>
            {Array.from({ length: numBlocks }, (_, i) => (
              <p key={i}>Tab {i + 3}: Block {i + 1} — full daily workouts</p>
            ))}
            <p>Tab {numBlocks + 3}: Workout Log</p>
            <p>Tab {numBlocks + 4}: Nutrition Log (with 7-day avg formulas)</p>
          </div>
        </div>
      </div>

      {/* Download */}
      <button
        onClick={download}
        disabled={generating}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          done
            ? "bg-green-500 text-white"
            : generating
            ? "bg-indigo-300 text-white cursor-wait"
            : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 shadow-lg hover:shadow-xl"
        }`}
      >
        {done ? "✓ Downloaded!" : generating ? "Generating..." : "Generate & Download .xlsx"}
      </button>

      {done && (
        <div className="mt-6 bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-800 font-medium">Your plan is ready.</p>
          <p className="text-xs text-indigo-600 mt-1">
            Open the spreadsheet — every exercise traces back to a goal, every block has a purpose.
            The Workout Log and Nutrition Log tabs are where you track daily.
          </p>
          <button
            onClick={() => { setDone(false); }}
            className="mt-3 text-xs text-indigo-500 underline hover:text-indigo-700"
          >
            Download again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────────

export default function TrainPlanGenerator() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    northStar: "",
    arcName: "",
    arcWeeks: "16",
    trainingDays: "5",
    weight: "",
    bodyFat: "",
    height: "",
    backSquat: "",
    backSquatTarget: "",
    frontSquat: "",
    frontSquatTarget: "",
    powerClean: "",
    powerCleanTarget: "",
    bench: "",
    benchTarget: "",
    ohPress: "",
    ohPressTarget: "",
    chinUp: "",
    chinUpTarget: "",
    approachTouch: "",
    approachTouchTarget: "",
    standingVert: "",
    standingVertTarget: "",
    injuries: "",
    sessionLength: "75 min",
    location: "",
    equipment: "Full gym",
  });
  const [selectedCoaches, setSelectedCoaches] = useState(["head"]);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const budget = (parseInt(profile.trainingDays) || 5) * 2;

  const canAdvance = useMemo(() => {
    if (step === 0) return profile.name.trim().length > 0;
    if (step === 1) return selectedCoaches.length >= 2; // head + at least one specialist
    if (step === 2) return selectedGoals.length >= 1;
    return true;
  }, [step, profile.name, selectedCoaches.length, selectedGoals.length]);

  return (
    <div className="max-w-xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Train</h1>
        <p className="text-xs text-gray-400 mt-0.5">Plan Generator</p>
      </div>

      <ProgressBar step={step} totalSteps={4} />

      {/* Steps */}
      {step === 0 && <ProfileStep profile={profile} setProfile={setProfile} />}
      {step === 1 && (
        <TeamStep selectedCoaches={selectedCoaches} setSelectedCoaches={setSelectedCoaches} />
      )}
      {step === 2 && (
        <GoalShopStep
          selectedCoaches={selectedCoaches}
          selectedGoals={selectedGoals}
          setSelectedGoals={setSelectedGoals}
          budget={budget}
        />
      )}
      {step === 3 && (
        <GenerateStep
          profile={profile}
          selectedCoaches={selectedCoaches}
          selectedGoals={selectedGoals}
          budget={budget}
        />
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          <div className="max-w-xl mx-auto flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                canAdvance
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {step === 2 ? "Lock Goals & Generate" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
