// Assessments.jsx
import React from "react";

const Assessments = ({ athleteId }) => {
  const mockAssessments = [
    {
      date: "2025-07-01",
      cmfLeft: 135,
      cmfRight: 130,
      cmpLeft: 140,
      cmpRight: 155,
    },
    {
      date: "2025-06-01",
      cmfLeft: 125,
      cmfRight: 120,
      cmpLeft: 135,
      cmpRight: 150,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Past Assessments</h2>
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">CMF (L/R)</th>
            <th className="p-2">CMP (L/R)</th>
          </tr>
        </thead>
        <tbody>
          {mockAssessments.map((a, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{a.date}</td>
              <td className="p-2">
                {a.cmfLeft} / {a.cmfRight}
              </td>
              <td className="p-2">
                {a.cmpLeft} / {a.cmpRight}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 bg-blue-100 p-4 rounded">
        <p className="text-sm text-blue-900 font-medium">
          📊 Progress Graph Placeholder
        </p>
        <p className="text-sm">
          [Graph will go here with CMF/CMP trends over time]
        </p>
      </div>
    </div>
  );
};

export default Assessments;
