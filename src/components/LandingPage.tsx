import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Footer from "./footer";
import type { AppDispatch, RootState } from "../../redux/store";
import {
  fetchCurrentUser,
  logoutUser,
} from "../../redux/reducers/authReducer/authSlice";
import { getAllArtistProfiles } from "../../redux/reducers/artistReducer/artistSlice";
import {
  fetchUnreadCount,
  setUnreadCount,
} from "../../redux/reducers/messageReducer/messageSlice";
import { fetchNotifications, addNotification } from "../../redux/reducers/notificationReducer/notificationSlice";
import { socket } from "../socket";
import { Menu, X, MessageCircle } from "lucide-react";

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
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    const handleUnreadCountUpdated = ({ count }: { count: number }) => {
      dispatch(setUnreadCount(count));
    };

    const handleNewNotification = (notification: {
      message: string;
      bidderId: string;
      bidderName: string;
      gigId: string;
      read: boolean;
    }) => {
      dispatch(
        addNotification({
          _id: Date.now().toString(),
          recipient: user._id,
          message: notification.message,
          bidderId: notification.bidderId,
          bidderName: notification.bidderName,
          gigId: notification.gigId,
          type: "bid",
          read: notification.read,
          createdAt: new Date().toISOString(),
        })
      );
    };

    socket.on("unread_count_updated", handleUnreadCountUpdated);
    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("unread_count_updated", handleUnreadCountUpdated);
      socket.off("new_notification", handleNewNotification);
    };
  }, [user, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    socket.disconnect();
    setMenuOpen(false);
    navigate("/login");
  };

  const hasProfile =
    user &&
    allProfiles.some((profile) =>
      typeof profile.user === "object"
        ? profile.user._id === user._id
        : profile.user === user._id
    );

  const currentUserProfile = allProfiles.find((profile) =>
    typeof profile.user === "object"
      ? profile.user._id === user?._id
      : profile.user === user?._id
  );
  const artistId = currentUserProfile?._id;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center p-5 md:px-16 bg-black/40 backdrop-blur-md z-50">
        <h1
          className="text-3xl font-extrabold text-yellow-400 cursor-pointer tracking-wide"
          onClick={() => navigate("/")}
        >
          StageHub<span className="text-white">.</span>
        </h1>

        {/* Desktop/Medium Menu */}
        <div className="hidden md:flex items-center gap-8 text-lg font-medium">
          <div className="relative group">
            <button className="hover:text-yellow-400 transition-all">
              Explore
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              <button
                onClick={() => navigate("/getAllArtists")}
                className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              >
                Artists
              </button>
              <button
                onClick={() => navigate("/gig-posts")}
                className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              >
                Gigs
              </button>
              <button
                onClick={() => navigate("/events")}
                className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              >
                Events
              </button>
            </div>
          </div>
          <div className="relative group">
            <button className="hover:text-yellow-400 transition-all">
              Create
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              <button
                onClick={() => navigate("/create-gig")}
                className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              >
                Gig
              </button>
              <button
                onClick={() => navigate("/create-event")}
                className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              >
                Event
              </button>
            </div>
          </div>
          <a href="#howitworks" className="hover:text-yellow-400 transition-all">
            How It Works
          </a>
          <a href="#contact" className="hover:text-yellow-400 transition-all">
            Contact
          </a>
          {user && (
            <button
              onClick={() => navigate("/conversations")}
              className="flex items-center gap-1.5 pr-3 hover:text-yellow-400 transition relative"
            >
              <MessageCircle size={20} />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="absolute top-3.5 right-0 ml-[9rem] transform translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-white"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold hover:bg-yellow-300 transition"
            >
              Get Started
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition font-semibold"
                aria-label="Toggle user menu"
                aria-expanded={menuOpen}
              >
                {user?.authProvider === "google" && user?.picture && (
                  <img
                    src={user.picture}
                    alt={`${user.name}'s profile`}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {(!user?.picture || user?.authProvider !== "google") && (
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="truncate max-w-20">{user.name}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    menuOpen ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-gray-800 rounded-xl shadow-xl py-2 z-50"
                >
                  {artistId && (
                    <button
                      onClick={() => {
                        navigate(`/artist/${artistId}`);
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
                    >
                      View Profile
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate("/my-bids");
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
                  >
                    My Bids
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-5 py-2 text-red-400 hover:bg-gray-700 transition"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-gray-800 rounded-b-xl shadow-xl py-4 z-50"
          >
            <button
              onClick={() => {
                navigate("/getAllArtists");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
            >
              Artists
            </button>
            <button
              onClick={() => {
                navigate("/gig-posts");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
            >
              Gigs
            </button>
            <button
              onClick={() => {
                navigate("/events");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
            >
              Events
            </button>
            <button
              onClick={() => {
                navigate("/create-gig");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
            >
              Create Gig
            </button>
            <button
              onClick={() => {
                navigate("/create-event");
                setMenuOpen(false);
              }}
              className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
            >
              Create Event
            </button>
            {user && (
              <button
                onClick={() => {
                  navigate("/my-bids");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              >
                My Bids
              </button>
            )}
            <a
              href="#howitworks"
              className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              onClick={() => setMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#contact"
              className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>
            {!user ? (
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-5 py-2 text-yellow-400 hover:bg-gray-700 transition"
              >
                Get Started
              </button>
            ) : (
              <>
                {artistId && (
                  <button
                    onClick={() => {
                      navigate(`/artist/${artistId}`);
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-5 py-2 hover:bg-gray-700 transition"
                  >
                    View Profile
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate("/conversations");
                    setMenuOpen(false);
                  }}
                  className="flex items-center justify-between w-full text-left px-5 py-2 hover:bg-gray-700 transition"
                >
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-5 py-2 text-red-400 hover:bg-gray-700 transition"
                >
                  Logout
                </button>
              </>
            )}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 pt-32 md:pt-40 pb-20 gap-12">
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Discover & Book <span className="text-yellow-400">Top Talent</span>{" "}
            for Your Events
          </h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed">
            Connect with <strong>performers</strong>, <strong>DJs</strong>, <strong>bands</strong>,
            <strong> MCs</strong>, and more. StageHub makes finding and booking talent seamless.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/getAllArtists")}
              className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-300 transition-all"
            >
              Explore Artists
            </button>
            {user && !hasProfile && (
              <button
                onClick={() => navigate("/createArtist")}
                className="border border-yellow-400 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 hover:text-black transition-all"
              >
                Create Profile
              </button>
            )}
            {!user && (
              <button
                onClick={() => navigate("/register")}
                className="border border-yellow-400 px-6 py-3 rounded-full font-bold hover:bg-yellow-400 hover:text-black transition-all"
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
          className="md:w-1/2 flex justify-center"
        >
          <img
            src="/images/performance.jpg"
            alt="StageHub artists performing"
            className="rounded-2xl shadow-2xl w-full max-w-lg object-cover"
          />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section
        id="howitworks"
        className="py-24 bg-gray-800 text-center px-8 md:px-20"
      >
        <h3 className="text-4xl font-bold mb-14 text-yellow-400">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
              transition={{ duration: 0.3 }}
              className="bg-gray-900 p-8 rounded-2xl shadow-lg hover:shadow-yellow-400/20 transition"
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