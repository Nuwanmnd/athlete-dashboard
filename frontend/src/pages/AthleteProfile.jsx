// frontend/src/pages/AthleteProfile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiPatch, apiUpload } from "@/utils/api";

import AssessmentOutcomeCard from "@/components/assessment/AssessmentOutcomeCard";
import MovementOutcomeCard from "@/components/movement/MovementOutcomeCard";
import InjurySummaryCard from "@/components/injury/InjurySummaryCard";

import {
  computeAssessmentMetrics,
  makeRecommendations,
} from "@/utils/assessmentMetrics";
import {
  computeMovementMetrics,
  makeMovementRecommendations,
} from "@/utils/movementMetrics";
import {
  normalizeInjury,
  makeInjuryRecommendations,
} from "@/utils/injuryUtils";

import { ChevronLeft, ChevronRight, MessageSquareText } from "lucide-react";
import NotesTab from "@/components/athlete-profile/NotesTab";

// ---------- Config ----------
const API = (import.meta.env.VITE_API_BASE || "/api").replace(
  /\/$/,
  ""
);
const NOTES_ENDPOINT = API;

// 👉 Tabs (added Background + Notes)
const TABS = [
  "Overview",
  "Assessments",
  "Movement",
  "Injury",
  "Background",
  "Notes",
];

// ---------- Small helpers ----------
const get = (obj, key, fallback = "—") =>
  obj && obj[key] != null && obj[key] !== "" ? obj[key] : fallback;

const pretty = (s) =>
  s ? s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : "—";

const toAbsUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  const path = p.startsWith("/") ? p : `/${p}`;
  return API + path; // /api/uploads/....
};

// =====================================================

export default function AthleteProfile() {
  const { id } = useParams(); // athlete id
  const [tab, setTab] = useState("Overview");

  const [athlete, setAthlete] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [movementHistory, setMovementHistory] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [notes, setNotes] = useState([]);

  // carousel indices
  const [assessIdx, setAssessIdx] = useState(0);
  const [moveIdx, setMoveIdx] = useState(0);

  // ---- Avatar photo upload ----
  const fileRef = useRef(null);
  const onPickPhoto = () => fileRef.current?.click();

  const avatarSrc = useMemo(
    () => toAbsUrl(athlete?.photo_url),
    [athlete?.photo_url]
  );

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await apiUpload("/upload", fd);
      const updated = await apiPatch(`/athletes/${id}`, { photo_url: url });
      setAthlete(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to upload photo");
    } finally {
      e.target.value = "";
    }
  };

  // ---- Fetches ----
  useEffect(() => {
    if (!id) return;

    fetch(`${API}/athletes/${id}`)
      .then((r) => r.json())
      .then(setAthlete)
      .catch(() => setAthlete(null));

    fetch(`${API}/assessments/athlete/${id}`)
      .then((r) => r.json())
      .then((rows) => {
        const s = (rows || [])
          .slice()
          .sort((a, b) => (a.date > b.date ? -1 : 1));
        setAssessments(s);
      })
      .catch(() => setAssessments([]));

    fetch(`${API}/movement-assessments/athlete/${id}`)
      .then((r) => r.json())
      .then((rows) => {
        const s = (rows || [])
          .slice()
          .sort((a, b) =>
            (a.created_at || "").localeCompare(b.created_at || "")
          );
        setMovementHistory(s);
      })
      .catch(() => setMovementHistory([]));

    fetch(`${API}/injuries/${id}`)
      .then((r) => r.json())
      .then((rows) => {
        const s = (rows || [])
          .slice()
          .sort((a, b) => (a.date_reported > b.date_reported ? -1 : 1));
        setInjuries(s);
      })
      .catch(() => setInjuries([]));

    fetch(`${NOTES_ENDPOINT}/athletes/${id}/notes`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setNotes)
      .catch(() => setNotes([]));
  }, [id]);

  // keep carousel index valid when lists change
  useEffect(() => setAssessIdx(0), [assessments.length]);
  useEffect(() => setMoveIdx(0), [movementHistory.length]);

  // ---- Helpers ----
  const ageFromDOB = (dob) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(+d)) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const initials = (a) => {
    const f = a?.first_name?.[0] || "";
    const l = a?.last_name?.[0] || "";
    return (f + l || "?").toUpperCase();
  };

  const hasActiveInjury = useMemo(() => {
    if (!injuries?.length) return false;
    return injuries.some((i) => ["Active", "Recovering"].includes(i.status));
  }, [injuries]);

  // ---- Build computed arrays (so we can carousel through them) ----
  const computedAssessments = useMemo(() => {
    if (!assessments?.length) return [];
    return assessments.map((a) => {
      const formLike = {
        athlete_id: a.athlete_id,
        date: a.date,
        age: a.age ?? ageFromDOB(athlete?.date_of_birth) ?? "",
        weight: a.weight ?? "",
        cmf_left: a.cmf_left ?? "",
        cmf_right: a.cmf_right ?? "",
        cmp_left: a.cmp_left ?? "",
        cmp_right: a.cmp_right ?? "",
        custom_target: a.custom_target ?? "",
        goal: a.goal ?? "",
        coach_comment: a.coach_comment ?? "",
      };
      const computed = computeAssessmentMetrics(formLike);
      const recs = makeRecommendations({
        ratio: computed.metrics.ratio,
        percentBelow: computed.metrics.percentBelow,
        goal: computed.normalized.goal,
      });
      return {
        row: a,
        normalized: computed.normalized,
        metrics: computed.metrics,
        recs,
      };
    });
  }, [assessments, athlete]);

  const computedMovements = useMemo(() => {
    if (!movementHistory?.length) return [];
    return movementHistory.map((m) => {
      let selections = {};
      try {
        selections = m.selections_json ? JSON.parse(m.selections_json) : {};
      } catch {
        selections = {};
      }
      const tests = {};
      Object.entries(selections).forEach(([testName, issues]) => {
        tests[testName] = tests[testName] || {};
        issues.forEach((label) => (tests[testName][label] = true));
      });
      const formLike = {
        athlete_id: m.athlete_id,
        date:
          m.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        notes: m.coach_comment || m.athlete_comment || "",
        tests,
      };
      const computed = computeMovementMetrics(formLike);
      const recs = makeMovementRecommendations({
        totalFails: computed.metrics.totalFails,
        redFlags: computed.metrics.redFlags,
        byCategory: computed.metrics.byCategory,
      });
      return {
        row: m,
        normalized: computed.normalized,
        metrics: computed.metrics,
        recs,
        comments: { coach: m.coach_comment, athlete: m.athlete_comment },
      };
    });
  }, [movementHistory]);

  const computedInjuries = useMemo(() => {
    if (!injuries?.length) return [];
    const sevMap = { Minor: 3, Moderate: 6, Severe: 8 };
    const stageMap = {
      Active: "acute",
      Recovering: "subacute",
      Resolved: "rtp",
    };
    return injuries.map((inj) => {
      const forUtil = {
        athlete_id: inj.athlete_id,
        date_reported: inj.date_reported,
        area: inj.area,
        side: inj.area?.toLowerCase().includes("left")
          ? "Left"
          : inj.area?.toLowerCase().includes("right")
          ? "Right"
          : "N/A",
        severity: sevMap[inj.severity] ?? 5,
        status: inj.status.toLowerCase(),
        diagnosis: inj.diagnosis || "",
        mechanism: inj.mechanism || "",
        stage: stageMap[inj.status] || "acute",
        notes: inj.notes || "",
      };
      const computed = normalizeInjury(forUtil);
      const recs = makeInjuryRecommendations({
        riskBand: computed.metrics.riskBand,
        stage: computed.normalized.stage,
        area: computed.normalized.area,
      });
      return {
        row: inj,
        normalized: computed.normalized,
        metrics: computed.metrics,
        recs,
      };
    });
  }, [injuries]);

  // convenience “current” items for Overview
  const currentAssess = computedAssessments[assessIdx];
  const currentMove = computedMovements[moveIdx];

  // ---- Notes handlers (optimistic) ----
  const createNote = async ({ text, tags }) => {
    const optimistic = {
      temp_id: `tmp_${Date.now()}`,
      text,
      tags,
      pinned: false,
      created_at: new Date().toISOString(),
      author: "Coach",
    };
    setNotes((prev) => [optimistic, ...prev]);
    try {
      const res = await fetch(`${NOTES_ENDPOINT}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athlete_id: Number(id), text, tags }),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setNotes((prev) =>
        prev.map((n) => (n.temp_id === optimistic.temp_id ? saved : n))
      );
    } catch {
      setNotes((prev) => prev.filter((n) => n.temp_id !== optimistic.temp_id));
      alert("Failed to save note");
    }
  };

  const togglePin = async (note) => {
    if (!note?.id) return;
    const newPinned = !note.pinned;
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, pinned: newPinned } : n))
    );
    try {
      await fetch(`${NOTES_ENDPOINT}/notes/${note.id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: newPinned }),
      });
    } catch {
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, pinned: !newPinned } : n))
      );
      alert("Failed to update pin");
    }
  };

  const deleteNote = async (note) => {
    if (!note?.id) {
      setNotes((cur) => cur.filter((n) => n.temp_id !== note.temp_id));
      return;
    }
    const prev = notes;
    setNotes((cur) => cur.filter((n) => n.id !== note.id));
    try {
      await fetch(`${NOTES_ENDPOINT}/notes/${note.id}`, { method: "DELETE" });
    } catch {
      setNotes(prev);
      alert("Failed to delete");
    }
  };

  // ---- UI ----
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="mr-3 inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border hover:bg-gray-50"
        >
          ← Back to Dashboard
        </Link>

        {/* Avatar */}
        <button
          type="button"
          className="relative w-14 h-14 rounded-full overflow-hidden border focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onPickPhoto}
          title="Change photo"
          aria-label="Change photo"
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={`${athlete?.first_name ?? "Athlete"} avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-lg font-semibold">
              {initials(athlete)}
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotoChange}
        />

        {/* Name + meta */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              {athlete
                ? `${athlete.first_name} ${athlete.last_name}`
                : "Athlete"}
            </h1>
            {hasActiveInjury && (
              <span className="text-xs px-2 py-1 rounded-full border bg-red-50 border-red-200 text-red-700">
                Active Injury
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {(() => {
              const bits = [];
              const age = ageFromDOB(athlete?.date_of_birth);
              if (age != null) bits.push(`${age} yrs`);
              if (athlete?.gender) bits.push(pretty(athlete.gender));
              if (athlete?.sport) bits.push(athlete.sport);
              if (athlete?.position) bits.push(athlete.position);
              return bits.join(" • ");
            })()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/assessments/new?athlete=${id}`}
            className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
          >
            + New Assessment
          </Link>
          <Link
            to={`/athletes/${id}/movement-assessment`}
            className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
          >
            Movement Test
          </Link>
          <Link
            to={`/athletes/${id}/injury`}
            className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
          >
            Log Injury
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border rounded-2xl overflow-hidden">
        <div className="flex gap-1 p-1 bg-gray-50">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm ${
                tab === t ? "bg-white border shadow-sm" : "hover:bg-white/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-6">
          {/* ---------------- Overview ---------------- */}
          {tab === "Overview" && (
            <>
              {/* Top info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Athlete Summary">
                  <InfoRow
                    label="Date of Birth"
                    value={get(athlete, "date_of_birth")}
                  />
                  <InfoRow label="Level" value={get(athlete, "level")} />
                  <InfoRow
                    label="Club Team"
                    value={get(athlete, "club_team")}
                  />
                  <InfoRow label="City" value={get(athlete, "city")} />
                  <InfoRow
                    label="Mom's Name"
                    value={get(athlete, "mom_name")}
                  />
                  <InfoRow
                    label="Dad's Name"
                    value={get(athlete, "dad_name")}
                  />
                  <InfoRow label="Email" value={get(athlete, "email")} />
                </SectionCard>

                <SectionCard title="Medical History">
                  <InfoRow
                    label="Injuries / Medical Conditions"
                    value={get(athlete, "medical_conditions")}
                  />
                  <InfoRow
                    label="Allergies"
                    value={get(athlete, "allergies")}
                  />
                  <InfoRow
                    label="Current Medications"
                    value={get(athlete, "medications")}
                  />
                </SectionCard>
              </div>

              {/* Overview cards with carousels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assessments carousel */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Latest Assessment</h3>
                    {computedAssessments.length > 1 && (
                      <CarouselNav
                        index={assessIdx}
                        total={computedAssessments.length}
                        onPrev={() =>
                          setAssessIdx((i) =>
                            i > 0 ? i - 1 : computedAssessments.length - 1
                          )
                        }
                        onNext={() =>
                          setAssessIdx((i) =>
                            i < computedAssessments.length - 1 ? i + 1 : 0
                          )
                        }
                      />
                    )}
                  </div>

                  {currentAssess ? (
                    <>
                      <AssessmentOutcomeCard
                        normalized={currentAssess.normalized}
                        metrics={currentAssess.metrics}
                        recommendations={currentAssess.recs}
                      />
                      {/* Raw inputs + comment */}
                      <div className="rounded-2xl border bg-white p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                          <InfoMini
                            label="Date"
                            value={currentAssess.row.date}
                          />
                          <InfoMini
                            label="Age"
                            value={
                              currentAssess.row.age ??
                              ageFromDOB(athlete?.date_of_birth) ??
                              "—"
                            }
                          />
                          <InfoMini
                            label="Weight (lbs)"
                            value={currentAssess.row.weight}
                          />
                          <InfoMini
                            label="CMF L"
                            value={currentAssess.row.cmf_left}
                          />
                          <InfoMini
                            label="CMF R"
                            value={currentAssess.row.cmf_right}
                          />
                          <InfoMini
                            label="CMP L"
                            value={currentAssess.row.cmp_left}
                          />
                          <InfoMini
                            label="CMP R"
                            value={currentAssess.row.cmp_right}
                          />
                          <InfoMini
                            label="Custom Target (N)"
                            value={currentAssess.row.custom_target || "—"}
                          />
                          <InfoMini
                            label="Performance Goal"
                            value={pretty(currentAssess.row.goal) || "—"}
                          />
                        </div>
                        {currentAssess.row.coach_comment && (
                          <NoteBlock
                            title="Coach Notes"
                            text={currentAssess.row.coach_comment}
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <EmptyCard text="No assessments yet." />
                  )}
                </div>

                {/* Movement carousel */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Movement Summary</h3>
                    {computedMovements.length > 1 && (
                      <CarouselNav
                        index={moveIdx}
                        total={computedMovements.length}
                        onPrev={() =>
                          setMoveIdx((i) =>
                            i > 0 ? i - 1 : computedMovements.length - 1
                          )
                        }
                        onNext={() =>
                          setMoveIdx((i) =>
                            i < computedMovements.length - 1 ? i + 1 : 0
                          )
                        }
                      />
                    )}
                  </div>

                  {currentMove ? (
                    <>
                      <MovementOutcomeCard
                        normalized={currentMove.normalized}
                        metrics={currentMove.metrics}
                        recommendations={currentMove.recs}
                      />
                      {(currentMove.comments.coach ||
                        currentMove.comments.athlete) && (
                        <div className="rounded-2xl border bg-white p-4 space-y-2">
                          {currentMove.comments.athlete && (
                            <NoteBlock
                              title="Athlete Comment"
                              text={currentMove.comments.athlete}
                            />
                          )}
                          {currentMove.comments.coach && (
                            <NoteBlock
                              title="Coach Comment"
                              text={currentMove.comments.coach}
                            />
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <EmptyCard text="No movement assessments yet." />
                  )}
                </div>

                {/* Injuries – show ALL (newest first) */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-semibold">Recent Injury</h3>
                  {computedInjuries.length === 0 ? (
                    <EmptyCard text="No injuries logged." />
                  ) : (
                    <div className="space-y-4">
                      {computedInjuries.map((inj) => (
                        <div key={inj.row.id} className="space-y-3">
                          <InjurySummaryCard
                            normalized={inj.normalized}
                            metrics={inj.metrics}
                            recommendations={inj.recs}
                          />
                          {(inj.row.recovery_plan || inj.row.notes) && (
                            <div className="rounded-2xl border bg-white p-4 space-y-2">
                              {inj.row.recovery_plan && (
                                <NoteBlock
                                  title="Recovery Plan"
                                  text={inj.row.recovery_plan}
                                />
                              )}
                              {inj.row.notes && (
                                <NoteBlock
                                  title="Coach Notes"
                                  text={inj.row.notes}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ---------------- Assessments ---------------- */}
          {tab === "Assessments" && (
            <div className="space-y-6">
              {assessments.length === 0 && (
                <EmptyCard text="No assessments yet." />
              )}
              {assessments.map((a) => {
                const computed = computeAssessmentMetrics({
                  athlete_id: a.athlete_id,
                  date: a.date,
                  age: a.age ?? ageFromDOB(athlete?.date_of_birth) ?? "",
                  weight: a.weight ?? "",
                  cmf_left: a.cmf_left ?? "",
                  cmf_right: a.cmf_right ?? "",
                  cmp_left: a.cmp_left ?? "",
                  cmp_right: a.cmp_right ?? "",
                  custom_target: a.custom_target ?? "",
                  goal: a.goal ?? "",
                  coach_comment: a.coach_comment ?? "",
                });
                const recs = makeRecommendations({
                  ratio: computed.metrics.ratio,
                  percentBelow: computed.metrics.percentBelow,
                  goal: computed.normalized.goal,
                });
                return (
                  <div key={a.id} className="space-y-2">
                    <AssessmentOutcomeCard
                      normalized={computed.normalized}
                      metrics={computed.metrics}
                      recommendations={recs}
                    />
                    {a.coach_comment && (
                      <div className="rounded-2xl border bg-white p-3">
                        <NoteBlock title="Coach Notes" text={a.coach_comment} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------- Movement ---------------- */}
          {tab === "Movement" && (
            <div className="space-y-6">
              {movementHistory.length === 0 && (
                <EmptyCard text="No movement assessments yet." />
              )}
              {movementHistory.map((m) => {
                let selections = {};
                try {
                  selections = m.selections_json
                    ? JSON.parse(m.selections_json)
                    : {};
                } catch {
                  selections = {};
                }
                const tests = {};
                Object.entries(selections).forEach(([testName, issues]) => {
                  tests[testName] = tests[testName] || {};
                  issues.forEach((label) => (tests[testName][label] = true));
                });

                const computed = computeMovementMetrics({
                  athlete_id: m.athlete_id,
                  date: m.created_at?.slice(0, 10),
                  notes: m.coach_comment || m.athlete_comment || "",
                  tests,
                });
                const recs = makeMovementRecommendations({
                  totalFails: computed.metrics.totalFails,
                  redFlags: computed.metrics.redFlags,
                  byCategory: computed.metrics.byCategory,
                });

                return (
                  <div key={m.id} className="space-y-2">
                    <MovementOutcomeCard
                      normalized={computed.normalized}
                      metrics={computed.metrics}
                      recommendations={recs}
                    />
                    {(m.coach_comment || m.athlete_comment) && (
                      <div className="rounded-2xl border bg-white p-3 space-y-2">
                        {m.athlete_comment && (
                          <NoteBlock
                            title="Athlete Comment"
                            text={m.athlete_comment}
                          />
                        )}
                        {m.coach_comment && (
                          <NoteBlock
                            title="Coach Comment"
                            text={m.coach_comment}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------- Injury ---------------- */}
          {tab === "Injury" && (
            <div className="space-y-6">
              {injuries.length === 0 && (
                <EmptyCard text="No injuries logged." />
              )}
              {computedInjuries.map((inj) => (
                <div key={inj.row.id} className="space-y-2">
                  <InjurySummaryCard
                    normalized={inj.normalized}
                    metrics={inj.metrics}
                    recommendations={inj.recs}
                  />
                  {(inj.row.recovery_plan || inj.row.notes) && (
                    <div className="rounded-2xl border bg-white p-3 space-y-2">
                      {inj.row.recovery_plan && (
                        <NoteBlock
                          title="Recovery Plan"
                          text={inj.row.recovery_plan}
                        />
                      )}
                      {inj.row.notes && (
                        <NoteBlock title="Coach Notes" text={inj.row.notes} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ---------------- Background ---------------- */}
          {tab === "Background" && (
            <div className="space-y-6">
              <SectionCard title="Athlete Background & Experience">
                <InfoRow
                  label="Achievements"
                  value={get(athlete, "achievements")}
                />
                <InfoRow
                  label="Practice Frequency"
                  value={get(athlete, "practice_frequency")}
                />
                <InfoRow
                  label="Workout Frequency"
                  value={get(athlete, "workout_frequency")}
                />
                <InfoRow
                  label="Skill Frequency"
                  value={get(athlete, "skill_frequency")}
                />
                <InfoRow
                  label="Development Level"
                  value={get(athlete, "development_level")}
                />
                <InfoRow
                  label="Nutritional Habits"
                  value={get(athlete, "nutrition_habits")}
                />
                <InfoRow
                  label="Hydration Habits"
                  value={get(athlete, "hydration_habits")}
                />
                <InfoRow
                  label="Supplements"
                  value={get(athlete, "supplements")}
                />
                <InfoRow
                  label="Sleeping Habits"
                  value={get(athlete, "sleep_habits")}
                />
              </SectionCard>

              <SectionCard title="Training Objectives">
                <InfoRow
                  label="Long Term Goals"
                  value={get(athlete, "goal_long_term")}
                />
                <InfoRow
                  label="Sport Specific Goals"
                  value={get(athlete, "goal_sport_specific")}
                />
                <InfoRow
                  label="Athlete Specific Goals"
                  value={get(athlete, "goal_athlete_specific")}
                />
              </SectionCard>

              <SectionCard title="Coach's Notes">
                <InfoRow
                  label="Athlete Mentality"
                  value={get(athlete, "coach_athlete_mentality")}
                />
                <InfoRow
                  label="Athlete Personality"
                  value={get(athlete, "coach_athlete_personality")}
                />
                <InfoRow
                  label="Pre-hab Needs"
                  value={get(athlete, "coach_prehab_needs")}
                />
                <InfoRow
                  label="Specified Testing Request"
                  value={get(athlete, "coach_testing_request")}
                />
                <InfoRow
                  label="Supplement Requests"
                  value={get(athlete, "coach_supplement_requests")}
                />
                <InfoRow label="Notes" value={get(athlete, "coach_notes")} />
              </SectionCard>

              <SectionCard title="Coach's IQ">
                <InfoRow
                  label="Training Style"
                  value={get(athlete, "iq_training_style")}
                />
                <InfoRow
                  label="Motivation & Work Ethic"
                  value={get(athlete, "iq_motivation_work_ethic")}
                />
                <InfoRow
                  label="Learning Preference"
                  value={get(athlete, "iq_learning_preference")}
                />
                <InfoRow
                  label="Communication Preference"
                  value={get(athlete, "iq_communication_preference")}
                />
              </SectionCard>

              <SectionCard title="Comments">
                <InfoRow
                  label="Additional Comments"
                  value={get(athlete, "additional_comments")}
                />
              </SectionCard>
            </div>
          )}

          {/* ---------------- Notes ---------------- */}
          {tab === "Notes" && (
            <NotesTab
              notes={notes}
              onCreate={createNote}
              onPin={togglePin}
              onDelete={deleteNote}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Small presentational bits ----------
function EmptyCard({ text }) {
  return (
    <div className="rounded-2xl border p-6 text-sm text-gray-500 bg-white">
      {text}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="text-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}

function InfoMini({ label, value }) {
  return (
    <div className="text-xs">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}

function NoteBlock({ title, text }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <MessageSquareText className="w-4 h-4 mt-0.5 text-gray-500" />
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="font-medium whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
}

function CarouselNav({ index, total, onPrev, onNext }) {
  if (total <= 1) return null;
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        className="p-1.5 rounded-lg border hover:bg-gray-50"
        onClick={onPrev}
        aria-label="Previous"
        title="Previous"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-xs tabular-nums">
        {index + 1} / {total}
      </span>
      <button
        type="button"
        className="p-1.5 rounded-lg border hover:bg-gray-50"
        onClick={onNext}
        aria-label="Next"
        title="Next"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
