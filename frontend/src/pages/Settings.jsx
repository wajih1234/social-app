import { useState } from "react";
import api from "../api";
import uploadImage from "../uploadImage";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar || "",
    coverPhoto: user.coverPhoto || "",
  });
  const [message, setMessage] = useState({ text: "", error: false });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setMessage({ text: "", error: false });
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, [field]: url }));
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Upload failed", error: true });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", error: false });
    try {
      const res = await api.put("/users/me", form);
      setUser(res.data);
      setMessage({ text: "Settings saved", error: false });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Something went wrong", error: true });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-blue-500";
  const fileClass =
    "text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:font-medium hover:file:bg-gray-300";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-600">First name</label>
        <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputClass} />

        <label className="text-sm font-medium text-gray-600">Last name</label>
        <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputClass} />

        <label className="text-sm font-medium text-gray-600">Profile picture</label>
        <div className="flex items-center gap-4">
          <Avatar user={{ ...user, avatar: form.avatar }} size={64} />
          <input type="file" accept="image/*" onChange={(e) => handleFile(e, "avatar")} className={fileClass} />
        </div>

        <label className="text-sm font-medium text-gray-600">Cover photo</label>
        <div
          className="h-32 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 bg-cover bg-center"
          style={form.coverPhoto ? { backgroundImage: `url(${form.coverPhoto})` } : {}}
        />
        <input type="file" accept="image/*" onChange={(e) => handleFile(e, "coverPhoto")} className={fileClass} />

        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {message.text && (
          <p className={`text-sm ${message.error ? "text-red-600" : "text-green-700"}`}>
            {message.text}
          </p>
        )}

        <button
          disabled={loading || uploading}
          className="bg-blue-600 text-white font-semibold rounded-lg py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>

      <hr className="my-6" />
      <button onClick={logout} className="bg-red-600 text-white rounded-lg px-4 py-2 font-medium">
        Log out
      </button>
    </div>
  );
}