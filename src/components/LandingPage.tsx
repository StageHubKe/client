import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentUser,
  logoutUser,
} from "../../redux/reducers/authReducer/authSlice";
import { getAllArtistProfiles } from "../../redux/reducers/artistReducer/artistSlice";
import { fetchUnreadCount, setUnreadCount } from "../../redux/reducers/messageReducer/messageSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Footer from "./footer";
import type { AppDispatch, RootState } from "../../redux/store";
import { socket } from "../socket";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { allProfiles } = useSelector((state: RootState) => state.artist);
  const { unreadCount } = useSelector((state: RootState) => state.messages);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(getAllArtistProfiles());
    if (user) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;

    const handleUnreadCountUpdated = ({ count }: { count: number }) => {
      dispatch(setUnreadCount(count));
    };

    socket.on("unread_count_updated", handleUnreadCountUpdated);

    return () => {
      socket.off("unread_count_updated", handleUnreadCountUpdated);
    };
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const hasProfile =
    user &&
    allProfiles.some(
      (profile) =>
        profile.user &&
        (typeof profile.user === "object"
          ? profile.user._id === user._id
          : profile.user === user._id)
    );

  const currentUserProfile = allProfiles.find(
    (profile) =>
      profile.user &&
      (typeof profile.user === "object"
        ? profile.user._id === user?._id
        : profile.user === user?._id)
  );
  const artistId = currentUserProfile?._id;

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

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-lg py-2 z-50">
                  {artistId && (
                    <button
                      onClick={() => navigate(`/artist/${artistId}`)}
                      className="flex justify-between items-center w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 transition"
                    >
                      <span>View Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate("/conversations")}
                    className="flex justify-between items-center w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 transition relative"
                  >
                    <span>Messages</span>
                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
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

            {user && !hasProfile && (
              <button
                onClick={() => navigate("/createArtist")}
                className="border border-yellow-400 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all"
              >
                Create Profile
              </button>
            )}

            {!user && (
              <button
                onClick={() => navigate("/register")}
                className="border border-yellow-400 px-6 py-3 rounded-full font-bold text-lg hover:bg-yellow-400 hover:text-black transition-all"
              >
                Join as Artist
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

      <Footer />
    </div>
  );
};

export default LandingPage;