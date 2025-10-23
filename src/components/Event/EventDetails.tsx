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
      <p className="text-center mt-10 text-lg text-gray-600">Loading event...</p>
    );

  if (error)
    return (
      <p className="text-center text-red-500 mt-10 font-semibold">{error}</p>
    );

  if (!singleEvent)
    return <p className="text-center text-gray-600 mt-10">Event not found.</p>;

  const isCreator = user?._id === singleEvent.createdBy?._id;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden mt-10 relative">
      {/* Top Navigation Controls */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <button
          onClick={() => navigate("/events")}
          className="flex items-center text-gray-700 hover:text-blue-700 transition"
        >
          <ArrowLeft className="mr-2" size={20} /> Back to Events
        </button>

        {/* Hamburger for all screen sizes */}
        {isCreator && (
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-700 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 focus:outline-none"
            aria-label="Toggle action menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {/* Event Image */}
      {singleEvent.image && (
        <img
          src={singleEvent.image}
          alt={singleEvent.title}
          className="w-full h-80 object-cover"
        />
      )}

      {/* Event Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-700">{singleEvent.title}</h1>
        <p className="text-gray-600 mt-4 leading-relaxed">
          {singleEvent.description}
        </p>

        <div className="mt-6 space-y-2 text-sm text-gray-800">
          <p>
            📍 <span className="font-medium">Location:</span>{" "}
            {singleEvent.location}
          </p>
          <p>
            📅 <span className="font-medium">Date:</span>{" "}
            {new Date(singleEvent.date).toLocaleString()}
          </p>
          <p>
            🎭 <span className="font-medium">Type:</span>{" "}
            {singleEvent.eventType?.toUpperCase()}
          </p>
        </div>

        {/* Hamburger Menu Dropdown */}
        {isCreator && menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 right-4 bg-white shadow-xl rounded-lg p-4 flex flex-col space-y-3 z-50 animate-fadeIn"
            role="menu"
            aria-label="Event actions"
          >
            <button
              onClick={() => {
                handleUpdate();
                setMenuOpen(false);
              }}
              className="text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              role="menuitem"
            >
              ✏️ 
            </button>
            <button
              onClick={() => {
                handleDelete();
                setMenuOpen(false);
              }}
              className="text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              role="menuitem"
            >
              🗑️ 
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
