import React from "react";

/**
 * Props:
 * - normalized, metrics from normalizeInjury
 * - recommendations from makeInjuryRecommendations
 * - onSave?: (payload) => void
 */
export default function InjurySummaryCard({
  normalized,
  metrics,
  recommendations,
  onSave,
}) {
  const payload = { ...normalized, ...metrics, recommendations };

  return (
    <div className="rounded-2xl border p-5 shadow-sm space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Injury Summary</h3>
          <p className="text-xs text-muted-foreground">
            Reported: {normalized.dateReported}
          </p>
        </div>
        {onSave && (
          <button
            className="px-3 py-2 text-sm rounded-xl bg-black text-white hover:opacity-90"
            onClick={() => onSave(payload)}
          >
            Save Injury
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div>
            <span className="font-medium">Area:</span> {normalized.area} (
            {normalized.side})
          </div>
          <div>
            <span className="font-medium">Diagnosis:</span>{" "}
            {normalized.diagnosis || "—"}
          </div>
          <div>
            <span className="font-medium">Mechanism:</span>{" "}
            {normalized.mechanism || "—"}
          </div>
        </div>
        <div>
          <div>
            <span className="font-medium">Stage:</span>{" "}
            {pretty(normalized.stage)}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            {pretty(normalized.status)}
          </div>
          <div>
            <span className="font-medium">Severity:</span> {normalized.severity}
            /10
          </div>
        </div>
        <div>
          <div>
            <span className="font-medium">Days Since:</span> {metrics.daysSince}
          </div>
          <div>
            <span className="font-medium">Risk:</span> {metrics.riskBand} (
            {metrics.riskScore})
          </div>
          <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black"
              style={{ width: `${(metrics.riskScore / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h4 className="font-semibold mb-2">Recommendations</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {recommendations.badges.map((b) => (
            <span key={b} className="text-xs px-2 py-1 rounded-full border">
              {b}
            </span>
          ))}
        </div>
        <ul className="list-disc pl-5 text-sm">
          {recommendations.plan.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>

        {normalized.notes && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">Notes</div>
            <div className="rounded-lg border p-3 bg-gray-50">
              {normalized.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function pretty(s) {
  return s ? s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "—";
}
