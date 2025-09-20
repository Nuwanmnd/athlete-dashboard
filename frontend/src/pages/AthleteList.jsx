import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = (import.meta.env.VITE_API_BASE || "/api").replace(
  /\/$/,
  ""
);

const toAbsUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  return API + (p.startsWith("/") ? p : `/${p}`);
};

function AvatarCell({ a }) {
  const src = useMemo(() => toAbsUrl(a?.photo_url), [a?.photo_url]);
  const initials =
    `${a?.first_name?.[0] || ""}${a?.last_name?.[0] || ""}`.toUpperCase() ||
    "A";
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center text-xs font-semibold">
        {src ? (
          <img
            src={src}
            alt={`${a.first_name} ${a.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="font-medium">
        {a.first_name} {a.last_name}
      </div>
    </div>
  );
}

export default function AthleteList() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`${API}/athletes/`)
      .then((res) => res.json())
      .then((data) => setAthletes(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch athletes", err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (a) => {
    const ok = window.confirm(
      `Permanently delete ${a.first_name} ${a.last_name}? \n\nThis will also remove all of their assessments, movement screens, injuries, and notes.`
    );
    if (!ok) return;

    try {
      const res = await fetch(`${API}/athletes/${a.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const msg = await res.text();
        throw new Error(msg || "Delete failed");
      }
      setAthletes((prev) => prev.filter((x) => x.id !== a.id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete athlete. See console for details.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Athlete List</h2>
        <Link
          to="/"
          className="text-sm px-3 py-1.5 rounded-xl border hover:bg-gray-50"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Athlete</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">City</th>
              <th className="px-4 py-3 text-left font-medium">Sport</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-gray-50/50">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : athletes.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-500" colSpan={5}>
                  No athletes yet.
                </td>
              </tr>
            ) : (
              athletes.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <AvatarCell a={a} />
                  </td>
                  <td className="px-4 py-3">{a.email || "—"}</td>
                  <td className="px-4 py-3">{a.city || "—"}</td>
                  <td className="px-4 py-3">{a.sport || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/athletes/${a.id}`}
                        className="px-2.5 py-1.5 rounded-lg border hover:bg-gray-50"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(a)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                        title="Delete athlete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
