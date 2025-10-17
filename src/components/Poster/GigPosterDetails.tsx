import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  deletePoster,
  fetchPosterById,
} from "../../../redux/reducers/posterReducer/posterSlice";
import { Menu } from "lucide-react";

const GigPosterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { poster, loading, error } = useSelector(
    (state: RootState) => state.poster
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchPosterById(id));
  }, [id, dispatch]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this gig poster?"
    );
    if (!confirmDelete) return;

    if (poster) {
      await dispatch(deletePoster(poster._id!));
      navigate("/gig-posts");
    }
  };

  const handleEdit = () => {
    if (poster && poster._id) navigate(`/edit-gig/${poster._id}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-300">
        Loading details...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 mt-10">
        Failed to load gig details: {error}
      </div>
    );

  if (!poster) return null;

  // Format the date(s)
  const formattedDate = poster.multiDay
    ? `${new Date(poster.eventStartDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })} - ${new Date(poster.eventEndDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    : poster.eventStartDate
    ? new Date(poster.eventStartDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not specified";

  const isCreator =
    user && poster.createdBy && user._id === poster.createdBy._id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900 p-8 text-gray-200 relative">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/gig-posts")}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          ← Back to Posters
        </button>

        {/* Hamburger Menu - Only visible for creator */}
        {isCreator && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
            >
              <Menu className="text-yellow-400 w-6 h-6" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                >
                  ✏️ Edit Poster
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  🗑️ Delete Poster
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Poster Image */}
      {poster.posterImage && (
        <div className="relative mb-8 cursor-pointer group">
          <img
            src={poster.posterImage}
            alt={poster.eventName}
            onClick={() => setShowModal(true)}
            className="w-full h-80 object-cover rounded-xl shadow-lg transition-transform group-hover:scale-[1.02]"
          />
          <div className="absolute top-4 left-4 bg-indigo-600/80 text-white text-sm px-4 py-2 rounded-full shadow-md">
            📅 {formattedDate}
          </div>
          <p className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-lg">
            Click to view full image
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl w-full p-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-white text-3xl hover:text-gray-400 transition"
            >
              ✕
            </button>
            <img
              src={poster.posterImage}
              alt="Full poster"
              className="w-full h-auto rounded-xl shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3 text-yellow-400 drop-shadow">
          {poster.eventName}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-300">
          <span className="bg-gray-800/70 px-3 py-1 rounded-full border border-gray-700">
            🎭 {poster.eventType}
          </span>
          <span className="bg-gray-800/70 px-3 py-1 rounded-full border border-gray-700">
            👤 {poster.artistCategory}
          </span>
          <span className="bg-gray-800/70 px-3 py-1 rounded-full border border-gray-700 capitalize">
            📋 {poster.planningStage || "Not specified"}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-yellow-300">
          Event Description
        </h2>
        <p className="text-gray-200 leading-relaxed bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-sm">
          {poster.eventDescription || "No description provided."}
        </p>
      </div>

      {/* Event Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-yellow-300">
            Event Details
          </h2>
          <ul className="space-y-2 text-gray-200">
            <li>
              <strong>Performance Duration:</strong>{" "}
              {poster.performanceDuration}
            </li>
            <li>
              <strong>Guest Count:</strong> {poster.guestCount}
            </li>
            <li>
              <strong>Venue Address:</strong> {poster.venueAddress}
            </li>
            <li>
              <strong>Instruments Provided:</strong>{" "}
              {poster.instrumentsProvided ? "Yes" : "No"}
            </li>
            <li>
              <strong>Performer Equipment:</strong>{" "}
              {poster.performerEquipment || "Not specified"}
            </li>
          </ul>
        </div>

        <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-yellow-300">
            Planner Information
          </h2>
          <ul className="space-y-2 text-gray-200">
            <li>
              <strong>Planner Name:</strong> {poster.eventPlannerName}
            </li>
            <li>
              <strong>Contact Info:</strong> {poster.contactInfo}
            </li>
            <li>
              <strong>Budget:</strong>{" "}
              <span className="text-green-400 font-medium">
                KSH.{poster.budget}
              </span>
            </li>
            {poster.createdBy && (
              <li>
                <strong>Created By:</strong> {poster.createdBy.name} (
                {poster.createdBy.email})
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GigPosterDetails;
