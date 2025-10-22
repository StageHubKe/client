import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import { getAllEvents } from "../../../redux/reducers/EventReducer/eventSlice";

const EventList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { events, loading, error } = useSelector((state: RootState) => state.event);

  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);

  if (loading)
    return <p className="text-center mt-10 text-lg text-gray-600">Loading events...</p>;

  if (error)
    return <p className="text-center text-red-500 mt-10 font-semibold">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600">Upcoming Events 🎉</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition"
        >
          ⬅️ Back to Home
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">No events found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event._id}
              onClick={() => navigate(`/events/${event._id}`)}
              className="cursor-pointer bg-white border rounded-2xl overflow-hidden shadow hover:shadow-2xl hover:-translate-y-1 transition transform duration-300"
            >
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{event.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-3">{event.description}</p>
                <p className="text-blue-600 text-sm mt-3">📍 {event.location}</p>
                <p className="text-gray-500 text-xs mt-1">
                  📅 {new Date(event.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
