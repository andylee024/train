/**
 * Coach profile extras layered on top of `coach-profiles.ts`:
 * - whatYoullGain: 3-4 concrete attribute bullets (sales copy)
 *
 * Testimonials were dropped — no real source for them, and fabricating
 * quotes under a real coach's name is a trust violation. Re-introduce
 * only when we have a way to source real athlete feedback.
 */

export type CoachExtras = {
  whatYoullGain: string[];
};

export const COACH_EXTRAS: Record<string, CoachExtras> = {
  "catalyst-athletics": {
    whatYoullGain: [
      "Snatch + clean & jerk technique that holds up as load climbs",
      "Triple-extension power expressible in jumps, sprints, and sport movements",
      "A periodization model proven across Olympic-level competitors",
      "Vocabulary to reason about strength qualities — fitness vs fatigue, ESD vs absolute strength",
    ],
  },
  "dylan-shannon": {
    whatYoullGain: [
      "Speed + size built in parallel — no choosing between athletic and aesthetic",
      "Sprint and jump capacity that translates to field/court performance",
      "A weekly rhythm that covers all four pillars without burning recovery",
      "Density set protocols (14-min clocks, EMOM) that drive strength + hypertrophy together",
    ],
  },
};

export function getExtras(id: string): CoachExtras | undefined {
  return COACH_EXTRAS[id];
}
