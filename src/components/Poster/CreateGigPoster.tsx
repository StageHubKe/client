import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  clearPosterState,
  createPoster,
} from "../../../redux/reducers/posterReducer/posterSlice";

const CLOUDINARY_UPLOAD_PRESET = "stagehub";
const CLOUDINARY_CLOUD_NAME = "ddzndlcxn";

const CreateGigPoster: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.poster);

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [formData, setFormData] = useState({
    eventType: "",
    artistCategory: "",
    instrumentsProvided: false,
    performerEquipment: "",
    guestCount: 50,
    venueAddress: "",
    eventName: "",
    eventDescription: "",
    performanceDuration: "2 hours",
    planningStage: "",
    budget: 500,
    eventPlannerName: "",
    contactInfo: "",
    eventDate: "",
    status: "active",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && inputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["(cities)"],
            componentRestrictions: { country: "KE" },
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.formatted_address) {
            setFormData((prev) => ({
              ...prev,
              venueAddress: place?.formatted_address ?? prev.venueAddress,
            }));
          }
        });

        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCoverImage(result.secure_url);
    } catch (err) {
      alert("Image upload failed. Try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ========= HANDLE FORM CHANGE ========= //
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

  // ========= SUBMIT ========= //
  const handleSubmit = async () => {
    const posterData = { ...formData, posterImage: coverImage };
    const resultAction = await dispatch(createPoster(posterData));
    if (createPoster.fulfilled.match(resultAction)) {
      navigate("/gig-posts");
      dispatch(clearPosterState());
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2 text-center">
              🎭 Event Details
            </h2>

            <div>
              <label className="block mb-1 font-medium">Event Type</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Choose type...</option>
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
              <label className="block mb-1 font-medium">Artist Category</label>
              <select
                name="artistCategory"
                value={formData.artistCategory}
                onChange={handleChange}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select category...</option>
                {["Musician", "Comedian", "DJ", "MC", "Band", "Dancer"].map(
                  (a) => (
                    <option key={a}>{a}</option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="instrumentsProvided"
                checked={formData.instrumentsProvided}
                onChange={handleChange}
              />
              <label className="text-sm text-gray-600">
                Instruments will be provided
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">🚚 Logistics</h2>

            <div>
              <label className="block mb-1 font-medium">Expected Guests</label>
              <input
                type="range"
                name="guestCount"
                min="10"
                max="1000"
                step="10"
                value={formData.guestCount}
                onChange={handleChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                {formData.guestCount} guests expected
              </p>
            </div>

            <div>
              <label className="block mb-1 font-medium">Venue Address</label>
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

            <div>
              <label className="block mb-1 font-medium">
                Performer Equipment
              </label>
              <select
                name="performerEquipment"
                value={formData.performerEquipment}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="">Select equipment...</option>
                <option value="Sound system">Sound System</option>
                <option value="Lighting">Lighting</option>
                <option value="Stage setup">Stage Setup</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              🗓️ Event Overview
            </h2>

            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              value={formData.eventName}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

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
              placeholderText="Select event date"
              className="border p-2 w-full rounded"
            />

            <select
              name="performanceDuration"
              value={formData.performanceDuration}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              {["1 hour", "2 hours", "3 hours", "Half Day", "Full Day"].map(
                (d) => (
                  <option key={d}>{d}</option>
                )
              )}
            </select>

            <select
              name="planningStage"
              value={formData.planningStage}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="">Select Planning Stage</option>
              <option value="just getting started">Just Getting Started</option>
              <option value="finalizing details">Finalizing Details</option>
              <option value="ready to hire">Ready to Hire</option>
              <option value="ongoing event">Ongoing Event</option>
            </select>

            <textarea
              name="eventDescription"
              placeholder="Describe the event..."
              value={formData.eventDescription}
              onChange={handleChange}
              rows={3}
              className="border p-2 w-full rounded"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">
              💰 Budget & Planner Info
            </h2>

            <div>
              <label className="block mb-1 font-medium">Budget (USD)</label>
              <input
                type="range"
                name="budget"
                min="100"
                max="5000"
                step="50"
                value={formData.budget}
                onChange={handleChange}
                className="w-full"
              />
              <p className="text-sm text-gray-500">${formData.budget}</p>
            </div>

            <input
              type="text"
              name="eventPlannerName"
              placeholder="Planner Name"
              value={formData.eventPlannerName}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />

            <input
              type="text"
              name="contactInfo"
              placeholder="Contact Info (Email or Phone)"
              value={formData.contactInfo}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="active">Active</option>
                <option value="filled">Filled</option>
              </select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold mb-2">🖼️ Upload Poster</h2>
            <input type="file" onChange={handleCoverUpload} />
            {uploading && <p>Uploading...</p>}
            {coverImage && (
              <img
                src={coverImage}
                alt="poster"
                className="w-64 mx-auto rounded-lg shadow-md"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10">
      <h1 className="text-2xl font-bold text-center mb-5 text-blue-600">
        Create Gig Poster
      </h1>

      {/* Progress indicator */}
      <div className="flex justify-between mb-6">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
              s <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {renderStep()}

      <div className="flex justify-between mt-6">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Back
          </button>
        )}
        {step < 5 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Next
          </button>
        )}
        {step === 5 && (
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-center mt-3">{error}</p>}
    </div>
  );
};

export default CreateGigPoster;
