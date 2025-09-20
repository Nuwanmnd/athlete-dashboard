// Injury.jsx
import React from "react";

const Injury = ({ athleteId }) => {
  const currentInjury = {
    area: "Left Knee",
    severity: "Moderate",
    status: "Active",
    plan: "Physio 3x a week",
    notes: "Avoid running",
    date: "2025-07-01",
  };

  const pastInjuries = [
    {
      area: "Right Ankle",
      severity: "Mild",
      status: "Recovered",
      plan: "Stretching and ice application",
      notes: "Resolved in 2 weeks",
      date: "2025-03-15",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Injury History</h2>

      <div className="bg-red-50 p-4 rounded shadow border border-red-200">
        <h3 className="font-medium text-red-600">Current Injury</h3>
        <p>
          <strong>Area:</strong> {currentInjury.area}
        </p>
        <p>
          <strong>Date:</strong> {currentInjury.date}
        </p>
        <p>
          <strong>Severity:</strong> {currentInjury.severity}
        </p>
        <p>
          <strong>Status:</strong> {currentInjury.status}
        </p>
        <p>
          <strong>Plan:</strong> {currentInjury.plan}
        </p>
        <p>
          <strong>Notes:</strong> {currentInjury.notes}
        </p>
      </div>

      <div>
        <h3 className="font-medium text-gray-700">Past Injuries</h3>
        {pastInjuries.map((injury, i) => (
          <div key={i} className="bg-gray-100 mt-2 p-4 rounded shadow-sm">
            <p>
              <strong>Date:</strong> {injury.date}
            </p>
            <p>
              <strong>Area:</strong> {injury.area}
            </p>
            <p>
              <strong>Status:</strong> {injury.status}
            </p>
            <p>
              <strong>Plan:</strong> {injury.plan}
            </p>
            <p>
              <strong>Notes:</strong> {injury.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Injury;
