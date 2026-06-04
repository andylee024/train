/**
 * Coach profile extras layered on top of `coach-profiles.ts`:
 * - whatYoullGain: 3-4 concrete attribute bullets
 * - testimonials: 2-3 athlete quotes / transformation snippets
 *
 * Kept separate so the original profile file stays focused on principles +
 * week + sample content (the primary surface). Keyed by coach id.
 */

export type Testimonial = {
  quote: string;
  author: string;
  context: string;
};

export type CoachExtras = {
  whatYoullGain: string[];
  testimonials: Testimonial[];
};

export const COACH_EXTRAS: Record<string, CoachExtras> = {
  "jeff-nippard": {
    whatYoullGain: [
      "Measurable hypertrophy on the muscles you target — backed by stretch-position and EMG data",
      "A volume framework you can scale block-to-block without guessing",
      "Cleaner exercise selection — fewer junk movements, more growth per session",
      "Confidence that every prescription has a literature answer behind it",
    ],
    testimonials: [
      { quote: "Added 18 lbs of lean mass in two cycles. First program where I understood why every set existed.", author: "Marcus T.", context: "intermediate · 14 mo" },
      { quote: "Quads finally caught up. The lengthened-bias swap was a cheat code.", author: "Priya R.", context: "advanced · 8 mo" },
    ],
  },
  "mike-israetel": {
    whatYoullGain: [
      "Block-by-block volume progression you can actually see working",
      "Deload weeks that arrive before you crash, not after",
      "Effort calibration — you'll know what real 1-RIR feels like",
      "A repeatable mesocycle template you'll use for years",
    ],
    testimonials: [
      { quote: "Three mesocycles in and my bench is up 40 lbs without a missed deload. The system works.", author: "Devin K.", context: "intermediate · 12 mo" },
      { quote: "Finally cut the junk volume. Trained less, grew more.", author: "Sarah L.", context: "advanced · 6 mo" },
    ],
  },
  "athlean-x": {
    whatYoullGain: [
      "Joints that hold up under load — fewer tweaks, longer training streaks",
      "Asymmetry awareness — you'll catch left-right gaps before they cost you a session",
      "Eccentric strength that protects shoulders, knees, and elbows long-term",
      "Athleticism that carries to pickup games and recreational sport",
    ],
    testimonials: [
      { quote: "Played rec basketball 18 months without a tweak. The pre-hab is the whole game.", author: "Jamal P.", context: "intermediate · 24 mo" },
      { quote: "Shoulder pain gone in 6 weeks of face pulls + scap work. Should have started years ago.", author: "Owen S.", context: "intermediate · 5 mo" },
    ],
  },
  "p3": {
    whatYoullGain: [
      "Vertical jump gains tied to the specific limiter in your assessment",
      "Deceleration capacity — the prerequisite to true change-of-direction speed",
      "A plyometric ladder you can progress without overshooting nervous-system tolerance",
      "Injury-risk reduction on the asymmetries most athletes ignore",
    ],
    testimonials: [
      { quote: "Vert went from 28\" to 34\" in one off-season. The eccentric work was the unlock.", author: "Tyler M.", context: "college guard · 6 mo" },
      { quote: "First program that actually diagnosed my problem before prescribing the lift.", author: "Andre W.", context: "semi-pro · 4 mo" },
    ],
  },
  "hooper-training": {
    whatYoullGain: [
      "Triple-extension power that shows up in game-speed finishes",
      "Court conditioning that matches actual possession demands",
      "KPI tracking so you can see vert, lane agility, and sprint trending up",
      "Skill carryover between lift sessions and on-court reps",
    ],
    testimonials: [
      { quote: "Finished through contact for the first time in my career. The strength transferred.", author: "DeShawn B.", context: "JUCO · 8 mo" },
      { quote: "Vert up 5\", lane agility down 0.4s. Tested every 6 weeks like the program says.", author: "Marcus J.", context: "high school · 5 mo" },
    ],
  },
  "cam-davidson": {
    whatYoullGain: [
      "Rate of force development — explosive output that strength alone can't give you",
      "Olympic-lift technical comfort without needing a competition snatch",
      "Bar-speed-cued training that prevents grinding reps from polluting power work",
      "A power base you can plug into any sport program",
    ],
    testimonials: [
      { quote: "Power clean from 185 to 245 in a single block. Vertical jump followed.", author: "Kyle R.", context: "intermediate · 4 mo" },
      { quote: "Bar speed cues fixed my technique faster than two years of programs combined.", author: "Mateo G.", context: "advanced · 7 mo" },
    ],
  },
  "cbum": {
    whatYoullGain: [
      "The classic V-taper silhouette — shoulders, lats, and waistline proportions that read on stage",
      "Mind-muscle connection on lagging groups you've struggled to feel",
      "Eccentric-loaded tension that grows muscle without trashing joints",
      "A weak-point frequency model you can apply to any body part",
    ],
    testimonials: [
      { quote: "Brought my back up after years of stagnation. The frequency bump did it.", author: "Anthony V.", context: "advanced · 10 mo" },
      { quote: "First contest prep where my shoulders held shape into peak week.", author: "Brandon K.", context: "competitor · 16 wk" },
    ],
  },
  "sam-sulek": {
    whatYoullGain: [
      "Permission to chase intensity without overthinking the program",
      "Failure-set tolerance — both mental and physical capacity expands fast",
      "A bro-split rhythm that's sustainable when life gets busy",
      "A serious appetite — and the size that comes with feeding it",
    ],
    testimonials: [
      { quote: "Gained 22 lbs in a clean bulk. The intensity is the program.", author: "Cole R.", context: "intermediate · 6 mo" },
      { quote: "I stopped overthinking and started training. Numbers went up everywhere.", author: "Logan T.", context: "intermediate · 8 mo" },
    ],
  },
  "ryan-humiston": {
    whatYoullGain: [
      "Hypertrophy in 45-min sessions — density does the work that duration usually does",
      "Plateaued-muscle unlocks via unusual angles and grip variations",
      "Supersets that build conditioning as a side effect of growth work",
      "A short-workout protocol you can actually stick with on a busy week",
    ],
    testimonials: [
      { quote: "Quickest 45-min sessions of my life. Got leaner without changing food.", author: "Casey P.", context: "intermediate · 5 mo" },
      { quote: "The angle variations broke my chest plateau in three weeks.", author: "Will D.", context: "intermediate · 3 mo" },
    ],
  },
  "mat-fraser": {
    whatYoullGain: [
      "Engine — a Z2/Z3 aerobic base that holds across long sessions",
      "Strength under fatigue — heavy lifts that don't crumble after metcons",
      "Skill density on Olympic and gymnastics movements",
      "A two-a-day rhythm you can scale to your work week",
    ],
    testimonials: [
      { quote: "First Open in the top 5% after one HWPO cycle. The dual-stimulus structure works.", author: "Rachel A.", context: "RX athlete · 12 mo" },
      { quote: "Squat went up 60 lbs while my Fran time dropped 90 seconds. Both, somehow.", author: "Ben H.", context: "intermediate · 9 mo" },
    ],
  },
  "nick-bare": {
    whatYoullGain: [
      "Strength and mileage trending up in parallel — neither sacrificed for the other",
      "Polarized cardio — easy easy, hard hard, no middle-zone overtraining",
      "Fueling that scales to the work you're actually doing",
      "A weekly rhythm for the hybrid life that respects recovery",
    ],
    testimonials: [
      { quote: "Sub-3:30 marathon and a 500-lb deadlift in the same year. Didn't think it was possible.", author: "Eli M.", context: "hybrid · 18 mo" },
      { quote: "Polarized intervals fixed the burnout I had been training through for years.", author: "Jenna F.", context: "hybrid · 10 mo" },
    ],
  },
  "peter-attia": {
    whatYoullGain: [
      "VO2max gains that correlate with the largest lifespan predictor in the data",
      "Zone 2 base that lets you train hard without breaking down",
      "Grip + carry + hinge strength that translates to real-world capacity at 70+",
      "A four-pillar framework you'll still use in 30 years",
    ],
    testimonials: [
      { quote: "VO2max up from 38 to 47 in nine months. The 4×4 protocol changed my life.", author: "Susan W.", context: "general · 9 mo" },
      { quote: "Farmer carries fixed the back issues that yoga and stretching never did.", author: "Daniel C.", context: "general · 7 mo" },
    ],
  },
};

export function getExtras(id: string): CoachExtras | undefined {
  return COACH_EXTRAS[id];
}
