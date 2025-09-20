import { useState } from "react";

function AthleteForm({ onSubmit }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    birthday: "",
    gender: "",
    level: "",
    city: "",
    sport: "",
    position: "",
    clubTeam: "",
    email: "",
    momName: "",
    dadName: "",
    injuries: "",
    allergies: "",
    medications: "",
    achievements: "",
    practiceFrequency: "",
    workoutFrequency: "",
    skillFrequency: "",
    devLevel: "",
    nutrition: "",
    hydration: "",
    supplements: "",
    sleep: "",
    longGoals: "",
    sportGoals: "",
    athleteGoals: "",
    mentality: "",
    personality: "",
    prehab: "",
    testingRequest: "",
    supplementRequest: "",
    notes: "",
    trainingStyle: "",
    motivation: "",
    learning: "",
    communication: "",
    comments: "",
    photo: null,
  });

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-section"
      id="add-athlete-form"
    >
      {/* Photo */}
      <div>
        <label className="label">Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="field mt-1 px-3 py-2"
        />
        {form.photo && (
          <div className="mt-2">
            <img
              src={form.photo}
              alt="Preview"
              className="h-20 w-20 rounded-xl object-cover border"
            />
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="label">First Name</label>
          <input
            name="first_name"
            placeholder="e.g., Alex"
            onChange={update}
            className="field mt-1 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input
            name="last_name"
            placeholder="e.g., Morgan"
            onChange={update}
            className="field mt-1 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input
            name="birthday"
            type="date"
            onChange={update}
            className="field mt-1 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="label">Gender</label>
          <select
            name="gender"
            onChange={update}
            className="field mt-1 px-3 py-2"
            value={form.gender}
          >
            <option value="">Select…</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>
        </div>
      </div>

      {/* Location & Sport */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="label">Level</label>
          <input
            name="level"
            placeholder="e.g., Youth / High School / Elite"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
        <div>
          <label className="label">City</label>
          <input
            name="city"
            placeholder="e.g., Nijmegen"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
        <div>
          <label className="label">Sport(s)</label>
          <input
            name="sport"
            placeholder="e.g., Football"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
        <div>
          <label className="label">Position(s)</label>
          <input
            name="position"
            placeholder="e.g., Striker"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
        <div>
          <label className="label">Club / Team</label>
          <input
            name="clubTeam"
            placeholder="e.g., NEC Nijmegen U21"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            name="email"
            type="email"
            placeholder="name@example.com"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
      </div>

      {/* Parents */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="label">Mom's Name</label>
          <input
            name="momName"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
        <div>
          <label className="label">Dad's Name</label>
          <input
            name="dadName"
            onChange={update}
            className="field mt-1 px-3 py-2"
          />
        </div>
      </div>

      {/* Medical History */}
      <div>
        <h3 className="text-lg font-semibold">Medical History</h3>
        <textarea
          name="injuries"
          placeholder="Injuries / Medical Conditions"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={3}
        />
        <textarea
          name="allergies"
          placeholder="Allergies (if any)"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="medications"
          placeholder="Current Medications"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
      </div>

      {/* Background & Experience */}
      <div>
        <h3 className="text-lg font-semibold">
          Athlete Background & Experience
        </h3>
        <textarea
          name="achievements"
          placeholder="Achievements"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={3}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-2">
          <div>
            <label className="label">Practice Frequency</label>
            <input
              name="practiceFrequency"
              placeholder="e.g., 3x/week"
              onChange={update}
              className="field mt-1 px-3 py-2"
            />
          </div>
          <div>
            <label className="label">Workout Frequency</label>
            <input
              name="workoutFrequency"
              placeholder="e.g., 2x/week"
              onChange={update}
              className="field mt-1 px-3 py-2"
            />
          </div>
          <div>
            <label className="label">Skill Frequency</label>
            <input
              name="skillFrequency"
              placeholder="e.g., 1x/week"
              onChange={update}
              className="field mt-1 px-3 py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-2">
          <div>
            <label className="label">Development Level</label>
            <input
              name="devLevel"
              onChange={update}
              className="field mt-1 px-3 py-2"
            />
          </div>
          <div>
            <label className="label">Sleeping Habits</label>
            <input
              name="sleep"
              onChange={update}
              className="field mt-1 px-3 py-2"
            />
          </div>
          <div>
            <label className="label">Nutritional Habits</label>
            <input
              name="nutrition"
              onChange={update}
              className="field mt-1 px-3 py-2"
            />
          </div>
          <div>
            <label className="label">Hydration Habits</label>
            <input
              name="hydration"
              onChange={update}
              className="field mt-1 px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Supplements</label>
            <input
              name="supplements"
              onChange={update}
              className="field mt-1 px-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      {/* Training Objectives */}
      <div>
        <h3 className="text-lg font-semibold">Training Objectives</h3>
        <textarea
          name="longGoals"
          placeholder="Long Term Goals"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={3}
        />
        <textarea
          name="sportGoals"
          placeholder="Sport Specific Goals"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={3}
        />
        <textarea
          name="athleteGoals"
          placeholder="Athlete Specific Goals"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={3}
        />
      </div>

      {/* Coach's Notes */}
      <div>
        <h3 className="text-lg font-semibold">Coach's Notes</h3>
        <textarea
          name="mentality"
          placeholder="Athlete Mentality"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="personality"
          placeholder="Athlete Personality"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="prehab"
          placeholder="Pre-hab Needs"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="testingRequest"
          placeholder="Specified Testing Request"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="supplementRequest"
          placeholder="Supplement Requests"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="notes"
          placeholder="Notes"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={3}
        />
      </div>

      {/* Coach's IQ */}
      <div>
        <h3 className="text-lg font-semibold">Coach's IQ</h3>
        <textarea
          name="trainingStyle"
          placeholder="Athlete Training Style"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="motivation"
          placeholder="Athlete Motivation and Work Ethic"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="learning"
          placeholder="Athlete Learning Preference"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
        <textarea
          name="communication"
          placeholder="Athlete Communication Preference"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={2}
        />
      </div>

      {/* Comments */}
      <div>
        <h3 className="text-lg font-semibold">Comments</h3>
        <textarea
          name="comments"
          placeholder="Additional Comments"
          onChange={update}
          className="field mt-2 px-3 py-2 w-full"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-outline">
          Cancel
        </button>
        <button type="submit" className="btn">
          Save Athlete
        </button>
      </div>
    </form>
  );
}

export default AthleteForm;
