import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { forgotPassword } from "../../../redux/reducers/authReducer/authSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, message, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Forgot Your Password?
        </h2>

        <p className="text-center text-gray-300 mb-6 text-sm">
          Enter your registered email address, and we’ll send you a link to
          reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white p-3 rounded font-semibold disabled:opacity-60"
          >
            {loading ? "Sending Reset Link..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-400 text-sm">{message}</p>
        )}
        {error && <p className="mt-4 text-center text-red-400 text-sm">{error}</p>}

        <p className="mt-6 text-center text-gray-300 text-sm">
          Remember your password?{" "}
          <a
            href="/login"
            className="text-indigo-400 hover:underline transition"
          >
            Go back to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;