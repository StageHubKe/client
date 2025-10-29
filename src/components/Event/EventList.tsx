import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { AppDispatch, RootState } from "../../../redux/store";
import { getAllEvents } from "../../../redux/reducers/EventReducer/eventSlice";

const PAGE_SIZE = 6;

const EventList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.event
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType ? event.eventType === filterType : true;
    const matchesLocation = filterLocation
      ? event.location.toLowerCase().includes(filterLocation.toLowerCase())
      : true;

    return matchesSearch && matchesType && matchesLocation;
  });

  const displayedEvents = filteredEvents.slice(0, visibleCount);

  const handleLoadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-xl text-gray-300 animate-pulse">Loading events...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900 text-white px-5 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 border-b border-gray-700 pb-4 gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium text-gray-200 shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Explore Upcoming Events
        </h2>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full md:w-1/4 p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
        >
          <option value="">Event Type</option>
          <option value="concert">Concert</option>
          <option value="festival">Festival</option>
          <option value="conference">Conference</option>
          <option value="exhibition">Exhibition</option>
          <option value="party">Party</option>
        </select>
        <input
          type="text"
          placeholder="Filter by location..."
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="w-full md:w-1/4 p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
        />
      </div>

      {/* Events Grid */}
      {displayedEvents.length === 0 ? (
        <p className="text-center text-gray-400 text-lg mt-20">
          No events found.
        </p>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayedEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className="cursor-pointer bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition duration-300"
              >
                {event.image && (
                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover transition duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  </div>
                )}

                <div className="p-5 bg-white h-full  rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-indigo-700 mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="flex flex-col text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-1">
                      📍 <span>{event.location}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      📅{" "}
                      <span>
                        {new Date(event.date).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {visibleCount < filteredEvents.length && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-400/50 transition-transform duration-300 hover:scale-105"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventList;
