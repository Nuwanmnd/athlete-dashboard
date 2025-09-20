// src/components/InjuryResults.jsx
import React from "react";
import ContentLoader from "react-content-loader";

const InjurySkeleton = () => (
  <div className="p-4 border rounded-xl shadow-sm bg-white animate-pulse">
    <ContentLoader
      speed={2}
      width={300}
      height={110}
      viewBox="0 0 300 110"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <circle cx="25" cy="25" r="20" />
      <rect x="55" y="10" rx="4" ry="4" width="200" height="10" />
      <rect x="0" y="50" rx="4" ry="4" width="280" height="10" />
      <rect x="0" y="70" rx="4" ry="4" width="250" height="10" />
      <rect x="0" y="90" rx="4" ry="4" width="200" height="10" />
    </ContentLoader>
  </div>
);

const InjuryResults = ({ injuries, loading }) => {
  return (
    <div className="space-y-4 max-h-[450px]">
      {loading
        ? Array(3)
            .fill(0)
            .map((_, i) => <InjurySkeleton key={i} />)
        : injuries.map((a, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-xl shadow-sm bg-white hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4 mb-2">
                {a.photoUrl ? (
                  <img
                    src={a.photoUrl}
                    alt="athlete"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold">
                    {a.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <h3 className="font-semibold text-gray-800">{a.name}</h3>
              </div>
              <div className="text-sm text-gray-600">
                Injury: <strong>{a.area}</strong>
                <br />
                Severity: <strong>{a.severity}</strong>
                <br />
                Status: <strong>{a.status}</strong>
              </div>
            </div>
          ))}
    </div>
  );
};

export default InjuryResults;
