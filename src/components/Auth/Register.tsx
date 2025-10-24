import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  clearError,
  googleLogin,
  registerUser,
} from "../../../redux/reducers/authReducer/authSlice";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  // Redirect on success
  useEffect(() => {
    if (success) {
      navigate("/login");
    }
  }, [success, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-900 px-4">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md shadow-2xl border border-white/10 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-300">
          Create Your Account
        </h2>

        {error && (
          <p className="bg-red-600/80 text-white text-sm p-2 rounded-lg mb-4 text-center shadow-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 transition-all text-white p-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-900/40 disabled:opacity-70"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-gray-300 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition underline-offset-2 hover:underline"
          >
            Login here
          </Link>
        </p>

        <div className="mt-6">
          <h3 className="text-center text-white/90 text-lg font-semibold mb-3">
            Or sign in with Google
          </h3>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) {
                  dispatch(googleLogin({ credential: response.credential }));
                }
              }}
              onError={() => console.log("Google Login Failed")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
