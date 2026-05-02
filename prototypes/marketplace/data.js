// =============================================================================
// COACH ROSTER — standardized profile shape so every page looks the same
// =============================================================================
// Fields (every coach has every field):
//   id, name, handle, category, tagline, accent
//   stats: { followers, programs, rating }
//   tags: { goals[], levels[], equipment[], daysPerWeek, sessionLength }
//   philosophy: short paragraph (60-90 words)
//   principles: 4-5 bullet points with title + 1-sentence explanation
//   weekStructure: array of 7 day labels (the typical split)
//   videos: 3 sample videos (title, duration, views)
//   bestFor: 3 bullets
//   notFor: 3 bullets
//   pairsWith: ids of 2 coaches that complement
// =============================================================================

const CATEGORIES = {
  strength:  { label: 'Strength & Hypertrophy', accent: '#4338ca' },
  athletic:  { label: 'Athletic Performance',   accent: '#ea580c' },
  aesthetic: { label: 'Aesthetic & Physique',   accent: '#db2777' },
  hybrid:    { label: 'Hybrid & Longevity',     accent: '#059669' },
};

const COACHES = [
  // -------------------------------------------------------------- STRENGTH
  {
    id: 'jeff-nippard',
    name: 'Jeff Nippard',
    handle: '@jeffnippard',
    category: 'strength',
    tagline: 'Science-based hypertrophy from a natty bodybuilder with a biochem degree.',
    stats: { followers: '4.6M', programs: 12, rating: 4.9 },
    tags: {
      goals: ['hypertrophy', 'strength'],
      levels: ['intermediate', 'advanced'],
      equipment: ['full gym'],
      daysPerWeek: '4–6',
      sessionLength: '60–90 min',
    },
    philosophy: 'Every prescription is an answer to a literature question — what does the meta-analysis say about frequency, what stretch position drives the most growth, where does junk volume start? The result is dense programming that pulls receipts: RIR-based progression, exercise selection ranked by EMG and stretch-mediated hypertrophy data, and volume that lives between MEV and MRV. Earn your reps; understand why each one is on the page.',
    principles: [
      { title: 'RIR-based progression', body: 'Top sets are calibrated to reps in reserve. Push effort up across a mesocycle, then deload before form breaks.' },
      { title: 'Volume landmarks per muscle', body: 'Each muscle has its own MV / MEV / MAV / MRV. Programming hits the sweet spot, never the ceiling.' },
      { title: 'Exercise selection by mechanism', body: 'Picks favor lengthened-position bias, stable resistance profiles, and movements with the highest hypertrophy-per-rep yield.' },
      { title: 'Specificity over novelty', body: 'Big six lifts anchor every block. Variation is a tool, not a default.' },
    ],
    weekStructure: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
    videos: [
      { title: 'The Most Scientific Push Workout (Chest/Shoulders/Triceps)', duration: '14:21', views: '3.2M' },
      { title: 'How To Build Muscle: Explained In 5 Levels',                  duration: '11:08', views: '2.7M' },
      { title: 'The Optimal Training Volume To Build Muscle',                  duration: '12:47', views: '1.9M' },
    ],
    bestFor: ['Lifters chasing measured hypertrophy', 'People who want to read the why', 'Intermediate-to-advanced trainees with full gym access'],
    notFor:  ['Sport-specific athletes', 'Beginners overwhelmed by detail', 'Time-constrained 30-min-session folks'],
    pairsWith: ['mike-israetel', 'cbum'],
  },
  {
    id: 'mike-israetel',
    name: 'Dr. Mike Israetel',
    handle: '@drmikeisraetel',
    category: 'strength',
    tagline: 'PhD-backed hypertrophy programming with a side of comedic gym-bro energy.',
    stats: { followers: '3.1M', programs: 18, rating: 4.8 },
    tags: {
      goals: ['hypertrophy'],
      levels: ['intermediate', 'advanced'],
      equipment: ['full gym'],
      daysPerWeek: '4–6',
      sessionLength: '60–90 min',
    },
    philosophy: 'Renaissance Periodization codified the volume landmarks every modern lifter quotes. Mesocycles run 4–6 weeks of progressive volume increase from MEV toward MRV, then a deload, then repeat with new stimulus. Effort is everything — most sets are taken to within 0–2 RIR by week\u2019s end. The model is rigid by design: if you\u2019re not progressing, the framework tells you exactly which knob to turn.',
    principles: [
      { title: 'Mesocycle structure', body: '4-week accumulation block where sets-per-muscle climbs week to week, capped by a deload.' },
      { title: 'Junk volume is real', body: 'Sets that don\u2019t hit a hard set count or proximity to failure don\u2019t move the needle. Cut them.' },
      { title: 'Stimulus-to-fatigue ratio', body: 'Every exercise gets evaluated by how much growth it causes vs. how much recovery it taxes.' },
      { title: 'Exercise variation by mesocycle', body: 'Swap movements between blocks to keep the stimulus novel without losing specificity.' },
    ],
    weekStructure: ['Chest/Back', 'Legs', 'Arms/Shoulders', 'Chest/Back', 'Legs', 'Arms/Shoulders', 'Rest'],
    videos: [
      { title: 'How Many Sets Per Muscle Per Week (Latest Research)', duration: '18:32', views: '1.4M' },
      { title: 'The Perfect Mesocycle for Maximum Gains',              duration: '21:15', views: '980K' },
      { title: 'Junk Volume: The Sets That Are Killing Your Gains',    duration: '15:44', views: '1.1M' },
    ],
    bestFor: ['Lifters who want a system, not vibes', 'People recovering well between sessions', 'Anyone who likes deload weeks built in'],
    notFor:  ['Athletes who can\u2019t train to failure often', 'Beginners with form-issues that mask stimulus', 'Anyone with limited recovery bandwidth'],
    pairsWith: ['jeff-nippard', 'ryan-humiston'],
  },
  {
    id: 'athlean-x',
    name: 'Athlean-X',
    handle: '@athleanx',
    category: 'strength',
    tagline: 'Function-first training from the former Mets PT — physique as a side effect of moving well.',
    stats: { followers: '14.2M', programs: 9, rating: 4.7 },
    tags: {
      goals: ['strength', 'function', 'general fitness'],
      levels: ['beginner', 'intermediate', 'advanced'],
      equipment: ['full gym', 'minimal'],
      daysPerWeek: '3–5',
      sessionLength: '45–75 min',
    },
    philosophy: 'Jeff Cavaliere coached MLB players for a decade — that lens shapes every workout. Movement quality, joint integrity, and corrective work come before aesthetics. Programs blend traditional lifts with unilateral work, anti-rotation core, and "face pulls before bench" injury prevention. Look great because you move great, not the other way around.',
    principles: [
      { title: 'Joint integrity first', body: 'Warm-ups address common dysfunctions (scap, hips, t-spine) before any heavy load.' },
      { title: 'Function dictates exercise selection', body: 'Movements chosen for athletic carryover, not just muscle isolation.' },
      { title: 'Unilateral work in every session', body: 'Single-limb training to surface and correct asymmetries that cause long-term injury.' },
      { title: 'Eccentric emphasis', body: 'Slow lowering phases for tendon resilience and protective hypertrophy around vulnerable joints.' },
    ],
    weekStructure: ['Push', 'Legs', 'Pull', 'Conditioning', 'Push', 'Pull', 'Mobility'],
    videos: [
      { title: 'The Perfect Push Workout (BIGGER & STRONGER!)',         duration: '12:02', views: '8.4M' },
      { title: 'Stop Doing Face Pulls Like This!',                      duration: '7:18',  views: '4.1M' },
      { title: 'The 6 Best Exercises for Bigger Arms (NO MORE CURLS)',  duration: '13:55', views: '11.2M' },
    ],
    bestFor: ['Recreational athletes who don\u2019t want to break', 'Folks recovering from minor injury', 'Anyone with weekend pickup-game commitments'],
    notFor:  ['Lifters chasing absolute hypertrophy maxes', 'Powerlifters cycling around competition', 'People who skip warm-ups on principle'],
    pairsWith: ['peter-attia', 'cam-davidson'],
  },

  // ----------------------------------------------------------- ATHLETIC
  {
    id: 'p3',
    name: 'P3 Athletes',
    handle: '@p3athletes',
    category: 'athletic',
    tagline: 'Force-plate diagnostics + biomechanical assessments — the program that builds NBA athletes.',
    stats: { followers: '420K', programs: 6, rating: 4.9 },
    tags: {
      goals: ['vertical jump', 'speed', 'sport performance'],
      levels: ['intermediate', 'advanced'],
      equipment: ['full gym', 'plyo box', 'force plates (optional)'],
      daysPerWeek: '3–5',
      sessionLength: '60–90 min',
    },
    philosophy: 'Marcus Elliott built P3 around the idea that elite athletes are individuals — generic plans waste their gifts and amplify their flaws. Every program starts with a movement assessment to identify the limiting system: ankle stiffness, hip extension, eccentric absorption, force production rate. Programming attacks that limiter with a precise blend of strength, plyometric, and rebound work. You earn jumps by fixing what\u2019s leaking force.',
    principles: [
      { title: 'Diagnose before prescribing', body: 'Movement screen first — identify the asymmetry or capacity gap before adding load.' },
      { title: 'Force in vs. force out', body: 'Build eccentric capacity to absorb force, then concentric capacity to redirect it.' },
      { title: 'Plyometric ladder', body: 'Progress from low-intensity rebounds to depth jumps as nervous system tolerance grows.' },
      { title: 'Deceleration is the prerequisite', body: 'You can\u2019t train explosive change-of-direction until you can stop cleanly.' },
    ],
    weekStructure: ['Lower power', 'Upper strength', 'Plyo + speed', 'Recovery', 'Lower strength', 'Upper power', 'Rest'],
    videos: [
      { title: 'Why Some NBA Players Jump Higher Than Others',         duration: '16:40', views: '890K' },
      { title: 'P3 Movement Assessment Explained',                      duration: '22:11', views: '440K' },
      { title: 'The Truth About Vertical Jump Training',                duration: '14:25', views: '1.2M' },
    ],
    bestFor: ['Court/field athletes prioritizing performance', 'Anyone training to dunk or sprint faster', 'Athletes with access to plyo equipment'],
    notFor:  ['Pure hypertrophy seekers', 'Beginners without movement foundation', 'People who can\u2019t measure progress objectively'],
    pairsWith: ['cam-davidson', 'hooper-training'],
  },
  {
    id: 'hooper-training',
    name: 'Hooper Training',
    handle: '@hoopertraining',
    category: 'athletic',
    tagline: 'Basketball-specific performance — court speed, change of direction, finishing strength.',
    stats: { followers: '780K', programs: 8, rating: 4.7 },
    tags: {
      goals: ['vertical jump', 'speed', 'basketball'],
      levels: ['beginner', 'intermediate', 'advanced'],
      equipment: ['full gym', 'court access'],
      daysPerWeek: '4–6',
      sessionLength: '45–75 min',
    },
    philosophy: 'Built by former D1 strength coaches for the basketball player who wants to show up on the court next month measurably better. Programming integrates court drills with weight room work — if you\u2019re training the lift, you\u2019re training the move it serves. Every block tracks vertical, lane agility, and 3/4-court sprint as KPIs. The gym is in service of the game.',
    principles: [
      { title: 'Train movements, not muscles', body: 'Lifts are categorized by triple-extension, deceleration, multi-directional power, and finishing strength.' },
      { title: 'Court + gym integration', body: 'Every weight-room week is paired with on-court ball-handling and finishing drills.' },
      { title: 'Conditioning that mimics game demands', body: 'Intervals replicate the work-to-rest ratio of an NBA possession, not steady-state cardio.' },
      { title: 'KPI tracking', body: 'Vert, lane agility, sprint, broad jump tested at the start and end of every block.' },
    ],
    weekStructure: ['Lower power', 'Court + upper', 'Speed + plyo', 'Court + recovery', 'Lower strength', 'Court + skills', 'Rest'],
    videos: [
      { title: 'How To Add 6 Inches To Your Vertical In 12 Weeks',       duration: '12:33', views: '2.1M' },
      { title: 'Game-Speed Conditioning For Basketball Players',         duration: '9:48',  views: '650K' },
      { title: 'Finishing Strength: The Hidden Skill of Elite Scorers',  duration: '15:12', views: '430K' },
    ],
    bestFor: ['Basketball players of any level', 'Athletes who play 1+ pickup games per week', 'People who want measurable on-court gains'],
    notFor:  ['Pure aesthetic-driven trainees', 'Powerlifters in competition prep', 'Athletes in non-jumping sports'],
    pairsWith: ['p3', 'cam-davidson'],
  },
  {
    id: 'cam-davidson',
    name: 'Cam Davidson',
    handle: '@camdavidson',
    category: 'athletic',
    tagline: 'Olympic lifting + jumping mechanics — explosive power for the court and field.',
    stats: { followers: '320K', programs: 5, rating: 4.8 },
    tags: {
      goals: ['vertical jump', 'power', 'olympic lifting'],
      levels: ['intermediate', 'advanced'],
      equipment: ['full gym', 'lifting platform'],
      daysPerWeek: '4–5',
      sessionLength: '75–90 min',
    },
    philosophy: 'Power is a skill. Cam\u2019s programming uses the Olympic lifts and their derivatives as the engine — not because they build the most muscle, but because they teach the nervous system to recruit fast-twitch fibers under coordinated load. Pair the cleans and snatches with intent-driven plyometrics and you get an athlete who can produce force in 0.2 seconds, not 2.',
    principles: [
      { title: 'Intent over volume', body: 'Every rep moved with maximal speed. If bar speed drops, set ends.' },
      { title: 'Olympic derivatives daily', body: 'Hang variations, pulls, and high-pulls used as primary power developers.' },
      { title: 'Rate of force development', body: 'Programming targets RFD specifically — short, intense efforts with full recovery.' },
      { title: 'Strength as a base, not a goal', body: 'Get strong enough that strength is no longer the limiter, then chase rate.' },
    ],
    weekStructure: ['Olympic + lower strength', 'Upper strength', 'Plyo + sprint', 'Olympic + lower power', 'Upper hypertrophy', 'Rest', 'Rest'],
    videos: [
      { title: 'Why Olympic Lifters Have The Best Verticals',          duration: '11:27', views: '720K' },
      { title: 'Cleans vs. Squats For Vertical Jump',                  duration: '13:44', views: '480K' },
      { title: 'How To Train For Maximum Rate of Force Development',   duration: '17:08', views: '290K' },
    ],
    bestFor: ['Athletes already squatting 1.5x+ bodyweight', 'Olympic lifting enthusiasts', 'Anyone with platform access and time to learn technique'],
    notFor:  ['Beginners without coaching access', 'People with shoulder/wrist mobility limits', 'Trainees on minimal equipment'],
    pairsWith: ['p3', 'mat-fraser'],
  },

  // ---------------------------------------------------------- AESTHETIC
  {
    id: 'cbum',
    name: 'Chris Bumstead',
    handle: '@cbum',
    category: 'aesthetic',
    tagline: 'Five-time Mr. Olympia Classic Physique — V-taper, structure, the Golden Era look.',
    stats: { followers: '12.4M', programs: 7, rating: 4.9 },
    tags: {
      goals: ['hypertrophy', 'aesthetics'],
      levels: ['intermediate', 'advanced'],
      equipment: ['full gym'],
      daysPerWeek: '5–6',
      sessionLength: '75–105 min',
    },
    philosophy: 'Classic physique is about proportion — wide shoulders, narrow waist, full chest, sweeping quads. Cbum\u2019s programming pursues that silhouette with high-frequency, moderate-volume training of the showcase muscles, controlled eccentrics, and a brutal mind-muscle connection. Every set has a target muscle, not a number. The aesthetic is the metric.',
    principles: [
      { title: 'Train the silhouette', body: 'Volume biased toward shoulders, lats, chest, and quads — the muscles that define the V.' },
      { title: 'Mind-muscle connection over PRs', body: 'Felt tension trumps weight on the bar. If the muscle isn\u2019t firing, the rep doesn\u2019t count.' },
      { title: 'Controlled eccentrics', body: '2-3 second negatives on hypertrophy work. Time under tension is non-negotiable.' },
      { title: 'High frequency on weak points', body: 'Lagging muscles get hit twice or three times per week with focused volume.' },
    ],
    weekStructure: ['Chest/Triceps', 'Back/Biceps', 'Legs', 'Shoulders', 'Arms', 'Legs', 'Rest'],
    videos: [
      { title: 'Full Chest Workout for Classic Physique',         duration: '18:22', views: '4.8M' },
      { title: 'My Off-Season Back Workout (No Pump = No Gain)',  duration: '21:15', views: '3.6M' },
      { title: 'How I Train Quads For Olympia',                    duration: '24:08', views: '2.9M' },
    ],
    bestFor: ['Lifters chasing a specific look', 'People with 5+ training days per week', 'Anyone who likes long sessions'],
    notFor:  ['Athletes prioritizing performance over looks', 'Time-constrained trainees', 'People who can\u2019t train past failure regularly'],
    pairsWith: ['jeff-nippard', 'sam-sulek'],
  },
  {
    id: 'sam-sulek',
    name: 'Sam Sulek',
    handle: '@sam_sulek',
    category: 'aesthetic',
    tagline: 'High-frequency, intuitive bro split — train the muscle, not the program.',
    stats: { followers: '6.8M', programs: 3, rating: 4.6 },
    tags: {
      goals: ['hypertrophy', 'aesthetics'],
      levels: ['intermediate', 'advanced'],
      equipment: ['full gym'],
      daysPerWeek: '6',
      sessionLength: '60–90 min',
    },
    philosophy: 'Hit each muscle hard, hit it often, eat a lot, sleep more. Sam\u2019s training is bro-split structured but intuitive in execution — the working sets are taken to or past failure, exercise selection rotates by feel, and recovery is solved with food and sleep rather than deloads. It\u2019s old-school bodybuilding stripped of complication and supercharged with effort.',
    principles: [
      { title: 'One muscle per day', body: 'Bro split keeps the volume on a single muscle so you can crush it without limiting other sessions.' },
      { title: 'Failure or beyond', body: 'Top sets taken to muscular failure. Drop sets, partials, and rest-pause used liberally.' },
      { title: 'Intuitive exercise selection', body: 'Pick movements based on how the muscle responds today, not what\u2019s on the page.' },
      { title: 'Food and sleep are the program', body: 'Massive caloric surplus, 8+ hours of sleep, no deloads — recovery is a calorie problem.'},
    ],
    weekStructure: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Chest/Back accessories', 'Rest'],
    videos: [
      { title: 'Pushing My Chest To Absolute Failure (RAW)',  duration: '32:18', views: '5.2M' },
      { title: 'Back Day With 5000 Calorie Meal Prep',         duration: '28:44', views: '4.7M' },
      { title: 'Arms Day: The Pump From Hell',                  duration: '24:31', views: '3.9M' },
    ],
    bestFor: ['Younger lifters with high recovery capacity', 'People who like 6-day-a-week routines', 'Anyone who eats in a heavy surplus'],
    notFor:  ['Lifters with limited recovery', 'People over 40', 'Anyone with joint issues from high-volume failure work'],
    pairsWith: ['cbum', 'ryan-humiston'],
  },
  {
    id: 'ryan-humiston',
    name: 'Ryan Humiston',
    handle: '@ryanhumiston',
    category: 'aesthetic',
    tagline: 'Funny, fast, brutal — bodybuilding workouts that finish in 45 minutes and leave you wrecked.',
    stats: { followers: '2.4M', programs: 11, rating: 4.7 },
    tags: {
      goals: ['hypertrophy', 'aesthetics', 'general fitness'],
      levels: ['beginner', 'intermediate'],
      equipment: ['full gym', 'minimal'],
      daysPerWeek: '4–6',
      sessionLength: '40–55 min',
    },
    philosophy: 'You don\u2019t need 90-minute marathons to grow. Ryan\u2019s programs prove you can pack a high-stimulus workout into 45 minutes by stacking supersets, drop sets, and short-rest intervals. Programming uses unconventional exercise variations to drive new growth in muscles that have stagnated on the basics — the goal is variety as a stimulus, not as entertainment.',
    principles: [
      { title: 'Density over duration', body: 'Workouts run 40–55 min with minimal rest. Higher work-per-minute drives metabolic stress.' },
      { title: 'Superset structure', body: 'Most exercises paired — opposing muscle groups or pre-exhaust pairings to magnify stimulus.' },
      { title: 'Variation as stimulus', body: 'Unusual angles, unilateral takes, and grip variations refresh growth in plateaued muscles.' },
      { title: 'Effort is the only currency', body: 'Most sets to 0–1 RIR. The short workout earns its right to be short by being maximally hard.' },
    ],
    weekStructure: ['Chest', 'Back', 'Legs', 'Shoulders/Arms', 'Chest/Back', 'Legs', 'Rest'],
    videos: [
      { title: '45-Minute Chest Workout That Will Crush You',         duration: '11:42', views: '1.8M' },
      { title: 'I Tried Mike Israetel\'s Back Routine (HONEST REVIEW)', duration: '14:08', views: '2.2M' },
      { title: 'The Best Superset Workout for Muscle Growth',          duration: '13:55', views: '1.4M' },
    ],
    bestFor: ['Time-constrained trainees', 'People who hate long sessions', 'Lifters needing exercise variety'],
    notFor:  ['Powerlifters needing long rest periods', 'People who only want compound lifts', 'Trainees who hate supersets'],
    pairsWith: ['mike-israetel', 'sam-sulek'],
  },

  // ----------------------------------------------------------- HYBRID
  {
    id: 'mat-fraser',
    name: 'Mat Fraser',
    handle: '@mathewfras',
    category: 'hybrid',
    tagline: 'Five-time CrossFit Games champion — engine, strength, and skill in one framework.',
    stats: { followers: '2.7M', programs: 14, rating: 4.9 },
    tags: {
      goals: ['general fitness', 'strength', 'conditioning'],
      levels: ['intermediate', 'advanced'],
      equipment: ['full gym', 'rower', 'barbell'],
      daysPerWeek: '5–6',
      sessionLength: '75–120 min',
    },
    philosophy: 'The fittest human in history built his model around capacity across every domain — strength, gymnastics, monostructural. HWPO programming layers strict strength work in the morning with conditioning, skill, or capacity work later. The athlete is built to handle anything: heavy barbell, long row, gymnastics, sprints. Versatility is the goal, not the byproduct.',
    principles: [
      { title: 'Two-a-days when possible', body: 'Strength work in the AM, conditioning or skill in the PM — separates fatigue, doubles stimulus.' },
      { title: 'Strength first', body: 'Heavy barbell work always before metcons. The base of every block is squat, deadlift, press strength.' },
      { title: 'Engine matters', body: 'Sustained Z2/Z3 cardio plus repeatable max-effort intervals. Build the aerobic floor and the anaerobic ceiling.' },
      { title: 'Skill density', body: 'Gymnastics movements and Olympic lifts touched almost daily — competence comes from frequency.' },
    ],
    weekStructure: ['Strength + WOD', 'Engine + skill', 'Strength + WOD', 'Active recovery', 'Strength + WOD', 'Long capacity', 'Rest'],
    videos: [
      { title: 'A Day In The Life: HWPO Training',                duration: '19:33', views: '1.9M' },
      { title: 'How I Built My Engine: Aerobic Capacity Training', duration: '23:11', views: '870K' },
      { title: 'The 5x Champion\'s Squat Program',                  duration: '17:22', views: '1.2M' },
    ],
    bestFor: ['CrossFit athletes', 'Hybrid trainees who want everything', 'People with 90+ minutes per session, 5+ days'],
    notFor:  ['Pure aesthetic seekers', 'Beginners without barbell competence', 'Time-constrained recreational trainees'],
    pairsWith: ['cam-davidson', 'nick-bare'],
  },
  {
    id: 'nick-bare',
    name: 'Nick Bare',
    handle: '@nickbarefitness',
    category: 'hybrid',
    tagline: 'Lift heavy, run far — hybrid athlete blueprint for the recreational endurance crowd.',
    stats: { followers: '1.3M', programs: 9, rating: 4.7 },
    tags: {
      goals: ['endurance', 'strength', 'hybrid'],
      levels: ['beginner', 'intermediate', 'advanced'],
      equipment: ['full gym', 'running shoes'],
      daysPerWeek: '5–7',
      sessionLength: '60–120 min',
    },
    philosophy: 'You don\u2019t have to choose. Nick popularized the hybrid athlete archetype — a person who can squat 400 and run a sub-3 marathon. Programming builds both capacities in parallel by separating modalities (lift in the AM, run in the PM), respecting recovery between hard sessions, and using progressive overload on both the barbell and the watch. The mantra: Go One More.',
    principles: [
      { title: 'Separate the modalities', body: 'Strength work and running on different sessions or different days to protect both adaptations.' },
      { title: 'Polarized cardio', body: '80% easy Z2 mileage, 20% hard intervals. The middle is where overtraining lives.' },
      { title: 'Progressive overload on both', body: 'Track lifts in pounds and runs in pace/mileage. Both must trend up across a block.' },
      { title: 'Fueling matches the work', body: 'Carbs scale with mileage. Protein scales with lifting. Underfeeding kills hybrid progress.' },
    ],
    weekStructure: ['Lift + easy run', 'Hard run', 'Lift + recovery jog', 'Lift', 'Easy run', 'Long run', 'Rest'],
    videos: [
      { title: 'How I Train For A Marathon AND A 500lb Deadlift',         duration: '17:55', views: '1.4M' },
      { title: 'The Hybrid Athlete Weekly Schedule (Real Numbers)',        duration: '14:22', views: '890K' },
      { title: 'Lift In The Morning, Run At Night: My Recovery Protocol',  duration: '12:08', views: '720K' },
    ],
    bestFor: ['Marathon runners who lift', 'Tactical athletes', 'Anyone who refuses to choose between cardio and strength'],
    notFor:  ['Pure aesthetic competitors', 'People with low time availability', 'Anyone with a recovery bottleneck'],
    pairsWith: ['mat-fraser', 'peter-attia'],
  },
  {
    id: 'peter-attia',
    name: 'Peter Attia, MD',
    handle: '@peterattiamd',
    category: 'hybrid',
    tagline: 'Longevity-driven training — the four pillars of fitness for your last decade.',
    stats: { followers: '1.8M', programs: 4, rating: 4.9 },
    tags: {
      goals: ['longevity', 'general fitness', 'mobility'],
      levels: ['beginner', 'intermediate', 'advanced'],
      equipment: ['full gym', 'minimal'],
      daysPerWeek: '4–6',
      sessionLength: '45–90 min',
    },
    philosophy: 'Train for the Centenarian Decathlon — the things you want to do at 90. Every prescription serves one of four pillars: stability, strength, aerobic efficiency (Zone 2), and anaerobic peak (VO2max). Programming is unsexy by design. Heavy lifting twice a week, three hours of Zone 2 cardio, weekly VO2 intervals, and daily stability/mobility. The point is to compound capacity, not chase PRs.',
    principles: [
      { title: 'The Four Pillars', body: 'Stability + Strength + Zone 2 + VO2max. Every week touches all four. Skip none.' },
      { title: 'Zone 2 is non-negotiable', body: '3–4 hours per week of low-intensity steady-state cardio. The mitochondrial base for everything else.' },
      { title: 'Strength = grip + carry + hinge', body: 'Farmer\u2019s carries, deadlifts, step-ups. Train for the things you\u2019ll do at 85.' },
      { title: 'VO2 once per week', body: 'One session of 4×4-min near-max intervals. The single highest-leverage lifespan input you can train.' },
    ],
    weekStructure: ['Strength', 'Zone 2', 'Stability + mobility', 'Strength', 'Zone 2', 'VO2 + carries', 'Rest'],
    videos: [
      { title: 'The 4 Pillars of Exercise For Longevity',         duration: '28:14', views: '2.4M' },
      { title: 'How To Train Zone 2 (And Why It Matters)',         duration: '22:08', views: '1.7M' },
      { title: 'Why VO2max Is The Best Predictor of Lifespan',     duration: '18:55', views: '1.3M' },
    ],
    bestFor: ['Anyone over 30 thinking long-term', 'People wanting a sustainable lifelong framework', 'Trainees recovering from injury'],
    notFor:  ['Athletes chasing peak performance this season', 'Pure aesthetics-driven lifters', 'People who hate steady-state cardio'],
    pairsWith: ['athlean-x', 'nick-bare'],
  },
];

// =============================================================================
// SAMPLE GENERATED PLAN — what the mocked output renders.
// In production this is replaced by a real LLM call seeded with selected coaches.
// =============================================================================
const SAMPLE_PLAN = {
  meta: {
    title: 'Your 16-Week Vertical Jump Arc',
    subtitleTemplate: 'Synthesized from {coaches}',
    horizon: '16 weeks',
    daysPerWeek: 5,
    sessionLength: '75 min',
  },
  rationale: 'The plan opens with a 4-week movement-quality block (P3-style screen + correctives + base strength) so you build the chassis before loading it. Block 2 layers in Olympic derivatives and intent-based lifting (Cam Davidson) to teach rate of force development. Block 3 introduces a plyometric ladder and depth jump progression while keeping a Nippard-style hypertrophy minimum dose for posterior chain. The final 4-week peak block taps the system: low volume, max intent, fully recovered jumps. KPIs tested in week 1, 8, and 16: vertical, broad jump, 10m sprint, single-leg RFD.',
  blocks: [
    { name: 'Block 1: Foundation',       weeks: '1–4',   focus: 'Movement quality, base strength, eccentric capacity', source: 'P3' },
    { name: 'Block 2: Power Development', weeks: '5–8',   focus: 'Olympic derivatives, intent-based lifting, RFD',     source: 'Cam Davidson' },
    { name: 'Block 3: Plyometric Ladder', weeks: '9–12',  focus: 'Reactive strength, depth jumps, posterior hypertrophy', source: 'P3 + Nippard' },
    { name: 'Block 4: Peak',              weeks: '13–16', focus: 'Low volume, max intent, recovered jumps',           source: 'Cam Davidson' },
  ],
  sampleWeek: {
    label: 'Sample Week from Block 2 (Power Development)',
    days: [
      { day: 'Mon', title: 'Lower Power',        items: ['Hang clean — 5×3 @ 80% (max bar speed)', 'Back squat — 4×4 @ 78%', 'Romanian deadlift — 3×6 @ RPE 7', 'Pogo jumps — 4×8'] },
      { day: 'Tue', title: 'Upper Strength',     items: ['Bench press — 4×5 @ 80%', 'Weighted pull-up — 4×5', 'DB row — 3×10', 'Face pulls — 3×15'] },
      { day: 'Wed', title: 'Plyo + Sprint',      items: ['Box jumps — 5×3 (full recovery)', 'Broad jumps — 4×3', '10m flying sprints — 6×1', 'Tempo run — 4×100m @ 70%'] },
      { day: 'Thu', title: 'Lower Hypertrophy',  items: ['Front squat — 4×6 @ RPE 8', 'Bulgarian split squat — 3×8/leg', 'Hip thrust — 3×10', 'Calf raises — 4×12'] },
      { day: 'Fri', title: 'Upper Power',        items: ['Push press — 5×3 @ 75% (max intent)', 'Weighted dip — 4×6', 'Med ball chest pass — 4×5', 'Pull-aparts — 3×20'] },
      { day: 'Sat', title: 'Active Recovery',    items: ['30 min Z2 bike', 'Mobility flow — 20 min', 'Foam roll posterior chain'] },
      { day: 'Sun', title: 'Rest',               items: ['Full rest', 'Optional walk'] },
    ],
  },
  kpis: [
    { name: 'Standing vertical',   baseline: '28"',     target: '34"',    measured: 'Week 1, 8, 16' },
    { name: 'Broad jump',          baseline: '8\'2"',   target: '9\'2"',  measured: 'Week 1, 8, 16' },
    { name: '10m sprint',          baseline: '1.85s',   target: '1.72s',  measured: 'Week 1, 8, 16' },
    { name: 'Back squat 1RM',      baseline: '315 lb',  target: '365 lb', measured: 'Week 4, 8, 12, 16' },
  ],
};
