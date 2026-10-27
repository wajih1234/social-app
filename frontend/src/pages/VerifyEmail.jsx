import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

export default function VerifyEmail() {
  const { token } = useParams();
  const called = useRef(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    api
      .get(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Something went wrong");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        {status === "loading" && <p>Verifying your email...</p>}
        {status !== "loading" && (
          <>
            <p className={status === "success" ? "text-green-700" : "text-red-600"}>
              {message}
            </p>
            <Link to="/login" className="text-blue-600 block mt-4">
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}