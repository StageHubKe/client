import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  getEventById,
  updateEvent,
} from "../../../redux/reducers/EventReducer/eventSlice";

const UpdateEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { singleEvent, loading } = useSelector(
    (state: RootState) => state.event
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "other" as "concert" | "festival" | "exhibition" | "party" | "other",
    location: "",
    date: "",
    image: "",
  });

  useEffect(() => {
    if (id) dispatch(getEventById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (singleEvent) {
      setFormData({
        title: singleEvent.title || "",
        description: singleEvent.description || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventType: (singleEvent.eventType as any) || "other",
        location: singleEvent.location || "",
        date: singleEvent.date
          ? new Date(singleEvent.date).toISOString().slice(0, 16)
          : "",
        image: singleEvent.image || "",
      });
    }
  }, [singleEvent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return toast.error("Invalid event ID");

    try {
      await dispatch(updateEvent({ id, updatedData: formData })).unwrap();
      toast.success("✅ Event updated successfully!");
      navigate(`/events/${id}`);
    } catch {
      toast.error("❌ Failed to update event");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-10">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        ✏️ Update Event
      </h2>

      {loading && (
        <p className="text-center text-gray-500 mb-4">Loading event details...</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Event Type</label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="concert">Concert</option>
            <option value="festival">Festival</option>
            <option value="exhibition">Exhibition</option>
            <option value="party">Party</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Date & Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter or paste image link"
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Event Preview"
              className="mt-3 rounded-lg w-full h-64 object-cover"
            />
          )}
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => navigate(`/events/${id}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            ⬅️ Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            💾 Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateEvent;
