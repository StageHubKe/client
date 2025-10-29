import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import { fetchAllPosters } from "../../../redux/reducers/posterReducer/posterSlice";
import { ArrowLeft, Search } from "lucide-react";

const GigPosterList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { posters, loading, error } = useSelector(
    (state: RootState) => state.poster
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // newest gigs filter
  const [currentPage, setCurrentPage] = useState(1);
  const postersPerPage = 6;

  useEffect(() => {
    dispatch(fetchAllPosters());
  }, [dispatch]);

  // Filter by search term and time
  const filteredPosters = posters.filter((poster) => {
    const matchesSearch =
      poster.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poster.eventDescription?.toLowerCase().includes(searchTerm.toLowerCase());

    // Time filter
    let matchesTime = true;
    if (timeFilter !== "all" && poster.createdAt) {
      const now = new Date();
      const posterDate = new Date(poster.createdAt);
      const diffHours =
        (now.getTime() - posterDate.getTime()) / (1000 * 60 * 60);

      if (timeFilter === "24h") matchesTime = diffHours <= 24;
      else if (timeFilter === "week") matchesTime = diffHours <= 24 * 7;
      else if (timeFilter === "month") matchesTime = diffHours <= 24 * 30;
    }

    return matchesSearch && matchesTime;
  });

  // Pagination
  const indexOfLastPoster = currentPage * postersPerPage;
  const indexOfFirstPoster = indexOfLastPoster - postersPerPage;
  const currentPosters = filteredPosters.slice(
    indexOfFirstPoster,
    indexOfLastPoster
  );
  const totalPages = Math.ceil(filteredPosters.length / postersPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFilter(e.target.value);
    setCurrentPage(1);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-300">
        Loading gig posters...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900 p-8 text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 border-b border-gray-700 pb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 mb-4 sm:mb-0 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium text-gray-200 shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
        <h2 className="text-3xl sm:text-4xl py-2 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Available Gigs
        </h2>
      </div>

      {/* Search and Time Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 w-full sm:w-1/2">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search gigs by name or description..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-transparent outline-none w-full text-gray-200 placeholder-gray-400"
          />
        </div>

        <select
          value={timeFilter}
          onChange={handleTimeFilterChange}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Time</option>
          <option value="24h">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      {/* Posters Grid */}
      {currentPosters.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No gigs match your search or time filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPosters.map((poster) => (
            <div
              key={poster._id}
              onClick={() => navigate(`/gig-post/${poster._id}`)}
              className="relative bg-white text-gray-900 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer"
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

              {/* NEW badge */}
              {poster.createdAt &&
                (new Date().getTime() - new Date(poster.createdAt).getTime()) /
                  (1000 * 60 * 60) <=
                  24 && (
                  <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    NEW
                  </span>
                )}

              <div className="p-5">
                <h2 className="text-xl font-bold text-indigo-600 truncate">
                  {poster.eventName}
                </h2>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {poster.eventDescription || "No description provided"}
                </p>

                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-500">
                    {poster.eventType}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                      poster.status === "active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {poster.status.toUpperCase()}
                  </span>
                </div>

                {poster.eventStartDate && (
                  <p className="text-sm text-blue-600 font-medium mb-2">
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

                <p className="text-yellow-600 text-sm mb-2">
                  📍 {poster.venueAddress || "Location not specified"}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-green-600 font-semibold">
                    KSH.{poster.budget}
                  </p>
                  <span className="text-sm text-gray-500">
                    Created by:{" "}
                    <span className="text-indigo-600 font-medium">
                      {poster.eventPlannerName || "Unknown"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Prev
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GigPosterList;
