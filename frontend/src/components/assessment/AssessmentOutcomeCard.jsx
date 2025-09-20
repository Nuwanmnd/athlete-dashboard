// frontend/src/components/assessment/AssessmentOutcomeCard.jsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Props:
 * - normalized: {
 *     athleteId, date, age, weight,
 *     cmf: {left,right}, cmp: {left,right}, goal, coachNotes
 *   }
 * - metrics: { target, deficit:{left,right}, percentBelow:{left,right}, ratio:{left,right} }
 * - recommendations: { badges: string[], notes: {left:string[], right:string[]}, goal: string }
 * - onSave?: (payload) => void  // optional
 */
export default function AssessmentOutcomeCard({
  normalized,
  metrics,
  recommendations,
  onSave,
}) {
  const chartData = [
    { side: "Left Leg", Ratio: metrics.ratio.left },
    { side: "Right Leg", Ratio: metrics.ratio.right },
  ];

  const payload = {
    ...normalized,
    ...metrics,
    recommendations,
  };

  return (
    <div className="rounded-2xl border p-5 shadow-sm space-y-5 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Auto-calculated Metrics</h3>
          <p className="text-xs text-muted-foreground">
            Date: {normalized.date}
          </p>
        </div>
        {onSave && (
          <button
            className="px-3 py-2 text-sm rounded-xl bg-black text-white hover:opacity-90"
            onClick={() => onSave(payload)}
          >
            Save Assessment
          </button>
        )}
      </div>

      {/* Metrics + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ul className="col-span-2 space-y-2 text-sm">
          <li>
            🎯 <span className="font-medium">Target Force:</span>{" "}
            {metrics.target.toFixed(0)} N
          </li>
          <li>
            ↘️ <span className="font-medium">Force Deficit:</span> L{" "}
            {metrics.deficit.left.toFixed(1)} N / R{" "}
            {metrics.deficit.right.toFixed(1)} N
          </li>
          <li>
            % <span className="font-medium">% Below Target:</span> L{" "}
            {metrics.percentBelow.left}% / R {metrics.percentBelow.right}%
          </li>
          <li>
            ⚖️ <span className="font-medium">CMP/CMF Ratio:</span> L{" "}
            {metrics.ratio.left} / R {metrics.ratio.right}
          </li>
          <li>
            🏁 <span className="font-medium">Performance Goal:</span>{" "}
            {recommendations.goal}
          </li>
        </ul>

        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="side" />
              <YAxis
                domain={[
                  0,
                  Math.max(1.2, metrics.ratio.left, metrics.ratio.right),
                ]}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="Ratio" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations & Notes */}
      <div className="rounded-xl border p-4">
        <h4 className="font-semibold mb-2">Recommendations</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {recommendations.badges.map((b) => (
            <span key={b} className="text-xs px-2 py-1 rounded-full border">
              {b}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">Left Leg</div>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.notes.left.map((n, i) => (
                <li key={`L-${i}`}>{n}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-medium mb-1">Right Leg</div>
            <ul className="list-disc pl-5 space-y-1">
              {recommendations.notes.right.map((n, i) => (
                <li key={`R-${i}`}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
        {normalized.coachNotes && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">
              Coach Notes
            </div>
            <div className="rounded-lg border p-3 bg-gray-50">
              {normalized.coachNotes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
