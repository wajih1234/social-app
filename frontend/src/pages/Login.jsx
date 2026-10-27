import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row items-center justify-center gap-10 p-6">
      <div className="max-w-md text-center md:text-left">
        <h1 className="text-5xl font-bold text-blue-600">socialapp</h1>
        <p className="text-2xl mt-4 text-gray-800">
          Connect with your friends and share what's on your mind.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="bg-blue-600 text-white font-bold rounded-lg py-3 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
          <hr className="my-2" />
          <Link
            to="/signup"
            className="bg-green-600 text-white font-bold rounded-lg py-3 text-center hover:bg-green-700"
          >
            Create new account
          </Link>
        </form>
      </div>
    </div>
  );
}