// src/components/MovementResults.jsx
import React from "react";
import ContentLoader from "react-content-loader";

const MovementSkeleton = () => (
  <div className="p-4 border rounded-xl shadow-sm bg-white animate-pulse">
    <ContentLoader
      speed={2}
      width={300}
      height={100}
      viewBox="0 0 300 100"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <circle cx="25" cy="25" r="20" />
      <rect x="55" y="10" rx="4" ry="4" width="200" height="10" />
      <rect x="0" y="50" rx="4" ry="4" width="280" height="10" />
      <rect x="0" y="70" rx="4" ry="4" width="250" height="10" />
    </ContentLoader>
  </div>
);

const MovementResults = ({ movements, loading }) => {
  return (
    <div className="space-y-4 max-h-[450px]">
      {loading
        ? Array(3)
            .fill(0)
            .map((_, i) => <MovementSkeleton key={i} />)
        : movements.map((a, idx) => (
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
                Overworking: <strong>{a.overworking || "None"}</strong>
                <br />
                Underworking: <strong>{a.underworking || "None"}</strong>
              </div>
            </div>
          ))}
    </div>
  );
};

export default MovementResults;
