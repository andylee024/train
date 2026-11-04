import { normalizeName } from "./lifts";

const TOUCH_EXERCISE = /approach touch|touch height|rim touch/;
const JUMP_WORK = /approach jumps?|depth jumps?|broad jumps?|vertical jumps?|pogo|dunk|box jump/;

/** Inches from a touch-height note. Box heights are not touch heights. */
export function parseTouchInches(note: string, exerciseName: string): number | null {
  const named = TOUCH_EXERCISE.test(normalizeName(exerciseName));
  if (/box/i.test(note) && !/touch/i.test(note)) return null;

  const feetAndInches = note.match(/(\d+)\s*'\s*(\d+(?:\.\d+)?)/);
  if (feetAndInches) {
    const inches = Number(feetAndInches[1]) * 12 + Number(feetAndInches[2]);
    if (inches >= 48 && inches <= 180) return inches;
  }

  const feet = note.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet)\b/i);
  if (feet) {
    const inches = Number(feet[1]) * 12;
    if (inches >= 48 && inches <= 180) return inches;
  }

  const spelled = note.match(/(\d+(?:\.\d+)?)\s*(?:inches|inch|in)\b/i);
  if (spelled) {
    const inches = Number(spelled[1]);
    if (inches >= 48 && inches <= 180) return inches;
  }

  const quoted = note.match(/(\d+(?:\.\d+)?)\s*"/);
  if (quoted && !/box/i.test(note)) {
    const inches = Number(quoted[1]);
    if (inches >= 48 && inches <= 180) return inches;
  }

  if (named) {
    const bare = note.match(/\b(\d{2,3}(?:\.\d+)?)\b/);
    if (bare) {
      const inches = Number(bare[1]);
      if (inches >= 48 && inches <= 180) return inches;
    }
  }

  return null;
}

/** True for jump and approach work, not for loaded jump squats. */
export function isJumpWork(name: string): boolean {
  return JUMP_WORK.test(name.toLowerCase());
}
