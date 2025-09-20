// frontend/src/pages/MovementAssessmentPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Textarea } from "@/components/Textarea";
import { Checkbox } from "@/components/Checkbox";

import MovementOutcomeCard from "@/components/movement/MovementOutcomeCard";
import {
  computeMovementMetrics,
  makeMovementRecommendations,
} from "@/utils/movementMetrics";

// ---- Tests & Mapping ----
const TESTS = {
  "Standing Test": [
    "Toes Turn Out",
    "Knee Valgus",
    "Thigh ADD/IR",
    "Hip Shift OBS",
    "Contralateral Hip Drop",
    "Anterior Pelvic Rotation",
    "Excessive Trunk Flexion",
    "Excessive Lumbar Lordosis",
  ],
  "Split DF Test": [
    "Toes Turn Out",
    "Knee Valgus",
    "Thigh ADD/IR",
    "Hip Shift OBS",
    "Contralateral Hip Drop",
    "Anterior Pelvic Rotation",
    "Excessive Trunk Flexion",
    "Excessive Lumbar Lordosis",
  ],
  "Squat Test": [
    "Toes Turn Out",
    "Knee Valgus",
    "Thigh ADD/IR",
    "Hip Shift OBS",
    "Contralateral Hip Drop",
    "Anterior Pelvic Rotation",
    "Excessive Trunk Flexion",
    "Excessive Lumbar Lordosis",
  ],
  "Single Leg Balance Test": [
    "Toes Turn Out",
    "Knee Valgus",
    "Thigh ADD/IR",
    "Hip Shift OBS",
    "Contralateral Hip Drop",
    "Anterior Pelvic Rotation",
    "Hip Hike",
  ],
  "Lunge Test": [
    "Toes Turn Out",
    "Knee Valgus",
    "Hip Shift OBS",
    "Contralateral Hip Drop",
    "Anterior Pelvic Rotation",
  ],
  "Thomas Test": [
    "Hip Flexor",
    "Hip Flexor/Quad",
    "ADD",
    "ABD",
    "ABD/Thigh ER",
    "Hip Ext",
  ],
  "HAT Test": [
    "FHP",
    "Forward GHJ",
    "Shoulder Hike",
    "Head Side Tilt",
    "Rounded Upper Back",
  ],
  "ROM Test": ["SLR", "Hip Flexion", "Hip IR", "Hip ER", "DF", "KF"],
};

const muscleMapping = {
  "Toes Turn Out": {
    over: ["Lateral Calf", "Anterior Tib", "Piriformis"],
    under: ["Medial Calf", "Posterior Tib", "Posterior Glute Med"],
  },
  "Knee Valgus": {
    over: ["Adductor Magnus"],
    under: ["Glute Med", "Piriformis"],
  },
  "Thigh ADD/IR": {
    over: ["Adductor Magnus", "TFL"],
    under: ["Glute Med", "Piriformis", "Glute Max"],
  },
  "Hip Shift OBS": {
    over: ["Adductor Magnus", "TFL"],
    under: ["Glute Med", "Piriformis", "Glute Max"],
  },
  "Contralateral Hip Drop": {
    over: ["Adductor Magnus"],
    under: ["Glute Med", "Piriformis", "Glute Max"],
  },
  "Anterior Pelvic Rotation": {
    over: ["Adductor Magnus", "TFL"],
    under: ["Glute Max", "Piriformis", "TVA"],
  },
  "Excessive Trunk Flexion": {
    over: ["Psoas", "QL", "Upper Quad", "Core"],
    under: ["Back Extensors", "Lat Dorsi", "Hamstring"],
  },
  "Excessive Lumbar Lordosis": {
    over: ["Psoas", "Lat Dorsi", "LBF"],
    under: ["TVA", "Hamstring"],
  },
  "Hip Hike": {
    over: ["TFL/ITB", "Piriformis", "Glute Med"],
    under: ["External Oblique", "Adductor"],
  },
};

// ---------- Confirm Modal ----------
// --- replace your ConfirmModal with this ---
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  computed,
  recs,
  over,
  under,
  selectedByTest,
  athleteName,
  comments,
}) {
  const [chartReady, setChartReady] = React.useState(false);

  // Wait a tick after opening so Recharts can measure the visible width
  React.useEffect(() => {
    if (!open) {
      setChartReady(false);
      return;
    }
    const id = requestAnimationFrame(() => setChartReady(true));
    return () => {
      cancelAnimationFrame(id);
      setChartReady(false);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3 border-b">
          <h3 className="font-semibold">Confirm Movement Assessment Save</h3>
          <div className="text-xs text-gray-500">Athlete: {athleteName || "—"}</div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-auto">
          {/* Full-width summary with chart */}
          <div className="rounded-2xl border p-3">
            {/* Make sure the parent has height so the chart has room */}
            <div className="w-full min-h-[360px]">
              {chartReady && (
                <MovementOutcomeCard
                  normalized={computed.normalized}
                  metrics={computed.metrics}
                  recommendations={recs}
                />
              )}
            </div>
          </div>

          {/* Details side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border p-3">
              <div className="font-semibold mb-2">Muscle Group Analysis</div>
              <div className="text-sm">
                <div className="mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs mr-2">
                    Overworking
                  </span>
                  {over.length ? over.join(", ") : "None"}
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs mr-2">
                    Underworking
                  </span>
                  {under.length ? under.join(", ") : "None"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-3">
              <div className="font-semibold mb-2">Checked Items</div>
              <div className="text-sm space-y-2">
                {Object.entries(selectedByTest).map(([test, items]) => (
                  <div key={test}>
                    <div className="font-medium">{test}</div>
                    <div className="text-gray-600">{items.length ? items.join(", ") : "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-3 lg:col-span-2">
              <div className="font-semibold mb-2">Comments</div>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-medium">Athlete:</span>{" "}
                  {comments.athlete || <span className="text-gray-500">—</span>}
                </div>
                <div>
                  <span className="font-medium">Coach:</span>{" "}
                  {comments.coach || <span className="text-gray-500">—</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button className="px-3 py-1.5 rounded-xl border hover:bg-gray-50" onClick={onClose}>
            Cancel
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-blue-600 text-white" onClick={onConfirm}>
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
}


// ---------- Page ----------
export default function MovementAssessmentPage() {
  const location = useLocation();

  const [athletes, setAthletes] = useState([]);
  const [athleteId, setAthleteId] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [selected, setSelected] = useState({});
  const [athleteComment, setAthleteComment] = useState("");
  const [coachComment, setCoachComment] = useState("");
  const [history, setHistory] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Prefill athlete from ?athlete=ID
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const aid = sp.get("athlete");
    if (aid) setAthleteId(aid);
  }, [location.search]);

  // Load athletes
  useEffect(() => {
    fetch("/api/athletes/")
      .then((res) => res.json())
      .then((data) =>
        setAthletes(
          data.map((a) => ({ ...a, name: `${a.first_name} ${a.last_name}` }))
        )
      )
      .catch((err) => console.error("Failed to fetch athletes", err));
  }, []);

  // Load history when athlete changes
  useEffect(() => {
    if (!athleteId) {
      setHistory([]);
      return;
    }
    fetch(`/api/movement-assessments/athlete/${athleteId}`)
      .then((res) => res.json())
      .then(setHistory)
      .catch((err) => console.error("Failed to load movement history", err));
  }, [athleteId]);

  const toggleCheckbox = (test, item) => {
    setSelected((prev) => {
      const current = prev[test] || [];
      const exists = current.includes(item);
      return {
        ...prev,
        [test]: exists ? current.filter((v) => v !== item) : [...current, item],
      };
    });
  };

  // Muscle analysis
  const analyzeMuscles = () => {
    const over = new Set();
    const under = new Set();
    Object.values(selected)
      .flat()
      .forEach((issue) => {
        if (muscleMapping[issue]) {
          muscleMapping[issue].over.forEach((m) => over.add(m));
          muscleMapping[issue].under.forEach((m) => under.add(m));
        }
      });
    return { over: Array.from(over), under: Array.from(under) };
  };
  const { over, under } = analyzeMuscles();

  // Build form for metrics util
  const metricForm = useMemo(() => {
    const tests = {};
    Object.entries(TESTS).forEach(([testName, items]) => {
      tests[testName] = {};
      items.forEach((label) => {
        tests[testName][label] = Boolean(selected[testName]?.includes(label));
      });
    });
    return {
      athlete_id: athleteId,
      date: new Date().toISOString().split("T")[0],
      notes: coachComment || athleteComment || "",
      tests,
    };
  }, [athleteId, selected, coachComment, athleteComment]);

  // Compute metrics & recs live
  const computed = computeMovementMetrics(metricForm);
  const recs = makeMovementRecommendations({
    totalFails: computed.metrics.totalFails,
    redFlags: computed.metrics.redFlags,
    byCategory: computed.metrics.byCategory,
  });

  const selectedByTest = useMemo(() => {
    const obj = {};
    Object.keys(TESTS).forEach((t) => (obj[t] = selected[t] || []));
    return obj;
  }, [selected]);

  const athleteName = useMemo(() => {
    const a = athletes.find((x) => String(x.id) === String(athleteId));
    return a?.name || "";
  }, [athletes, athleteId]);

  // Save
  const doSave = async () => {
    if (!athleteId) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);

    const payload = {
      athlete_id: Number(athleteId),
      selections_json: JSON.stringify(selected),
      analysis_json: JSON.stringify({ over, under }),
      athlete_comment: athleteComment || null,
      coach_comment: coachComment || null,
    };

    try {
      const response = await fetch(
        "/api/movement-assessments/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      setConfirmOpen(false);
      alert("Movement assessment saved successfully!");

      fetch(`/api/movement-assessments/athlete/${athleteId}`)
        .then((r) => r.json())
        .then(setHistory)
        .catch(() => {});
    } catch (err) {
      console.error("Error saving movement assessment:", err);
      alert("Failed to save assessment.");
    }
  };

  return (
    <>
      <PageHeader
        title="Movement Assessment"
        subtitle="Run the standard screens, capture observations, and auto-generate recommendations."
      />

      <div className="max-w-4xl space-y-section">
        {/* Select athlete */}
        <Card>
          <CardHeader
            title="Select Athlete"
            meta="Results are saved to this athlete"
          />
          <CardContent>
            <label className="label">Athlete</label>
            <select
              value={athleteId}
              onChange={(e) => setAthleteId(e.target.value)}
              className="field mt-1 px-3 py-2"
            >
              <option value="">-- Choose an athlete --</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            {showWarning && (
              <div className="text-red-600 mt-2 font-medium">
                Please select an athlete before saving.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tests */}
        {Object.entries(TESTS).map(([testName, items]) => (
          <Card key={testName}>
            <CardHeader title={testName} meta="Check all that apply" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((item) => (
                  <label key={item} className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={selected[testName]?.includes(item) || false}
                      onCheckedChange={() => toggleCheckbox(testName, item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Live Summary WITH Muscle Group Highlights (only place we show them) */}
        <Card>
          <CardHeader
            title="Live Summary"
            meta="Totals, red flags, and category breakdown"
          />
          <CardContent>
            <MovementOutcomeCard
              normalized={computed.normalized}
              metrics={computed.metrics}
              recommendations={recs}
            />

            <div className="mt-4 rounded-2xl border p-3 bg-amber-50/40">
              <div className="font-semibold mb-1">Muscle Group Highlights</div>
              <div className="text-sm">
                <div className="mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs mr-2">
                    Overworking
                  </span>
                  {over.length ? over.join(", ") : "None"}
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-900 text-xs mr-2">
                    Underworking
                  </span>
                  {under.length ? under.join(", ") : "None"}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="btn-outline"
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Back to Top
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Comments + Save (modal) */}
        <Card>
          <CardHeader
            title="Comments"
            meta="Optional notes from athlete and coach"
          />
          <CardContent className="space-y-4">
            <div>
              <label className="label">Athlete Comment</label>
              <Textarea
                value={athleteComment}
                onChange={(e) => setAthleteComment(e.target.value)}
                className="field mt-1 px-3 py-2"
              />
            </div>
            <div>
              <label className="label">Coach Comment</label>
              <Textarea
                value={coachComment}
                onChange={(e) => setCoachComment(e.target.value)}
                className="field mt-1 px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="btn-outline"
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Cancel
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  if (!athleteId) {
                    setShowWarning(true);
                    return;
                  }
                  setConfirmOpen(true);
                }}
                disabled={!athleteId}
              >
                Save Assessment
              </button>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader
            title="Assessment History"
            meta="For the selected athlete"
          />
          <CardContent className="space-y-3">
            {history.length === 0 ? (
              <div className="text-sm text-base-subtle">No history yet.</div>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => {
                  let analysis;
                  try {
                    analysis = JSON.parse(h.analysis_json);
                  } catch {
                    analysis = { over: [], under: [] };
                  }
                  const created = new Date(h.created_at).toLocaleString();
                  return (
                    <li key={h.id} className="p-3 rounded-2xl border">
                      <div className="text-sm font-medium">{created}</div>
                      <div className="text-sm">
                        <span className="font-semibold">Over:</span>{" "}
                        {analysis.over?.join(", ") || "—"}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Under:</span>{" "}
                        {analysis.under?.join(", ") || "—"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doSave}
        computed={computed}
        recs={recs}
        over={over}
        under={under}
        selectedByTest={selectedByTest}
        athleteName={athleteName}
        comments={{ athlete: athleteComment, coach: coachComment }}
      />
    </>
  );
}
