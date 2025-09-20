// Overview.jsx
import React from "react";

const AthleteOverview = ({ athlete }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Athlete Summary</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Age:</strong> {athlete.age}
          </p>
          <p>
            <strong>Sport:</strong> {athlete.sport}
          </p>
          <p>
            <strong>Position:</strong> {athlete.position}
          </p>
        </div>
        <div>
          <p>
            <strong>Injury Status:</strong> {athlete.injuryStatus}
          </p>
          <p>
            <strong>Gender:</strong> {athlete.gender}
          </p>
        </div>
      </div>
      <div className="bg-gray-100 p-4 rounded shadow">
        <p className="font-medium text-gray-700">📈 Recent Summary:</p>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li>Last assessment showed improvement in CMF ratio.</li>
          <li>No new injuries reported.</li>
          <li>Training load normal, recovery good.</li>
        </ul>
      </div>
    </div>
  );
};

export default AthleteOverview;
