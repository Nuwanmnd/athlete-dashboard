import { useEffect, useState } from "react";

export default function AssessmentForm() {
  const [athletes, setAthletes] = useState([]);
  const [form, setForm] = useState({
    athlete_id: "",
    date: new Date().toISOString().split("T")[0],
    cmf_left: "",
    cmf_right: "",
    cmp_left: "",
    cmp_right: "",
    ratio_left: "",
    ratio_right: "",
    coach_comment: "",
  });

  useEffect(() => {
    fetch("/api/athletes/")
      .then((res) => res.json())
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    // Auto-calc ratios
    const cmpL = parseFloat(updated.cmp_left);
    const cmfL = parseFloat(updated.cmf_left);
    const cmpR = parseFloat(updated.cmp_right);
    const cmfR = parseFloat(updated.cmf_right);

    updated.ratio_left = cmpL && cmfL ? (cmpL / cmfL).toFixed(2) : "";
    updated.ratio_right = cmpR && cmfR ? (cmpR / cmfR).toFixed(2) : "";

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/assessments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        cmf_left: +form.cmf_left,
        cmf_right: +form.cmf_right,
        cmp_left: +form.cmp_left,
        cmp_right: +form.cmp_right,
        ratio_left: +form.ratio_left,
        ratio_right: +form.ratio_right,
      }),
    });
    alert("Assessment submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-section">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <label className="label">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="field mt-1 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["cmf_left", "cmf_right", "cmp_left", "cmp_right"].map((field) => (
          <div key={field}>
            <label className="label">
              {field.replace("_", " ").toUpperCase()}
            </label>
            <input
              type="number"
              name={field}
              placeholder={field}
              value={form[field]}
              onChange={handleChange}
              className="field mt-1 px-3 py-2"
              required
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Ratio Left</label>
          <input
            type="text"
            name="ratio_left"
            value={form.ratio_left}
            readOnly
            placeholder="Auto-calculated"
            className="field mt-1 px-3 py-2"
          />
        </div>
        <div>
          <label className="label">Ratio Right</label>
          <input
            type="text"
            name="ratio_right"
            value={form.ratio_right}
            readOnly
            placeholder="Auto-calculated"
            className="field mt-1 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="label">Coach Comment</label>
        <textarea
          name="coach_comment"
          value={form.coach_comment}
          onChange={handleChange}
          placeholder="Coach comment"
          className="field mt-1 px-3 py-2 w-full"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-outline">
          Cancel
        </button>
        <button type="submit" className="btn">
          Submit Assessment
        </button>
      </div>
    </form>
  );
}
