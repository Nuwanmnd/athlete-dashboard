// frontend/src/pages/NewAssessment.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";
import AssessmentOutcomeCard from "@/components/assessment/AssessmentOutcomeCard";
import {
  computeAssessmentMetrics,
  makeRecommendations,
} from "@/utils/assessmentMetrics";

// ---------------- helpers ----------------
const ageFromDOB = (dob) => {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(+d)) return "";
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return String(a);
};

// Lightweight confirm modal
function ConfirmModal({ open, onClose, onConfirm, data }) {
  if (!open) return null;
  const { athleteName, metrics, normalized, recs, coach_comment } = data || {};
  const ratioL = metrics?.ratio?.left ?? "—";
  const ratioR = metrics?.ratio?.right ?? "—";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white border shadow-xl overflow-hidden">
        <div className="px-5 py-3 border-b">
          <h3 className="font-semibold">Confirm Assessment Save</h3>
          <div className="text-xs text-gray-500">Athlete: {athleteName}</div>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-auto text-sm">
          <section>
            <h4 className="font-semibold mb-2">Live Summary</h4>
            <ul className="space-y-1">
              <li>
                <span className="text-gray-500">Date</span>:{" "}
                {normalized?.date || "—"}
              </li>
              <li>
                <span className="text-gray-500">Target Force</span>:{" "}
                {metrics?.targetForce ?? metrics?.target ?? "—"} N
              </li>
              <li>
                <span className="text-gray-500">% Below Target</span>: L{" "}
                {metrics?.percentBelow?.left ?? "—"}% • R{" "}
                {metrics?.percentBelow?.right ?? "—"}%
              </li>
              <li>
                <span className="text-gray-500">CMP/CMF Ratio</span>: L {ratioL}{" "}
                • R {ratioR}
              </li>
              <li>
                <span className="text-gray-500">Performance Goal</span>:{" "}
                {normalized?.goal || "—"}
              </li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold mb-2">Muscle Group Analysis</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3">
                <div className="font-medium mb-1">Left Leg</div>
                <div>Ratio: {ratioL}</div>
                <div>% Below: {metrics?.percentBelow?.left ?? "—"}%</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="font-medium mb-1">Right Leg</div>
                <div>Ratio: {ratioR}</div>
                <div>% Below: {metrics?.percentBelow?.right ?? "—"}%</div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold mb-2">Recommendations</h4>
            {recs?.length ? (
              <ul className="list-disc pl-5 space-y-1">
                {recs.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No recommendations.</div>
            )}
          </section>

          <section>
            <h4 className="font-semibold mb-2">Coach Comments</h4>
            <div className="rounded-xl border p-3 whitespace-pre-wrap">
              {coach_comment || (
                <span className="text-gray-500">No comments.</span>
              )}
            </div>
          </section>
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white"
            onClick={onConfirm}
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- page ----------------
export default function NewAssessment() {
  const location = useLocation();

  const [athletes, setAthletes] = useState([]);
  const [form, setForm] = useState({
    athlete_id: "",
    age: "",
    weight: "",
    cmf_left: "",
    cmf_right: "",
    cmp_left: "",
    cmp_right: "",
    custom_target: "",
    goal: "",
    coach_comment: "",
    date: new Date().toISOString().split("T")[0], // editable now
  });

  // outcome holds { normalized, metrics, recommendations }
  const [outcome, setOutcome] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState([]);

  // modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // --- Prefill athlete from query ?athlete=ID ---
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const aid = sp.get("athlete");
    if (aid) setForm((p) => ({ ...p, athlete_id: aid }));
  }, [location.search]);

  // --- Fetch all athletes on mount ---
  useEffect(() => {
    fetch("/api/athletes/")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, []);

  // --- When athlete changes: fetch history + auto-fill age if DOB is known ---
  useEffect(() => {
    const id = form.athlete_id;
    if (!id) {
      setHistory([]);
      return;
    }
    // auto age
    const a = athletes.find((x) => String(x.id) === String(id));
    const derivedAge = a?.date_of_birth ? ageFromDOB(a.date_of_birth) : "";
    if (derivedAge && derivedAge !== form.age) {
      setForm((prev) => ({ ...prev, age: derivedAge }));
    }

    // history
    fetch(`/api/assessments/athlete/${id}`)
      .then((res) => res.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [form.athlete_id, athletes]); // eslint-disable-line

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Calculate metrics using util + make recs (drives graph card)
  const handleCalculate = () => {
    const computed = computeAssessmentMetrics(form);
    const recs = makeRecommendations({
      ratio: computed.metrics.ratio,
      percentBelow: computed.metrics.percentBelow,
      goal: computed.normalized.goal,
    });
    setOutcome({ ...computed, recommendations: recs });
    setShowResults(true);
  };

  // Build payload for backend (saves ALL raw inputs + computed)
  const buildPayload = () => {
    if (!outcome) return null;
    const { normalized, metrics, recommendations } = outcome;
    return {
      // raw / normalized inputs
      athlete_id: form.athlete_id,
      date: normalized.date, // from editable Date field
      age: normalized.age,
      weight: normalized.weight,
      cmf_left: normalized.cmf.left,
      cmf_right: normalized.cmf.right,
      cmp_left: normalized.cmp.left,
      cmp_right: normalized.cmp.right,
      custom_target: form.custom_target ? parseFloat(form.custom_target) : null,
      goal: form.goal,
      coach_comment: form.coach_comment,

      // computed values to persist
      ratio_left: metrics.ratio.left,
      ratio_right: metrics.ratio.right,
      recommendation_summary: JSON.stringify(recommendations),

      // optional extras (safe for API to ignore)
      target_force: metrics.target,
      deficit_left: metrics.deficit.left,
      deficit_right: metrics.deficit.right,
      percent_below_left: metrics.percentBelow.left,
      percent_below_right: metrics.percentBelow.right,
    };
  };

  // POST save (called after confirmation)
  const doSave = async () => {
    const payload = buildPayload();
    if (!payload) return;

    await fetch("/api/assessments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setConfirmOpen(false);
    alert("Assessment saved successfully!");

    // Clear only notes; keep inputs so they can iterate quickly
    setForm((prev) => ({ ...prev, coach_comment: "" }));
    setShowResults(false);
    setOutcome(null);

    // refresh history
    if (form.athlete_id) {
      fetch(`/api/assessments/athlete/${form.athlete_id}`)
        .then((res) => res.json())
        .then(setHistory)
        .catch(() => {});
    }
  };

  // Selected athlete name for modal header
  const athleteName = useMemo(() => {
    const a = athletes.find((x) => String(x.id) === String(form.athlete_id));
    return a ? `${a.first_name} ${a.last_name}`.trim() : "Athlete";
  }, [athletes, form.athlete_id]);

  return (
    <>
      <PageHeader
        title="New Assessment"
        subtitle="Record CMP/CMF values, calculate metrics, and save results."
      />

      <div className="max-w-4xl space-y-section">
        {/* ---- Form Card ---- */}
        <Card>
          <CardHeader
            title="Assessment Details"
            meta="Select athlete and enter raw values"
          />
          <CardContent>
            {/* Only 'Calculate Metrics' here; Save happens in Coach Notes with confirm */}
            <form
              className="space-y-section"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="label">Athlete</label>
                  <select
                    name="athlete_id"
                    value={form.athlete_id}
                    onChange={handleChange}
                    required
                    className="field mt-1 px-3 py-2"
                  >
                    <option value="">Select Athlete</option>
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.first_name} {a.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Age</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                    placeholder="Auto-filled if DOB is known"
                    required
                  />
                </div>

                <div>
                  <label className="label">Weight (lbs)</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                    required
                  />
                </div>
              </div>

              {/* Date sits 'next to' weight on the same row for md and up */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-start-3">
                  <label className="label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">CMF Left (N)</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="cmf_left"
                    value={form.cmf_left}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="label">CMF Right (N)</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="cmf_right"
                    value={form.cmf_right}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="label">CMP Left (N)</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="cmp_left"
                    value={form.cmp_left}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="label">CMP Right (N)</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="cmp_right"
                    value={form.cmp_right}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Custom Target Force (optional, N)
                </label>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="custom_target"
                  value={form.custom_target}
                  onChange={handleChange}
                  className="field mt-1 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Performance Focus</label>
                  <select
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    className="field mt-1 px-3 py-2"
                  >
                    <option value="">Select goal</option>
                    <option value="return_sport">Return to Sport</option>
                    <option value="improve_explosiveness">
                      Improve Explosiveness
                    </option>
                    <option value="rehab">Injury Rehab</option>
                    <option value="power_building">Power Building</option>
                  </select>
                </div>

                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    onClick={handleCalculate}
                    className="btn-outline"
                  >
                    Calculate Metrics
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ---- Results (keeps your graph + recs) ---- */}
        {showResults && outcome && (
          <>
            <Card>
              <CardHeader
                title="Auto-calculated Metrics"
                meta="Ratios, target force, deficits"
              />
              <CardContent>
                <AssessmentOutcomeCard
                  normalized={outcome.normalized}
                  metrics={outcome.metrics}
                  recommendations={outcome.recommendations}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Coach Notes" />
              <CardContent>
                <label className="label">Notes</label>
                <textarea
                  name="coach_comment"
                  placeholder="Coach Notes"
                  value={form.coach_comment}
                  onChange={handleChange}
                  className="field mt-1 px-3 py-2 w-full"
                  rows={4}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="btn-outline"
                    type="button"
                    onClick={() => setShowResults(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    disabled={!outcome}
                    title={!outcome ? "Calculate first" : "Save assessment"}
                  >
                    Save Assessment
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* ---- History (compute ratios if missing) ---- */}
        {form.athlete_id && history.length > 0 && (
          <Card>
            <CardHeader
              title="Previous Assessments"
              meta="For the selected athlete"
            />
            <CardContent>
              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full text-sm">
                  <thead className="bg-base-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Goal</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Ratios
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Coach Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr:nth-child(even)]:bg-base-muted/30">
                    {history.map((h) => {
                      let rl = h.ratio_left;
                      let rr = h.ratio_right;
                      if (rl == null || rr == null) {
                        try {
                          const c = computeAssessmentMetrics({
                            athlete_id: h.athlete_id,
                            date: h.date,
                            age: h.age ?? "",
                            weight: h.weight ?? "",
                            cmf_left: h.cmf_left ?? "",
                            cmf_right: h.cmf_right ?? "",
                            cmp_left: h.cmp_left ?? "",
                            cmp_right: h.cmp_right ?? "",
                            custom_target: h.custom_target ?? "",
                            goal: h.goal ?? "",
                            coach_comment: h.coach_comment ?? "",
                          });
                          rl = c.metrics.ratio.left;
                          rr = c.metrics.ratio.right;
                        } catch {}
                      }
                      return (
                        <tr key={h.id}>
                          <td className="px-4 py-3">{h.date}</td>
                          <td className="px-4 py-3">{h.goal || "—"}</td>
                          <td className="px-4 py-3">
                            {rl != null && rr != null
                              ? `L ${rl} / R ${rr}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {h.coach_comment || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSave}
        data={
          outcome && {
            athleteName,
            metrics: outcome.metrics,
            normalized: outcome.normalized,
            recs: outcome.recommendations,
            coach_comment: form.coach_comment,
          }
        }
      />
    </>
  );
}
