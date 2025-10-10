import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import { clearError, registerUser } from "../../../redux/reducers/authReducer/authSlice";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        {error && (
          <p className="bg-red-500 text-white text-sm p-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none"
          />
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
            className="w-full bg-purple-600 hover:bg-purple-700 transition text-white p-3 rounded font-semibold"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-300 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
