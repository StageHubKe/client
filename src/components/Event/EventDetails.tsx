import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  deleteEvent,
  getEventById,
} from "../../../redux/reducers/EventReducer/eventSlice";
import { Menu, X, ArrowLeft } from "lucide-react";

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { singleEvent, loading, error } = useSelector(
    (state: RootState) => state.event
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (id) dispatch(getEventById(id));
  }, [dispatch, id]);

  const handleDelete = async () => {
    try {
      await dispatch(deleteEvent(id!)).unwrap();
      toast.success("🗑️ Event deleted successfully");
      navigate("/events");
    } catch {
      toast.error("❌ Failed to delete event");
    }
  };

  const handleUpdate = () => {
    navigate(`/events/update/${id}`);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-xl text-gray-300 animate-pulse">Loading event...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-red-400 text-lg font-semibold">{error}</p>
      </div>
    );

  if (!singleEvent)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-gray-400 text-lg">Event not found.</p>
      </div>
    );

  const isCreator = user?._id === singleEvent.createdBy?._id;

  return (
    <div className="w-full min-h-screen flex justify-center items-start py-10 bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
      <div className="w-full max-w-4xl bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900/50">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium text-gray-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={18} /> Back to Events
          </button>

          {isCreator && (
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-200 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 focus:outline-none transition"
              aria-label="Toggle action menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>

        {/* Event Image */}
        {singleEvent.image && (
          <div className="relative">
            <img
              src={singleEvent.image}
              alt={singleEvent.title}
              className="w-full h-80 object-cover transition duration-300 hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        )}

        {/* Event Details Card */}
        <div className="p-6 bg-white rounded-t-3xl shadow-inner relative">
          <h1 className="text-3xl font-bold text-indigo-700 mb-3">
            {singleEvent.title}
          </h1>
          <p className="text-gray-700 leading-relaxed mb-4">
            {singleEvent.description}
          </p>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              📍 <span className="font-medium">Location:</span>{" "}
              {singleEvent.location}
            </p>
            <p>
              📅 <span className="font-medium">Date:</span>{" "}
              {new Date(singleEvent.date).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p>
              🎭 <span className="font-medium">Type:</span>{" "}
              {singleEvent.eventType?.toUpperCase()}
            </p>
          </div>

          {/* Creator Menu */}
          {isCreator && menuOpen && (
            <div
              ref={menuRef}
              className="absolute top-20 right-6 bg-white border border-gray-200 shadow-xl rounded-lg p-3 flex flex-col space-y-2 z-50 animate-fadeIn"
            >
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition"
              >
                ✏️ Edit Event
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md transition"
              >
                🗑️ Delete Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
