import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { type AppDispatch, type RootState } from "../../redux/store";
import {
  fetchCurrentUser,
  logoutUser,
} from "../../redux/reducers/authReducer/authSlice";
import Footer from "./footer";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-transparent relative">
        <h1 className="text-3xl font-extrabold text-yellow-400 tracking-wide">
          StageHub<span className="text-white">.</span>
        </h1>

        <div className="hidden md:flex gap-8 text-lg">
          <a href="#artists" className="hover:text-yellow-400 transition-all">
            Artists
          </a>
          <a
            href="#howitworks"
            className="hover:text-yellow-400 transition-all"
          >
            How It Works
          </a>
          <a href="#contact" className="hover:text-yellow-400 transition-all">
            Contact
          </a>
        </div>

        {/* User / Get Started Button */}
        <div className="flex items-center gap-4 relative">
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-yellow-400 text-black px-5 py-2 rounded-full font-semibold hover:bg-yellow-300 transition-all"
            >
              Get Started
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 border border-yellow-400 px-4 py-2 rounded-full font-semibold hover:bg-yellow-400 hover:text-black transition-all"
              >
                <span>{user.name}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    menuOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-lg py-2 z-50">
                  <button
                    onClick={() => navigate("/profile")}
                    className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-20">
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Connect with{" "}
            <span className="text-yellow-400">Talented Artists</span> for Your
            Next Event
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Discover and hire the best{" "}
            <strong>bands, solo performers, MCs, dancers, DJs,</strong> and
            <strong> event planners</strong> all in one place.
          </p>
          <div className="flex gap-6">
            <button
              onClick={() => navigate("/getAllArtists")}
              className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all"
            >
              Explore Artists
            </button>

            {!user ? (
              <button
                onClick={() => navigate("/register")}
                className="border border-yellow-400 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all"
              >
                Join as Artist
              </button>
            ) : (
              <button
                onClick={() => navigate("/createArtist")}
                className="border border-yellow-400 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all"
              >
                Create Profile
              </button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 mt-12 md:mt-0 flex justify-center"
        >
          <img
            src="/images/performance.jpg"
            alt="StageHub artists performing"
            className="rounded-2xl shadow-2xl w-full max-w-lg"
          />
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="howitworks" className="py-20 bg-gray-800 text-center">
        <h3 className="text-4xl font-bold mb-12 text-yellow-400">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-10 md:px-20">
          {[
            {
              title: "Sign Up",
              desc: "Create your artist profile in minutes.",
            },
            {
              title: "Showcase",
              desc: "Upload your work and highlight your talent.",
            },
            {
              title: "Get Booked",
              desc: "Connect, negotiate, and perform. Simple as that.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <h4 className="text-2xl font-bold mb-3">{step.title}</h4>
              <p className="text-gray-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
     <Footer/>
    </div>
  );
};

export default LandingPage;
