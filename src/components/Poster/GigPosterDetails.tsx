import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  deletePoster,
  fetchPosterById,
} from "../../../redux/reducers/posterReducer/posterSlice";

const GigPosterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { poster, loading, error } = useSelector(
    (state: RootState) => state.poster
  );

  const [showModal, setShowModal] = useState(false); // Modal state

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
    } else {
      console.error("Poster is null");
    }
  };

  const handleEdit = () => {
    if (poster && poster._id) {
      navigate(`/edit-gig/${poster._id}`);
    } else {
      console.error("Poster is null");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-600">
        Loading details...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load gig details: {error}
      </div>
    );

  if (!poster) return null;

  const formattedDate = poster.eventDate
    ? new Date(poster.eventDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not specified";

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white shadow-xl rounded-2xl border border-gray-100">
      {/* Action Buttons */}
      <div className="flex justify-between mb-6">
        <button
          onClick={handleEdit}
          className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition"
        >
          ✏️ Edit Poster
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
        >
          🗑️ Delete Poster
        </button>
      </div>

      {/* Poster Image */}
      {poster.posterImage && (
        <div className="relative mb-6 cursor-pointer group">
          <img
            src={poster.posterImage}
            alt={poster.eventName}
            onClick={() => setShowModal(true)} // Open modal on click
            className="w-full h-80 object-cover rounded-xl shadow-md transition-transform group-hover:scale-[1.02]"
          />
          {poster.eventDate && (
            <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm px-4 py-2 rounded-full shadow-md">
              📅 {formattedDate}
            </div>
          )}
          <p className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-lg">
            Click to view full image
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl w-full p-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-white text-2xl hover:text-gray-300 transition"
            >
              ✕
            </button>
            <img
              src={poster.posterImage}
              alt="Full poster"
              className="w-full h-auto rounded-xl shadow-lg border border-gray-200"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3 text-gray-900">
          {poster.eventName}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            🎭 {poster.eventType}
          </span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            👤 {poster.artistCategory}
          </span>
          <span className="bg-gray-100 px-3 py-1 rounded-full capitalize">
            📋 {poster.planningStage || "Not specified"}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          Event Description
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {poster.eventDescription || "No description provided."}
        </p>
      </div>

      {/* Event Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Event Details
          </h2>
          <ul className="space-y-2 text-gray-700">
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

        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Planner Information
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>Planner Name:</strong> {poster.eventPlannerName}
            </li>
            <li>
              <strong>Contact Info:</strong> {poster.contactInfo}
            </li>
            <li>
              <strong>Budget:</strong>{" "}
              <span className="text-green-600 font-medium">
                ${poster.budget}
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

      {/* Footer */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/gig-posts")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-transform hover:scale-105"
        >
          ← Back to Posters
        </button>
      </div>
    </div>
  );
};

export default GigPosterDetails;
