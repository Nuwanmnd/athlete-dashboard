// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "@/utils/api";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white border p-5 text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

// ---- helpers
const toAbsUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  const base = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  const path = p.startsWith("/") ? p : `/${p}`;
  return base + path; // /api/uploads/xyz.jpg
};
const initialsObj = (a) =>
  `${a?.first_name?.[0] || ""}${a?.last_name?.[0] || ""}`
    .trim()
    .toUpperCase() || "?";
const initialsFromName = (full) => {
  if (!full) return "?";
  const parts = full.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [allAthletes, setAllAthletes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGet("/dashboard/overview")
      .then(setStats)
      .catch(() => setStats(null));
    apiGet("/athletes/")
      .then(setAllAthletes)
      .catch(() => setAllAthletes([]));
  }, []);

  const athletesFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allAthletes;
    return allAthletes.filter((a) => {
      const name = `${a.first_name || ""} ${a.last_name || ""}`.toLowerCase();
      return (
        name.includes(q) ||
        (a.level || "").toLowerCase().includes(q) ||
        (a.sport || "").toLowerCase().includes(q)
      );
    });
  }, [search, allAthletes]);

  const nameById = useMemo(() => {
    const m = new Map();
    allAthletes.forEach((a) =>
      m.set(a.id, `${a.first_name} ${a.last_name}`.trim())
    );
    return m;
  }, [allAthletes]);

  const avatarById = useMemo(() => {
    const m = new Map();
    allAthletes.forEach((a) => m.set(a.id, toAbsUrl(a.photo_url)));
    return m;
  }, [allAthletes]);

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Athletes" value={stats?.total_athletes ?? "—"} />
        <StatCard
          label="Total Assessments"
          value={stats?.total_assessments ?? "—"}
        />
        <StatCard
          label="Movement Assessments"
          value={stats?.total_movement_assessments ?? "—"}
        />
        <StatCard
          label="Injured Athletes"
          value={stats?.injured_athletes ?? "—"}
        />
      </div>

      {/* Search + Add */}
      <div className="flex items-center justify-between">
        <input
          className="w-80 max-w-full p-2 border rounded-xl bg-white"
          placeholder="Search athlete..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link
          to="/add-athlete"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          + Add Athlete
        </Link>
      </div>

      {/* Athletes table */}
      <div className="rounded-2xl border bg-white">
        <div className="px-4 py-3 border-b font-semibold">Athletes</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Athlete Name</th>
                <th className="text-left px-4 py-2">Level</th>
                <th className="text-left px-4 py-2">Sport</th>
                <th className="text-right px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {athletesFiltered.map((a) => {
                const avatar = toAbsUrl(a.photo_url);
                return (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center text-xs font-semibold">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={`${a.first_name} ${a.last_name} avatar`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span>{initialsObj(a)}</span>
                          )}
                        </div>
                        <span className="font-medium">
                          {a.first_name} {a.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{a.level || "—"}</td>
                    <td className="px-4 py-2">{a.sport || "—"}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="px-3 py-1.5 border rounded-xl hover:bg-gray-50"
                        onClick={() => navigate(`/athletes/${a.id}`)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
              {athletesFiltered.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={4}
                  >
                    No athletes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpdatesCard title="Latest Assessments">
          {stats?.latest_assessments?.map((x) => (
            <UpdateRow
              key={`a-${x.id}`}
              primary={nameById.get(x.athlete_id) || `Athlete #${x.athlete_id}`}
              secondary={x.date || x.created_at || ""}
              avatar={avatarById.get(x.athlete_id)}
              onClick={() => navigate(`/athletes/${x.athlete_id}`)}
            />
          )) || <EmptyList />}
        </UpdatesCard>

        <UpdatesCard title="Movement Assessment Results">
          {stats?.latest_movements?.map((x) => (
            <UpdateRow
              key={`m-${x.id}`}
              primary={nameById.get(x.athlete_id) || `Athlete #${x.athlete_id}`}
              secondary={x.created_at || ""}
              avatar={avatarById.get(x.athlete_id)}
              onClick={() => navigate(`/athletes/${x.athlete_id}`)}
            />
          )) || <EmptyList />}
        </UpdatesCard>

        <UpdatesCard title="Injuries">
          {stats?.latest_injuries?.map((x) => (
            <UpdateRow
              key={`i-${x.id}`}
              primary={nameById.get(x.athlete_id) || `Athlete #${x.athlete_id}`}
              secondary={`${x.status}${x.area ? " • " + x.area : ""}${
                x.date_reported ? " • " + x.date_reported : ""
              }`}
              avatar={avatarById.get(x.athlete_id)}
              onClick={() => navigate(`/athletes/${x.athlete_id}`)}
            />
          )) || <EmptyList />}
        </UpdatesCard>
      </div>
    </div>
  );
}

function UpdatesCard({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white">
      <div className="px-4 py-3 border-b font-semibold">{title}</div>
      <div className="p-2 space-y-1 max-h-72 overflow-auto">{children}</div>
    </div>
  );
}

function UpdateRow({ primary, secondary, avatar, onClick }) {
  const initials = initialsFromName(primary);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left"
      title={primary}
    >
      <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50">
        <div className="w-7 h-7 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center text-[10px] font-semibold shrink-0">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{primary}</div>
          <div className="text-xs text-gray-500 truncate">{secondary}</div>
        </div>
      </div>
    </button>
  );
}

function EmptyList() {
  return (
    <div className="text-sm text-gray-500 px-2 py-1.5">No recent items.</div>
  );
}
