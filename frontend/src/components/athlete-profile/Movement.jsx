// Movement.jsx
import React from 'react';

const Movement = ({ athleteId }) => {
  const mockMovementData = {
    overworking: ['Hip Flexor', 'Thigh ADD/R'],
    underworking: ['Glute Max', 'Hamstrings'],
    lastTestDate: '2025-07-15',
    notes: 'Excessive trunk flexion during squats and hip shift observed.',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Movement Assessment</h2>
      <p className="text-sm text-gray-500">Last test on: {mockMovementData.lastTestDate}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-100 p-4 rounded shadow">
          <h3 className="font-medium text-red-700">Overworking</h3>
          <ul className="list-disc list-inside text-sm text-red-800">
            {mockMovementData.overworking.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h3 className="font-medium text-yellow-700">Underworking</h3>
          <ul className="list-disc list-inside text-sm text-yellow-800">
            {mockMovementData.underworking.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow">
        <p className="text-sm text-gray-700">
          <strong>Coach Observation:</strong> {mockMovementData.notes}
        </p>
      </div>
    </div>
  );
};

export default Movement;
