import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import { fetchAllPosters } from "../../../redux/reducers/posterReducer/posterSlice";

const GigPosterList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posters, loading, error } = useSelector(
    (state: RootState) => state.poster
  );

  useEffect(() => {
    dispatch(fetchAllPosters());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-lg font-medium text-gray-600">Loading posters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!posters.length) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg mb-4">
          No gig posters available yet.
        </p>
        <button
          onClick={() => navigate("/create-gig")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create One
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="flex">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-transform hover:scale-105"
        >
          ← Back Home
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-6 text-white text-center">
        🎤 Available Gigs
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posters.map((poster) => (
          <div
            key={poster._id}
            onClick={() => navigate(`/gig-post/${poster._id}`)}
            className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
          >
            {poster.posterImage ? (
              <img
                src={poster.posterImage}
                alt={poster.eventName}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}

            <div className="p-4 space-y-2">
              <h2 className="text-xl font-semibold">{poster.eventName}</h2>

              {poster.eventStartDate && (
                <p className="text-sm text-blue-600 font-medium">
                  📅{" "}
                  {poster.multiDay
                    ? `${new Date(
                        poster.eventStartDate
                      ).toLocaleDateString()} - ${new Date(
                        poster.eventEndDate
                      ).toLocaleDateString()}`
                    : new Date(poster.eventStartDate).toLocaleDateString()}
                </p>
              )}

              <p className="text-gray-600">{poster.eventType}</p>
              <p className="text-sm text-gray-500 truncate">
                {poster.eventDescription}
              </p>

              {/* Status badge */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${
                  poster.status === "active" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {poster.status.toUpperCase()}
              </span>

              <div className="flex justify-between items-center mt-3">
                <p className="text-green-600 font-medium">KSH.{poster.budget}</p>
                <span className="text-sm text-gray-400">
                  {poster.eventPlannerName || "Unknown Planner"}
                </span>
              </div>
              <div>

                  <p className="mt-3 text-sm text-yellow-600 italic">
                      📍 {poster.venueAddress || "Location not specified"}
                    </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GigPosterList;
