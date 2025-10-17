import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  fetchPosterById,
  updatePoster,
  clearPosterState,
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

const EditGigPoster: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { poster, loading, error, success } = useSelector(
    (state: RootState) => state.poster
  );

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

  // Initialize Google Places Autocomplete
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
    return () => {
      clearInterval(interval);
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  // Fetch poster data
  useEffect(() => {
    if (id) dispatch(fetchPosterById(id));
  }, [id, dispatch]);

  // Populate form with poster data
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
        performanceDuration: poster.performanceDuration || "2 hours",
        planningStage: poster.planningStage || "",
        budget: poster.budget || 500,
        eventPlannerName: poster.eventPlannerName || "",
        contactInfo: poster.contactInfo || "",
        eventStartDate: poster.eventStartDate || "",
        eventEndDate: poster.eventEndDate || "",
        multiDay: poster.multiDay || false,
        status: (poster.status as "active" | "filled") || "active",
      });
      setCoverImage(poster.posterImage || "");
    }
  }, [poster]);

  // Handle navigation on successful update
  useEffect(() => {
    if (success) {
      navigate("/gig-posts");
      dispatch(clearPosterState());
    }
  }, [success, navigate, dispatch]);

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

  // Submit updated poster
  const handleSubmit = async () => {
    if (!id) return;

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

    const updatedData = { ...formData, posterImage: coverImage };
    await dispatch(updatePoster({ id, data: updatedData }));
  };

  // Reusable DatePicker field component
  const DatePickerField: React.FC<{
    label: string;
    selectedDate: string;
    onChange: (date: string) => void;
  }> = ({ label, selectedDate, onChange }) => (
    <div>
      <label className="block text-sm text-gray-700 font-medium">{label}</label>
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

        {/* Logistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Performer Equipment
            </label>
            <select
              name="performerEquipment"
              value={formData.performerEquipment}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            >
              <option value="">Select equipment...</option>
              <option value="Sound system">Sound System</option>
              <option value="Lighting">Lighting</option>
              <option value="Stage setup">Stage Setup</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Number of Guests
            </label>
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
        </div>

        {/* Venue */}
        <div>
          <label className="block font-medium mb-1 text-gray-700">
            Venue Address
          </label>
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

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Event Name
            </label>
            <input
              type="text"
              name="eventName"
              placeholder="Event Name"
              value={formData.eventName}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Event Description
            </label>
            <textarea
              name="eventDescription"
              placeholder="Event Description"
              value={formData.eventDescription}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg min-h-[100px]"
            />
          </div>
        </div>

        {/* Event Schedule */}
        <div className="space-y-4">
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
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
            <label className="block font-medium mb-1 text-gray-700">
              Performance Duration
            </label>
            <select
              name="performanceDuration"
              value={formData.performanceDuration}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
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
            <label className="block font-medium mb-1 text-gray-700">
              Planning Stage
            </label>
            <select
              name="planningStage"
              value={formData.planningStage}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            >
              <option value="">Select Planning Stage</option>
              <option value="just getting started">Just Getting Started</option>
              <option value="finalizing details">Finalizing Details</option>
              <option value="ready to hire">Ready to Hire</option>
              <option value="ongoing event">Ongoing Event</option>
            </select>
          </div>
        </div>

        {/* Budget & Planner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Budget (USD)
            </label>
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
            <label className="block font-medium mb-1 text-gray-700">
              Event Planner Name
            </label>
            <input
              type="text"
              name="eventPlannerName"
              placeholder="Planner Name"
              value={formData.eventPlannerName}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
        </div>

        {/* Contact & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Contact Info
            </label>
            <input
              type="text"
              name="contactInfo"
              placeholder="Contact Info (Email or Phone)"
              value={formData.contactInfo}
              onChange={handleChange}
              className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Status
            </label>
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
        </div>

        {/* Image Upload */}
        <div className="pt-4">
          <label className="block font-medium mb-1 text-gray-700">
            Upload Poster Image
          </label>
          <input
            type="file"
            accept="image/*"
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
          disabled={loading || uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition-all duration-200 mt-4 disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default EditGigPoster;
