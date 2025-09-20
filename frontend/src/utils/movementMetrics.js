// Normalized input shape we expect:
// {
//   athlete_id, date, notes,
//   tests: {
//     standing: { "Toes Turn Out": true/false, "Knee Valgus": true/false, ... },
//     splitDF:  { ... },
//     overhead: { ... },
//   }
// }

export function computeMovementMetrics(form) {
  const date = form.date || new Date().toISOString().split("T")[0];

  const catNames = Object.keys(form.tests || {});
  const counts = {};
  let totalFails = 0;

  catNames.forEach((cat) => {
    const items = form.tests[cat] || {};
    const failCount = Object.values(items).filter(Boolean).length;
    counts[cat] = failCount;
    totalFails += failCount;
  });

  // simple red-flag heuristic (you can extend later)
  const RED_FLAGS = new Set([
    "Knee Valgus",
    "Contralateral Hip Drop",
    "Excessive Lumbar Lordosis",
  ]);

  const redFlagsFound = [];
  Object.entries(form.tests || {}).forEach(([cat, items]) => {
    Object.entries(items || {}).forEach(([label, failed]) => {
      if (failed && RED_FLAGS.has(label)) redFlagsFound.push(label);
    });
  });

  // top issues (by frequency across cats)
  const issueScores = {};
  Object.values(form.tests || {}).forEach((items) => {
    Object.entries(items || {}).forEach(([label, failed]) => {
      if (!failed) return;
      issueScores[label] = (issueScores[label] || 0) + 1;
    });
  });

  const topIssues = Object.entries(issueScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, score]) => ({ label, score }));

  return {
    normalized: {
      athleteId: form.athlete_id || "",
      date,
      notes: form.notes || "",
      tests: form.tests || {},
    },
    metrics: {
      byCategory: counts,        // { standing: 3, splitDF: 1, overhead: 2, ... }
      totalFails,                // integer
      redFlags: redFlagsFound,   // array of strings
      topIssues,                 // [{label,score},...]
    },
  };
}

export function makeMovementRecommendations({ totalFails, redFlags, byCategory }) {
  const badges = [];
  if (redFlags.length >= 2) badges.push("High Risk");
  else if (totalFails >= 5) badges.push("Needs Work");
  else if (totalFails <= 1) badges.push("Solid");

  const focusAreas = Object.entries(byCategory)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const plan = [];
  if (focusAreas.includes("standing")) plan.push("Knee tracking, foot tripod, glute med activation");
  if (focusAreas.includes("splitDF")) plan.push("Ankle DF mobs, calf eccentrics, heel-elevated split squats");
  if (focusAreas.includes("overhead")) plan.push("T-spine extension, lat mobility, scap control");
  if (redFlags.length) plan.push(`Address red flags: ${redFlags.join(", ")}`);

  return { badges, focusAreas, plan };
}
