// src/components/AthleteSelect.jsx
import { useEffect, useState } from "react";

function AthleteSelect({ value, onChange }) {
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    fetch("/api/athletes/")
      .then((res) => res.json())
      .then((data) => setAthletes(data))
      .catch((err) => console.error("Error loading athletes:", err));
  }, []);

  return (
    <select
      className="p-2 border rounded w-full"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select Athlete</option>
      {athletes.map((a) => (
        <option key={a.id} value={a.id}>
          {a.first_name} {a.last_name}
        </option>
      ))}
    </select>
  );
}

export default AthleteSelect;
