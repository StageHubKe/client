import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify/${token}`, {
          withCredentials: true,
        });
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully!");
      } catch (err) {
        console.error("Verification failed:", err);
        setStatus("error");
        setMessage("Verification failed or link expired.");
      }
    };
    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      {status === "loading" && (
        <p className="text-lg text-gray-600">Verifying your email...</p>
      )}

      {status === "success" && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">✅ Verified!</h1>
          <p className="mt-3 text-gray-700">{message}</p>
          <Link
            to="/login"
            className="mt-6 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Go to Login
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">❌ Verification Failed</h1>
          <p className="mt-3 text-gray-700">{message}</p>
          <Link
            to="/register"
            className="mt-6 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
