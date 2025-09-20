// src/components/athlete-profile/NotesTab.jsx
import React, { useMemo, useState } from "react";

function NoteCard({ note, onPin, onDelete }) {
  const created = note.created_at
    ? new Date(note.created_at).toLocaleString()
    : "—";
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{created}</div>
          {note.tags?.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {note.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full border"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`text-xs px-2 py-1 rounded-full border ${
              note.pinned ? "bg-yellow-50" : ""
            }`}
            onClick={() => onPin?.(note)}
            title={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned ? "★ Pinned" : "☆ Pin"}
          </button>
          <button
            className="text-xs px-2 py-1 rounded-full border hover:bg-red-50"
            onClick={() => onDelete?.(note)}
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{note.text}</p>
      {note.author && (
        <div className="mt-2 text-xs text-muted-foreground">
          by {note.author}
        </div>
      )}
    </div>
  );
}

export default function NotesTab({ notes, onCreate, onPin, onDelete }) {
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // NEW: filter state
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]); // store lowercase
  const [onlyPinned, setOnlyPinned] = useState(false);

  // Sort: pinned first, then newest
  const ordered = useMemo(() => {
    const arr = [...(notes || [])];
    return arr.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.created_at || "").localeCompare(a.created_at || "");
    });
  }, [notes]);

  // All tags + counts (for chips)
  const allTags = useMemo(() => {
    const map = new Map();
    (notes || []).forEach((n) =>
      (n.tags || []).forEach((t) => {
        const k = String(t).trim();
        if (!k) return;
        map.set(k, (map.get(k) || 0) + 1);
      })
    );
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [notes]);

  // Apply filters (in-memory)
  const filtered = useMemo(() => {
    let arr = ordered;
    if (onlyPinned) arr = arr.filter((n) => n.pinned);

    if (selectedTags.length) {
      const set = new Set(selectedTags);
      arr = arr.filter((n) => {
        const tags = (n.tags || []).map((t) => String(t).toLowerCase());
        // match ANY selected tag
        return tags.some((t) => set.has(t));
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter((n) => {
        const haystack = [
          n.text || "",
          n.author || "",
          (n.tags || []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return arr;
  }, [ordered, onlyPinned, selectedTags, search]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onCreate?.({ text: text.trim(), tags });
    setText("");
    setTagsInput("");
  };

  // Tag chip toggle
  const toggleTag = (tag) => {
    const k = String(tag).toLowerCase();
    setSelectedTags((prev) =>
      prev.includes(k) ? prev.filter((t) => t !== k) : [...prev, k]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTags([]);
    setOnlyPinned(false);
  };

  return (
    <div className="space-y-6">
      {/* Create note */}
      <form
        onSubmit={submit}
        className="rounded-2xl border bg-white p-4 space-y-3"
      >
        <div className="text-sm font-semibold">Add Note</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Session highlights, adherence, cues that worked…"
          className="w-full p-2 border rounded min-h-[100px]"
        />
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (comma separated, e.g. mobility, sprint)"
          className="w-full p-2 border rounded"
        />
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Save Note
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes or tags…"
            className="px-3 py-2 border rounded flex-1 min-w-[220px]"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-black"
              checked={onlyPinned}
              onChange={(e) => setOnlyPinned(e.target.checked)}
            />
            Only pinned
          </label>
          {(selectedTags.length > 0 || search || onlyPinned) && (
            <button
              className="text-sm px-3 py-2 rounded border"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          )}
        </div>

        {!!allTags.length && (
          <div className="flex flex-wrap gap-1">
            {allTags.map(({ tag, count }) => {
              const active = selectedTags.includes(tag.toLowerCase());
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  type="button"
                  className={`text-[11px] px-2 py-1 rounded-full border ${
                    active ? "bg-black text-white border-black" : ""
                  }`}
                  title={`${count} note${count === 1 ? "" : "s"}`}
                >
                  {tag}
                  <span className="opacity-60 ml-1">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Showing {filtered.length} of {ordered.length} notes
          {selectedTags.length > 0 && (
            <>
              {" "}
              • Tags:{" "}
              {selectedTags.map((t, i) => (
                <span key={t}>
                  {i ? ", " : ""}
                  {t}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-6 text-sm text-gray-500 bg-white">
          No notes match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((n) => (
            <NoteCard
              key={n.id || n.temp_id}
              note={n}
              onPin={onPin}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
