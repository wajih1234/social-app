import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Avatar from "../components/Avatar";

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  // wait 300ms after the last keystroke before calling the API
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!q.trim()) return setResults([]);
      api.get(`/users/search?q=${encodeURIComponent(q)}`).then((res) => setResults(res.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Find friends</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name..."
        className="w-full bg-gray-100 rounded-full px-4 py-2 outline-none mb-4"
      />
      {results.map((u) => (
        <Link
          key={u._id}
          to={`/profile/${u._id}`}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 font-medium"
        >
          <Avatar user={u} size={44} />
          {u.firstName} {u.lastName}
        </Link>
      ))}
      {q.trim() && results.length === 0 && (
        <p className="text-gray-500 text-center">No results</p>
      )}
    </div>
  );
}