// Expected input:
// {
//   athlete_id, date_reported, area, side, severity, status, mechanism,
//   diagnosis, stage, notes
// }
// severity: 0-10, stage: "acute"|"subacute"|"rtp" etc.

export function normalizeInjury(form) {
  const today = new Date();
  const date = form.date_reported || new Date().toISOString().split("T")[0];
  const daysSince =
    Math.max(
      0,
      Math.floor(
        (today - new Date(date)) / (1000 * 60 * 60 * 24)
      )
    );

  // Simple risk estimate: severity + stage weighting
  const sev = clamp(parseFloat(form.severity));
  const stageW = form.stage === "acute" ? 1.0 : form.stage === "subacute" ? 0.6 : 0.3;
  const riskScore = +(sev * stageW).toFixed(1);
  const riskBand = riskScore >= 7 ? "High" : riskScore >= 4 ? "Moderate" : "Low";

  return {
    normalized: {
      athleteId: form.athlete_id || "",
      dateReported: date,
      area: form.area || "",
      side: form.side || "N/A",
      severity: sev,
      status: form.status || "ongoing",
      mechanism: form.mechanism || "",
      diagnosis: form.diagnosis || "",
      stage: form.stage || "acute",
      notes: form.notes || "",
    },
    metrics: {
      daysSince,
      riskScore,
      riskBand,
    },
  };
}

export function makeInjuryRecommendations({ riskBand, stage, area }) {
  const badges = [riskBand];
  const plan = [];

  if (stage === "acute") {
    plan.push("Load management (24–72h), pain-modulated ROM, isometrics");
  } else if (stage === "subacute") {
    plan.push("Gradual load, eccentrics, movement quality, address deficits");
  } else {
    plan.push("Return-to-play progressions, reactive strength, sport-specific");
  }

  if (area.toLowerCase().includes("hamstring")) {
    plan.push("Nordic curls, high-speed running exposure when pain-free");
  }
  if (area.toLowerCase().includes("ankle")) {
    plan.push("Ankle DF mobs, balance/proprioception, hopping progressions");
  }

  return { badges, plan };
}

function clamp(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, n));
}
