import { useState } from "react";
import api from "../api";
import uploadImage from "../uploadImage";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function CreatePost({ onCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setInputKey((k) => k + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    setLoading(true);
    setError("");
    try {
      const image = file ? await uploadImage(file) : "";
      const res = await api.post("/posts", { text, image });
      onCreated(res.data);
      setText("");
      removeFile();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="flex gap-3">
        <Avatar user={user} size={40} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`What's on your mind, ${user.firstName}?`}
          rows={2}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 outline-none resize-none"
        />
      </div>

      {preview && (
        <div className="relative mt-3">
          <img src={preview} alt="" className="w-full max-h-64 object-cover rounded-lg" />
          <button
            type="button"
            onClick={removeFile}
            className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 shadow font-bold"
          >
            ×
          </button>
        </div>
      )}

      <input
        key={inputKey}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="mt-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:font-medium hover:file:bg-gray-300"
      />

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <button
        disabled={loading}
        className="w-full mt-3 bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}