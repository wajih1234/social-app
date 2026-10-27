import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/signup", form);
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const inputClass =
    "border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 w-full";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800">Sign up</h1>
        <p className="text-gray-500 mb-4">It's quick and easy.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-3">
            <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required className={inputClass} />
            <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required className={inputClass} />
          </div>
          <input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} required className={inputClass} />
          <input name="password" type="password" placeholder="New password (6+ characters)" value={form.password} onChange={handleChange} required minLength={6} className={inputClass} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="bg-green-600 text-white font-bold rounded-lg py-3 hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign up"}
          </button>
          <Link to="/login" className="text-blue-600 text-center">
            Already have an account?
          </Link>
        </form>
      </div>
    </div>
  );
}