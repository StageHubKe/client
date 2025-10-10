import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import { clearError, loginUser } from "../../../redux/reducers/authReducer/authSlice";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, success, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  // Redirect to landing page on login success
  useEffect(() => {
    if (success && user) {
      navigate("/");
    }
  }, [success, user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>

        {error && (
          <p className="bg-red-500 text-white text-sm p-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white p-3 rounded font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
