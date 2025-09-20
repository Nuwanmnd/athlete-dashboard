// Comment Box
import { useEffect, useState } from "react";

function CommentBox({ athleteId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch(`/api/comments/${athleteId}`)
      .then((res) => res.json())
      .then(setComments);
  }, [athleteId]);

  const submitComment = async () => {
    await fetch("/api/comments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        athlete_id: athleteId,
        section: "general",
        content: comment,
        date: new Date().toISOString().split("T")[0],
      }),
    });
    setComment("");
    const res = await fetch(`/api/comments/${athleteId}`);
    const data = await res.json();
    setComments(data);
  };

  return (
    <div className="border p-4 rounded shadow">
      <h3 className="font-bold text-xl mb-2">Coach Comments</h3>
      <textarea
        className="w-full border p-2 rounded mb-2"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
      />
      <button
        onClick={submitComment}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Comment
      </button>
      <ul className="mt-4 space-y-1">
        {comments.map((c, i) => (
          <li key={i} className="text-sm text-gray-700 border-t pt-1">
            {c.date}: {c.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommentBox;
