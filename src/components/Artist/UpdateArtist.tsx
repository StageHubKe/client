import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  getArtistProfileById,
  updateArtistProfile,
  type ArtistProfile,
} from "../../../redux/reducers/artistReducer/artistSlice";
import { fetchCurrentUser } from "../../../redux/reducers/authReducer/authSlice";

const CLOUDINARY_UPLOAD_PRESET = "stagehub";
const CLOUDINARY_CLOUD_NAME = "ddzndlcxn";

type Video = {
  url: string;
  title: string;
  description: string;
};

const UpdateArtist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { profile, loading } = useSelector((state: RootState) => state.artist);
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    stageName: "",
    genre: "",
    type: "",
    bio: "",
    experienceYears: "",
    location: "",
    availability: "available",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    minRate: "",
    maxRate: "",
    currency: "USD",
  });

  const [videos, setVideos] = useState<Video[]>([]);
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const [coverUploading, setCoverUploading] = useState(false);

  const locationInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      // Fetch user if not loaded
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, authLoading]);

  useEffect(() => {
    if (id) dispatch(getArtistProfileById(id));
  }, [id, user, dispatch, navigate]);

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        stageName: profile.stageName || "",
        genre: profile.genre || "",
        type: profile.type || "",
        bio: profile.bio || "",
        experienceYears: profile.experienceYears?.toString() || "",
        location: profile.location || "",
        availability: profile.availability || "available",
        instagram: profile.socialLinks?.instagram || "",
        twitter: profile.socialLinks?.twitter || "",
        youtube: profile.socialLinks?.youtube || "",
        tiktok: profile.socialLinks?.tiktok || "",
        minRate: profile.pricing?.minRate?.toString() || "",
        maxRate: profile.pricing?.maxRate?.toString() || "",
        currency: profile.pricing?.currency || "USD",
      });
      setVideos(
        profile.videos?.map((video) => ({
          ...video,
          title: video.title || "",
          description: video.description || "",
        })) || []
      );
      setCoverImage(profile.coverImage || "");
    }
  }, [profile]);

  useEffect(() => {
    if (window.google && locationInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        { types: ["(cities)"], componentRestrictions: { country: "KE" } }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place && place.formatted_address) {
          const address = place.formatted_address;
          setFormData((prev) => ({ ...prev, location: address }));
          if (locationInputRef.current) {
            locationInputRef.current.value = address;
          }
        }
      });
      return () => {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      };
    }
  }, []);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAvailability = () => {
    setFormData((prev) => ({
      ...prev,
      availability:
        prev.availability === "available" ? "unavailable" : "available",
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videos.length >= 5) {
      alert("You can only upload up to 5 videos.");
      return;
    }
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";

    videoElement.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoElement.src);

      if (videoElement.duration > 60) {
        alert(
          "Video is too long! Please upload a video of 45 seconds or less."
        );
        return;
      }
      setUploading(true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      data.append("resource_type", "video");

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
          { method: "POST", body: data }
        );
        const result = await res.json();
        setVideos((prev) => [
          ...prev,
          { url: result.secure_url, title: "", description: "" },
        ]);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        alert("Video upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    };

    videoElement.src = URL.createObjectURL(file);
  };

  const handleVideoDetailChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setVideos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
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
      console.error("Cover image upload failed:", err);
      alert("Cover image upload failed. Please try again.");
    } finally {
      setCoverUploading(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return alert("Please wait for videos to finish uploading.");

    if (!id) return alert("Artist ID not found.");

    const updatedData: Partial<ArtistProfile> = {
      _id: id,
      stageName: formData.stageName,
      genre: formData.genre,
      type: formData.type,
      bio: formData.bio,
      experienceYears: Number(formData.experienceYears),
      location: formData.location,
      availability:
        formData.availability === "available" ||
        formData.availability === "booked" ||
        formData.availability === "unavailable"
          ? formData.availability
          : "available",
      pricing: {
        minRate: Number(formData.minRate) || undefined,
        maxRate: Number(formData.maxRate) || undefined,
        currency: formData.currency,
      },
      socialLinks: {
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
        youtube: formData.youtube || undefined,
        tiktok: formData.tiktok || undefined,
      },
      videos,
      coverImage,
    };

    dispatch(updateArtistProfile(updatedData))
      .unwrap()
      .then(() => {
        alert("Artist profile updated successfully!");
        navigate(`/artist/${id}`);
      })
      .catch((err) => {
        console.error("Update failed:", err);
        alert("Failed to update profile. Please try again.");
      });
  };

  if (authLoading) {
    return (
      <p className="text-center mt-10 text-blue-500">Loading user info...</p>
    );
  }

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-500">
        Please log in to view your bids.
      </p>
    );
  }

  if (loading)
    return (
      <p className="text-center text-yellow-400 mt-10">Loading profile...</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white py-10 px-6">
      <button
        onClick={() => navigate(`/artist/${id}`)}
        className="mb-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
      >
        ← Back to Artist Page
      </button>

      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-6 text-center">
          Update Artist Profile 🎨
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-purple-300 mb-2">Stage Name</label>
            <input
              type="text"
              name="stageName"
              value={formData.stageName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-gray-700 outline-none"
              required
            />
          </motion.div>

          <div className="flex items-center justify-between mt-6">
            <span className="text-purple-300 font-medium">Availability</span>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={toggleAvailability}
              className={`relative w-24 h-10 rounded-full transition-all duration-300 ${
                formData.availability === "available"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              <span
                className={`absolute inset-0 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  formData.availability === "available"
                    ? "mr-5 text-white"
                    : "ml-5 text-white"
                }`}
              >
                {formData.availability === "available" ? "On" : "Off"}
              </span>

              <motion.div
                layout
                className={`absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md transition-all duration-300 ${
                  formData.availability === "available"
                    ? "translate-x-14"
                    : "translate-x-0"
                }`}
              />
            </motion.button>
          </div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-purple-300 mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-gray-200 outline-none focus:ring-2 focus:ring-purple-400"
              required
            >
              <option value="">Select Type</option>
              <option value="solo">Solo</option>
              <option value="band">Band</option>
              <option value="company">Company</option>
              <option value="group">Group</option>
            </select>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-purple-300 mb-2">Genre</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-gray-700 outline-none"
              required
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label className="block text-purple-300 mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-white border border-gray-700 outline-none h-28 resize-none"
              required
            />
          </motion.div>

          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1 flex flex-col">
              <label className="text-purple-300 mb-2 font-medium">
                Years of Experience
              </label>
              <input
                type="number"
                name="experienceYears"
                placeholder="Years of Experience"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-gray-700 outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-purple-300 mb-2 font-medium">
                Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="Search location..."
                ref={locationInputRef}
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-white/20 text-white border border-gray-700 outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-6 text-purple-300">
            Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="minRate"
              placeholder="Min Rate"
              value={formData.minRate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 outline-none"
            />
            <input
              type="number"
              name="maxRate"
              placeholder="Max Rate"
              value={formData.maxRate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 outline-none"
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-gray-200 outline-none"
            >
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <h3 className="text-xl font-semibold mt-6 text-purple-300">
            Social Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              name="instagram"
              placeholder="Instagram URL"
              value={formData.instagram}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="url"
              name="twitter"
              placeholder="Twitter URL"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="url"
              name="youtube"
              placeholder="YouTube URL"
              value={formData.youtube}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="url"
              name="tiktok"
              placeholder="TikTok URL"
              value={formData.tiktok}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <h3 className="text-xl font-semibold mt-6 text-purple-300">Videos</h3>
          <div className="flex flex-col items-center gap-3">
            {videos.map((video, index) => (
              <div key={index} className="w-full space-y-2">
                <video
                  src={video.url}
                  controls
                  className="w-full h-40 rounded-xl border-2 border-purple-400 shadow-md"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={video.title}
                  onChange={(e) =>
                    handleVideoDetailChange(index, "title", e.target.value)
                  }
                  className="w-full p-2 rounded bg-white/20 outline-none"
                />
                <textarea
                  placeholder="Description"
                  value={video.description}
                  onChange={(e) =>
                    handleVideoDetailChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  rows={2}
                  className="w-full p-2 rounded bg-white/20 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="text-red-400 hover:text-red-600"
                >
                  Remove Video
                </button>
              </div>
            ))}

            <h3 className="text-xl font-semibold mt-6 text-purple-300">
              Cover Image
            </h3>
            <div className="flex flex-col items-center gap-3">
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Artist Cover"
                  className="w-full h-60 object-cover rounded-xl border-2 border-purple-400 shadow-md"
                />
              )}
              <label className="text-sm text-gray-200 cursor-pointer mt-3">
                <span className="block border border-purple-400 px-4 py-2 rounded-lg hover:bg-purple-600 transition-all">
                  {coverUploading ? "Uploading..." : "Upload Cover Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>

            <label className="text-sm text-gray-200 cursor-pointer mt-3">
              <span className="block border border-purple-400 px-4 py-2 rounded-lg hover:bg-purple-600 transition-all">
                {uploading ? "Uploading..." : "Add More Videos"}
              </span>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="hidden"
              />
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-black font-bold rounded-full transition-all"
          >
            Update Profile
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default UpdateArtist;
