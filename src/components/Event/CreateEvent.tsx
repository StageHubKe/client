import React, { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  createEvent,
  clearEventState,
} from "../../../redux/reducers/EventReducer/eventSlice";
import { useNavigate } from "react-router-dom";

const CLOUDINARY_UPLOAD_PRESET = "stagehub";
const CLOUDINARY_CLOUD_NAME = "ddzndlcxn";

const CreateEvent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector(
    (state: RootState) => state.event
  );

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
 const navigate = useNavigate();
const [formData, setFormData] = useState<{
  title: string;
  description: string;
  eventType: "concert" | "festival" | "exhibition" | "party" | "other";
  location: string;
  date: string;
}>({
  title: "",
  description: "",
  eventType: "other",
  location: "",
  date: "",
});

  // Google Places Autocomplete
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && inputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["geocode"],
            componentRestrictions: { country: "KE" },
          }
        );
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setFormData((prev) => ({
              ...prev,
              location: place.formatted_address ?? "",
            }));
          }
        });
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle text inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Cloudinary upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    data.append("resource_type", "image");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();
      setImageUrl(result.secure_url);
      toast.success("✅ Image uploaded successfully!");
    } catch (err) {
      toast.error("❌ Image upload failed. Try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      toast.warning("⚠️ Please fill all required fields!");
      return;
    }

    const newEvent = { ...formData, image: imageUrl };
    try {
      await dispatch(createEvent(newEvent)).unwrap();
      toast.success("🎉 Event created successfully!");
      setFormData({
        title: "",
        description: "",
        eventType: "other",
        location: "",
        date: "",
      });
      setImageUrl("");
      dispatch(clearEventState());
      navigate("/events");
    } catch {
      toast.error(error || "Failed to create event");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-2xl p-6 mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
        Create New Event
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event title */}
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Event Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          rows={3}
          required
        />

        {/* Event type */}
        <select
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
        >
          <option value="concert">Concert</option>
          <option value="festival">Festival</option>
          <option value="exhibition">Exhibition</option>
          <option value="party">Party</option>
          <option value="other">Other</option>
        </select>

        {/* Google location */}
        <input
          ref={inputRef}
          type="text"
          name="location"
          placeholder="Search or enter event location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          required
        />

        {/* Date */}
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border p-2 rounded-lg"
          required
        />

        {/* Image upload */}
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-600"
          />
          {uploading && <p className="text-gray-500 mt-2">Uploading...</p>}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Event preview"
              className="w-40 mt-3 rounded-lg shadow"
            />
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}
      {success && (
        <p className="text-green-600 text-sm mt-3 text-center">
          Event created!
        </p>
      )}
    </div>
  );
};

export default CreateEvent;
