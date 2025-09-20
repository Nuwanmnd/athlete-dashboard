// frontend/src/utils/assessmentMetrics.js

/**
 * Input form shape (strings are OK; we parse safely):
 * {
 *   athlete_id, age, weight,
 *   cmf_left, cmf_right, cmp_left, cmp_right,
 *   custom_target, goal, coach_comment, date
 * }
 */

const clampNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export function computeAssessmentMetrics(form) {
  const weight = clampNumber(form.weight);
  const cmfL = clampNumber(form.cmf_left);
  const cmfR = clampNumber(form.cmf_right);
  const cmpL = clampNumber(form.cmp_left);
  const cmpR = clampNumber(form.cmp_right);
  const customTarget = clampNumber(form.custom_target);
  const age = parseInt(form.age || "0", 10);

  // Simple target example (your current logic in NewAssessment uses a formula);
  // keep the same idea but centralized here:
  const target = customTarget || Math.round(weight * 6.68); // example: 6.68 * bodyweight

  const deficitL = Math.max(0, target - cmfL);
  const deficitR = Math.max(0, target - cmfR);

  const pctL = target > 0 ? +( (deficitL / target) * 100 ).toFixed(1) : 0;
  const pctR = target > 0 ? +( (deficitR / target) * 100 ).toFixed(1) : 0;

  const ratioL = cmfL > 0 ? +(cmpL / cmfL).toFixed(2) : 0;
  const ratioR = cmfR > 0 ? +(cmpR / cmfR).toFixed(2) : 0;

  return {
    normalized: {
      athleteId: form.athlete_id || "",
      date: form.date || new Date().toISOString().split("T")[0],
      age,
      weight,
      cmf: { left: cmfL, right: cmfR },
      cmp: { left: cmpL, right: cmpR },
      goal: form.goal || "",
      coachNotes: form.coach_comment || "",
    },
    metrics: {
      target,
      deficit: { left: deficitL, right: deficitR },
      percentBelow: { left: pctL, right: pctR },
      ratio: { left: ratioL, right: ratioR },
    },
  };
}

/** Very lightweight recommendation rules (you can replace with your existing file later) */
export function makeRecommendations({ ratio, percentBelow, goal }) {
  const badges = [];
  const notes = { left: [], right: [] };

  const side = (k) => ({
    strength: ratio[k] >= 1 ? "meets power expectations" : "needs more power",
    deficit:
      percentBelow[k] > 25
        ? "significant force deficit"
        : percentBelow[k] > 10
        ? "moderate force deficit"
        : "on track",
  });

  const L = side("left");
  const R = side("right");

  notes.left.push(L.strength, L.deficit);
  notes.right.push(R.strength, R.deficit);

  if (ratio.left >= 1 && ratio.right >= 1 && percentBelow.left < 10 && percentBelow.right < 10) {
    badges.push("Excellent");
  } else if (percentBelow.left > 25 || percentBelow.right > 25) {
    badges.push("High Deficit");
  } else {
    badges.push("Improving");
  }

  return { badges, notes, goal: goal || "—" };
}
