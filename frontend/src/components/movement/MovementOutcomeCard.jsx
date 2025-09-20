import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from "recharts";

/**
 * Props:
 * - normalized, metrics from computeMovementMetrics
 * - recommendations from makeMovementRecommendations
 * - onSave?: (payload) => void
 */
export default function MovementOutcomeCard({ normalized, metrics, recommendations, onSave }) {
  const chartData = Object.entries(metrics.byCategory).map(([k, v]) => ({
    Category: pretty(k),
    Fails: v,
  }));

  const payload = { ...normalized, ...metrics, recommendations };

  return (
    <div className="rounded-2xl border p-5 shadow-sm space-y-5 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Movement Assessment Summary</h3>
          <p className="text-xs text-muted-foreground">Date: {normalized.date}</p>
        </div>
        {onSave && (
          <button
            className="px-3 py-2 text-sm rounded-xl bg-black text-white hover:opacity-90"
            onClick={() => onSave(payload)}
          >
            Save Movement
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ul className="col-span-2 space-y-2 text-sm">
          <li>❌ <span className="font-medium">Total Fails:</span> {metrics.totalFails}</li>
          <li>🚩 <span className="font-medium">Red Flags:</span> {metrics.redFlags.length ? metrics.redFlags.join(", ") : "None"}</li>
          <li>📌 <span className="font-medium">Top Issues:</span> {metrics.topIssues.map(i => i.label).join(", ") || "—"}</li>
        </ul>

        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="Category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Fails" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h4 className="font-semibold mb-2">Recommendations</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {recommendations.badges.map((b) => (
            <span key={b} className="text-xs px-2 py-1 rounded-full border">{b}</span>
          ))}
        </div>
        <div className="text-sm space-y-1">
          <div><span className="font-medium">Focus Areas:</span> {recommendations.focusAreas.join(", ") || "—"}</div>
          <ul className="list-disc pl-5">
            {recommendations.plan.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        {normalized.notes && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">Notes</div>
            <div className="rounded-lg border p-3 bg-gray-50">{normalized.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function pretty(k) {
  return k
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}
