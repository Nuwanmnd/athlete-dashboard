// src/components/RecentAssessments.jsx
import React from "react";
import ContentLoader from "react-content-loader";

const AssessmentSkeleton = () => (
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
      <rect x="55" y="30" rx="4" ry="4" width="180" height="10" />
      <rect x="0" y="60" rx="4" ry="4" width="280" height="10" />
      <rect x="0" y="80" rx="4" ry="4" width="250" height="10" />
      <rect x="0" y="100" rx="4" ry="4" width="200" height="10" />
    </ContentLoader>
  </div>
);

const RecentAssessments = ({ assessments, loading }) => {
  return (
    <div className="space-y-4 max-h-[450px]">
      {loading
        ? Array(3)
            .fill(0)
            .map((_, i) => <AssessmentSkeleton key={i} />)
        : assessments.map((a, idx) => (
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
                🧭 Force Deficit L/R:{" "}
                <strong>
                  {a.cmp_force_left} / {a.cmp_force_right} N
                </strong>
                <br />
                📉 % Below Target:{" "}
                <strong>
                  {a.below_target_left}% / {a.below_target_right}%
                </strong>
                <br />⚡ CMP/CMF Ratio:{" "}
                <strong>
                  {a.cmp_cmf_ratio_left} / {a.cmp_cmf_ratio_right}
                </strong>
              </div>
            </div>
          ))}
    </div>
  );
};

export default RecentAssessments;
