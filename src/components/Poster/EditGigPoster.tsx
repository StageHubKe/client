import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  fetchPosterById,
  updatePoster,
  clearPosterState,
} from "../../../redux/reducers/posterReducer/posterSlice";

const CLOUDINARY_UPLOAD_PRESET = "stagehub";
const CLOUDINARY_CLOUD_NAME = "ddzndlcxn";

const EditGigPoster: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { poster, loading, success } = useSelector(
    (state: RootState) => state.poster
  );

  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");

  const [formData, setFormData] = useState({
    eventType: "",
    artistCategory: "",
    instrumentsProvided: false,
    performerEquipment: "",
    guestCount: 50,
    venueAddress: "",
    eventName: "",
    eventDescription: "",
    performanceDuration: "",
    planningStage: "",
    budget: 500,
    eventPlannerName: "",
    contactInfo: "",
    eventDate: "",
    status: "active",
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (window.google && inputRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["(cities)"],
          componentRestrictions: { country: "KE" },
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.formatted_address) {
          setFormData((prev) => ({
            ...prev,
            venueAddress: place.formatted_address || prev.venueAddress,
          }));
        }
      });
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (id) dispatch(fetchPosterById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (poster) {
      setFormData({
        eventType: poster.eventType || "",
        artistCategory: poster.artistCategory || "",
        instrumentsProvided: poster.instrumentsProvided || false,
        performerEquipment: poster.performerEquipment || "",
        guestCount: poster.guestCount || 50,
        venueAddress: poster.venueAddress || "",
        eventName: poster.eventName || "",
        eventDescription: poster.eventDescription || "",
        performanceDuration: poster.performanceDuration || "",
        planningStage: poster.planningStage || "",
        budget: poster.budget || 500,
        eventPlannerName: poster.eventPlannerName || "",
        contactInfo: poster.contactInfo || "",
        eventDate: poster.eventDate || "",
        status: poster.status || "active",
      });
      setCoverImage(poster.posterImage || "");
    }
  }, [poster]);

  useEffect(() => {
    if (success) {
      navigate("/gig-posts");
      dispatch(clearPosterState());
    }
  }, [success, navigate, dispatch]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();
      setCoverImage(result.secure_url);
    } catch (err) {
      alert("Image upload failed.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!id) return;
    const updatedData = { ...formData, posterImage: coverImage };
    await dispatch(updatePoster({ id, data: updatedData }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12 border border-gray-100">
      <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
        ✏️ Edit Gig Poster
      </h1>

      <div className="space-y-6">
        {/* Event Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Event Type
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            >
              <option value="">Select event type</option>
              {[
                "Secular",
                "Religious",
                "Corporate",
                "Wedding",
                "Private",
                "Other",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Artist Category
            </label>
            <select
              name="artistCategory"
              value={formData.artistCategory}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            >
              <option value="">Select category</option>
              {["Musician", "Comedian", "DJ", "MC", "Band", "Dancer"].map(
                (a) => (
                  <option key={a}>{a}</option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Instruments */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="instrumentsProvided"
            checked={formData.instrumentsProvided}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-700">Instruments Provided</span>
        </div>

        {/* Event details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Performance Equipment</label>
            <input
              type="text"
              name="performerEquipment"
              placeholder="Performer Equipment"
              value={formData.performerEquipment}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold">Event Name</label>
            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              value={formData.eventName}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold">Event Description</label>
          <textarea
            name="eventDescription"
            placeholder="Event Description"
            value={formData.eventDescription}
            onChange={handleChange}
            className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg min-h-[100px]"
          />
        </div>

        {/* Date & Guests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Event Date</label>
            <DatePicker
              selected={
                formData.eventDate ? new Date(formData.eventDate) : null
              }
              onChange={(date: Date | null) =>
                setFormData((prev) => ({
                  ...prev,
                  eventDate: date ? date.toISOString().split("T")[0] : "",
                }))
              }
              dateFormat="yyyy-MM-dd"
              className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 w-full rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold">Number of Guests</label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
        </div>

        {/* Venue with Autocomplete */}
        <div>
          <label className="font-semibold">Venue Address</label>
          <input
            ref={inputRef}
            type="text"
            name="venueAddress"
            value={formData.venueAddress}
            onChange={handleChange}
            placeholder="Search city..."
            className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
          />
        </div>

        {/* Budget and Planner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Hiring Budget</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold">Event Planner Name</label>
            <input
              type="text"
              name="eventPlannerName"
              value={formData.eventPlannerName}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <label className="font-semibold">Event Contact</label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
          />
        </div>

        {/* Status */}
        <div>
          <label className="font-semibold">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
          >
            <option value="active">Active</option>
            <option value="filled">Filled</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="pt-4">
          <label className="font-semibold">Upload Poster Image</label>
          <input
            type="file"
            onChange={handleCoverUpload}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1"
          />
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Uploading...</p>
          )}
          {coverImage && (
            <img
              src={coverImage}
              alt="Poster Preview"
              className="rounded-xl w-full h-60 object-cover mt-3 shadow-md border border-gray-200"
            />
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition-all duration-200 mt-4"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditGigPoster;
