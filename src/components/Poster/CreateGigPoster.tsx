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

interface FormData {
  eventType: string;
  artistCategory: string;
  instrumentsProvided: boolean;
  performerEquipment: string;
  guestCount: number;
  venueAddress: string;
  eventName: string;
  eventDescription: string;
  performanceDuration: string;
  planningStage: string;
  budget: number;
  eventPlannerName: string;
  contactInfo: string;
  eventStartDate: string;
  eventEndDate: string;
  multiDay: boolean;
  status: "active" | "filled";
}

const CreateGigPoster: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.poster);

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [formData, setFormData] = useState<FormData>({
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
    eventStartDate: "",
    eventEndDate: "",
    multiDay: false,
    status: "active",
  });

  // Google Places Autocomplete
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
              venueAddress: place?.formatted_address ?? "",
            }));
          }
        });
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle form input changes
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

  // Upload poster image to Cloudinary
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

  // Submit poster
  const handleSubmit = async () => {
    const requiredFields: (keyof FormData)[] = [
      "eventType",
      "artistCategory",
      "guestCount",
      "venueAddress",
      "eventName",
      "eventDescription",
      "performanceDuration",
      "planningStage",
      "budget",
      "eventPlannerName",
      "contactInfo",
      "eventStartDate",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in the ${field} field.`);
        return;
      }
    }

    if (formData.multiDay && !formData.eventEndDate) {
      alert("Please provide the event end date for multi-day events.");
      return;
    }

    const posterData = { ...formData, posterImage: coverImage };
    const resultAction = await dispatch(createPoster(posterData));
    if (createPoster.fulfilled.match(resultAction)) {
      navigate("/gig-posts");
      dispatch(clearPosterState());
    }
  };

  // Reusable DatePicker field component
  const DatePickerField: React.FC<{
    label: string;
    selectedDate: string;
    onChange: (date: string) => void;
  }> = ({ label, selectedDate, onChange }) => (
    <div>
      <label className="block text-sm text-gray-700">{label}</label>
      <DatePicker
        selected={selectedDate ? new Date(selectedDate) : null}
        onChange={(date: Date | null) =>
          onChange(date ? date.toISOString().split("T")[0] : "")
        }
        dateFormat="yyyy-MM-dd"
        placeholderText={label}
        className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );

  // Render each step of the form
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2 text-center">
              🎭 Event Details
            </h2>
            <div>
              <label className="block mb-1 font-medium">Event Name</label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="Enter event name"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Event Description
              </label>
              <textarea
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleChange}
                placeholder="Enter a brief description of the event"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
                rows={4}
              />
            </div>
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
                className="focus:ring-2 focus:ring-blue-400"
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
                min={10}
                max={1000}
                step={10}
                value={formData.guestCount}
                onChange={handleChange}
                className="w-full focus:ring-2 focus:ring-blue-400"
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
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
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
              🗓️ Event Schedule
            </h2>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="multiDay"
                checked={formData.multiDay}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    multiDay: e.target.checked,
                    eventStartDate: "",
                    eventEndDate: "",
                  }))
                }
                className="focus:ring-2 focus:ring-blue-400"
              />
              <label htmlFor="multiDay" className="text-sm text-gray-600">
                Event spans multiple days
              </label>
            </div>
            {formData.multiDay ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePickerField
                  label="Start Date"
                  selectedDate={formData.eventStartDate}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, eventStartDate: date }))
                  }
                />
                <DatePickerField
                  label="End Date"
                  selectedDate={formData.eventEndDate}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, eventEndDate: date }))
                  }
                />
              </div>
            ) : (
              <DatePickerField
                label="Event Date"
                selectedDate={formData.eventStartDate}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, eventStartDate: date }))
                }
              />
            )}
            <div>
              <label className="block mb-1 font-medium">
                Performance Duration
              </label>
              <select
                name="performanceDuration"
                value={formData.performanceDuration}
                onChange={handleChange}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select duration...</option>
                {["1 hour", "2 hours", "3 hours", "Half Day", "Full Day"].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Planning Stage</label>
              <select
                name="planningStage"
                value={formData.planningStage}
                onChange={handleChange}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Planning Stage</option>
                <option value="just getting started">
                  Just Getting Started
                </option>
                <option value="finalizing details">Finalizing Details</option>
                <option value="ready to hire">Ready to Hire</option>
                <option value="ongoing event">Ongoing Event</option>
              </select>
            </div>
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
                min={100}
                max={5000}
                step={50}
                value={formData.budget}
                onChange={handleChange}
                className="w-full focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-sm text-gray-500">${formData.budget}</p>
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Event Planner Name
              </label>
              <input
                type="text"
                name="eventPlannerName"
                placeholder="Planner Name"
                value={formData.eventPlannerName}
                onChange={handleChange}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Contact Info</label>
              <input
                type="text"
                name="contactInfo"
                placeholder="Contact Info (Email or Phone)"
                value={formData.contactInfo}
                onChange={handleChange}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-400"
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
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="mx-auto"
            />
            {uploading && <p className="text-gray-500">Uploading...</p>}
            {coverImage && (
              <img
                src={coverImage}
                alt="Poster Preview"
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
            disabled={loading || uploading}
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
