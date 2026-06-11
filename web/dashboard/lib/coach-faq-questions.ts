/**
 * Universal "Is this for you?" questions, identical across all coaches.
 *
 * Each coach answers these in their own voice (see `Coach.faqAnswers` on
 * `lib/coaches.ts`). Length of `faqAnswers` MUST equal the length of this
 * array. The display order on the profile page matches this order.
 *
 * Job to be done: help a user comparison-shopping across coaches decide
 * whether THIS coach is the right fit. Keeping the questions identical makes
 * coach-to-coach comparison possible.
 */
export const UNIVERSAL_FAQ_QUESTIONS = [
  "What kind of training is this?",
  "Who is this for?",
  "What will I get out of 12-18 weeks of this?",
  "What do I need to commit to (time, workouts, equipment)?",
] as const;
