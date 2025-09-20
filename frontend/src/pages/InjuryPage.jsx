// frontend/src/pages/InjuryPage.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import PageHeader from "@/components/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/Card";

export default function InjuryPage() {
  const location = useLocation();

  const [athletes, setAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [injuries, setInjuries] = useState([]);
  const [editingInjuryId, setEditingInjuryId] = useState(null);

  // confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const selectedAthleteName =
    athletes.find((a) => String(a.id) === String(selectedAthleteId))?.name ||
    "";

  // backend-compatible string fields
  const [form, setForm] = useState({
    date_reported: new Date().toISOString().split("T")[0],
    area: "",
    severity: "Moderate", // Minor | Moderate | Severe
    status: "Active", // Active | Recovering | Resolved
    recovery_plan: "",
    notes: "",
  });

  // Prefill athlete from ?athlete=ID
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const aid = sp.get("athlete");
    if (aid) setSelectedAthleteId(aid);
  }, [location.search]);

  // --- Fetch athletes ---
  useEffect(() => {
    fetch("/api/athletes/")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((a) => ({
          id: a.id,
          name: `${a.first_name} ${a.last_name}`,
        }));
        setAthletes(formatted);
      })
      .catch((err) => console.error("Failed to load athletes", err));
  }, []);

  // --- Fetch injuries for selected athlete ---
  useEffect(() => {
    if (!selectedAthleteId) {
      setInjuries([]);
      return;
    }
    fetch(`/api/injuries/${selectedAthleteId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch injuries");
        return res.json();
      })
      .then(setInjuries)
      .catch((err) => {
        console.error(err);
        setInjuries([]);
      });
  }, [selectedAthleteId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      date_reported: new Date().toISOString().split("T")[0],
      area: "",
      severity: "Moderate",
      status: "Active",
      recovery_plan: "",
      notes: "",
    });
    setEditingInjuryId(null);
  };

  // open confirm instead of saving immediately
  const openConfirm = (e) => {
    e?.preventDefault?.();
    if (!selectedAthleteId) {
      alert("Please select an athlete first");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmAndSave = async () => {
    const payload = { athlete_id: +selectedAthleteId, ...form };

    try {
      const response = await fetch("/api/injuries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());

      const savedInjury = await response.json();
      // replace if we were "editing", otherwise prepend
      setInjuries((prev) =>
        editingInjuryId
          ? prev.map((inj) => (inj.id === editingInjuryId ? savedInjury : inj))
          : [savedInjury, ...prev]
      );

      setConfirmOpen(false);
      resetForm();
      alert("Injury saved successfully!");
    } catch (err) {
      console.error("Error saving injury:", err);
      alert("Failed to save injury");
    }
  };

  const handleEdit = (injury) => {
    setForm({
      date_reported: injury.date_reported,
      area: injury.area,
      severity: injury.severity,
      status: injury.status,
      recovery_plan: injury.recovery_plan || "",
      notes: injury.notes || "",
    });
    setEditingInjuryId(injury.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHeader
        title="Injury & Recovery"
        subtitle="Log injuries and track recovery progress with a simple confirmation step."
      />

      <div className="max-w-4xl space-y-section">
        {/* --- Select Athlete --- */}
        <Card>
          <CardHeader title="Select Athlete" meta="Required before saving" />
          <CardContent>
            <label className="label">Athlete</label>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="field mt-1 px-3 py-2"
            >
              <option value="">-- Select Athlete --</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* --- Form --- */}
        {selectedAthleteId && (
          <Card>
            <CardHeader
              title={editingInjuryId ? "Edit Injury" : "New Injury"}
              meta="Provide details about the injury and plan"
            />
            <CardContent>
              <form
                onSubmit={openConfirm}
                className="space-y-section"
                id="injury-form"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date Reported</label>
                    <input
                      type="date"
                      name="date_reported"
                      value={form.date_reported}
                      onChange={handleChange}
                      className="field mt-1 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="label">Area</label>
                    <input
                      name="area"
                      value={form.area}
                      onChange={handleChange}
                      placeholder="e.g., Left Knee"
                      className="field mt-1 px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Severity</label>
                    <select
                      name="severity"
                      value={form.severity}
                      onChange={handleChange}
                      className="field mt-1 px-3 py-2"
                    >
                      <option value="Minor">Minor</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="field mt-1 px-3 py-2"
                    >
                      <option value="Active">Active</option>
                      <option value="Recovering">Recovering</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Recovery Plan</label>
                  <textarea
                    name="recovery_plan"
                    value={form.recovery_plan}
                    onChange={handleChange}
                    placeholder="Outline rehab steps, exercises, schedule…"
                    className="field mt-1 px-3 py-2 w-full"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="label">Coach Notes</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional context or constraints"
                    className="field mt-1 px-3 py-2 w-full"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={resetForm}
                  >
                    Clear
                  </button>
                  <button type="submit" className="btn">
                    {editingInjuryId ? "Update Injury" : "Save Injury"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* --- History --- */}
        {selectedAthleteId && (
          <Card>
            <CardHeader title="Injury History" meta="Tap an item to edit" />
            <CardContent className="space-y-3">
              {injuries.length === 0 ? (
                <div className="text-sm text-base-subtle">
                  No injuries recorded yet.
                </div>
              ) : (
                <ul className="space-y-2">
                  {injuries.map((injury) => (
                    <li
                      key={injury.id}
                      className="p-3 rounded-2xl border bg-white cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => handleEdit(injury)}
                    >
                      <div className="text-sm font-medium">
                        {injury.date_reported}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Area:</span>{" "}
                        {injury.area}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Severity:</span>{" "}
                        {injury.severity}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Status:</span>{" "}
                        {injury.status}
                      </div>
                      {injury.recovery_plan && (
                        <div className="text-sm">
                          <span className="font-semibold">Plan:</span>{" "}
                          {injury.recovery_plan}
                        </div>
                      )}
                      {injury.notes && (
                        <div className="text-sm">
                          <span className="font-semibold">Notes:</span>{" "}
                          {injury.notes}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ---------- Confirm Modal ---------- */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 p-4 md:p-6 flex items-end md:items-center justify-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h3 className="text-lg font-semibold">
                  {editingInjuryId ? "Confirm Update" : "Confirm Injury Entry"}
                </h3>
                <p className="text-sm text-base-subtle">
                  Please review the details below before saving.
                </p>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Injury Details</h4>
                  <Row label="Athlete" value={selectedAthleteName || "—"} />
                  <Row
                    label="Date Reported"
                    value={form.date_reported || "—"}
                  />
                  <Row label="Area" value={form.area || "—"} />
                  <Row label="Severity" value={form.severity || "—"} />
                  <Row label="Status" value={form.status || "—"} />
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Plans & Notes</h4>
                  <Row
                    label="Recovery Plan"
                    value={form.recovery_plan || "—"}
                    multiline
                  />
                  <Row
                    label="Coach Notes"
                    value={form.notes || "—"}
                    multiline
                  />
                </div>
              </div>

              <div className="px-5 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn" onClick={confirmAndSave}>
                  {editingInjuryId ? "Confirm & Update" : "Confirm & Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* small presentational helper for the modal */
function Row({ label, value, multiline = false }) {
  return (
    <div className="text-sm">
      <div className="text-xs text-base-subtle">{label}</div>
      <div className={`font-medium ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </div>
    </div>
  );
}
