import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  createArtistProfile,
  type NewArtistProfileInput,
} from "../../../redux/reducers/artistReducer/artistSlice";

const CLOUDINARY_UPLOAD_PRESET = "stagehub";
const CLOUDINARY_CLOUD_NAME = "ddzndlcxn";

type Video = {
  url: string;
  title: string;
  description: string;
};

const CreateArtist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error} = useSelector(
    (state: RootState) => state.artist
  );

  const [formData, setFormData] = useState({
    stageName: "",
    genre: "",
    type: "",
    bio: "",
    experienceYears: "",
    location: "",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    minRate: "",
    maxRate: "",
    currency: "USD",
    availability: "available" as "available" | "unavailable",
  });

  const [videos, setVideos] = useState<Video[]>([]);
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");

  // ================================
  // HANDLE INPUT CHANGES
  // ================================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        alert("Video too long! Please upload 45s or less.");
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
        console.error("Video upload failed:", err);
        alert("Failed to upload video. Try again.");
      } finally {
        setUploading(false);
      }
    };

    videoElement.src = URL.createObjectURL(file);
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  // ================================
  // COVER IMAGE UPLOAD
  // ================================
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
      console.error("Cover image upload failed:", err);
      alert("Cover image upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // ================================
  // SUBMIT FORM
  // ================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      alert("Please wait for uploads to finish.");
      return;
    }

    if (!user?.id) {
      alert("You must be logged in to create a profile.");
      return;
    }

    const profileData: NewArtistProfileInput = {
      user: user.id,
      stageName: formData.stageName,
      genre: formData.genre,
      type: formData.type,
      bio: formData.bio,
      experienceYears: Number(formData.experienceYears) || 0,
      location: formData.location,
      socialLinks: {
        instagram: formData.instagram || undefined,
        twitter: formData.twitter || undefined,
        youtube: formData.youtube || undefined,
        tiktok: formData.tiktok || undefined,
      },
      pricing: {
        minRate: Number(formData.minRate) || undefined,
        maxRate: Number(formData.maxRate) || undefined,
        currency: formData.currency,
      },
      videos,
      coverImage,
      availability: formData.availability,
    };

    dispatch(createArtistProfile(profileData));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl text-white">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-300">
          Create Your Artist Profile 🎤
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Image Upload */}
          <div className="flex flex-col items-center gap-2">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-40 object-cover rounded-xl border-2 border-purple-400 shadow-md"
              />
            ) : (
              <div className="w-full h-40 bg-white/20 flex items-center justify-center text-gray-300 rounded-xl">
                No Cover Image Uploaded
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="text-sm text-gray-200 cursor-pointer"
            />
          </div>

          {/* Video Upload Section */}
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
                  placeholder="Video Title"
                  value={video.title}
                  onChange={(e) =>
                    handleVideoDetailChange(index, "title", e.target.value)
                  }
                  className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
                />
                <textarea
                  placeholder="Video Description"
                  value={video.description}
                  onChange={(e) =>
                    handleVideoDetailChange(index, "description", e.target.value)
                  }
                  rows={2}
                  className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="text-red-400 hover:text-red-600 mt-1"
                >
                  Remove Video
                </button>
              </div>
            ))}
            {videos.length < 5 && (
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="text-sm text-gray-200 cursor-pointer"
              />
            )}
            {uploading && <p className="text-yellow-300">Uploading...</p>}
          </div>

          {/* Artist Info */}
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

          <input
            type="text"
            name="stageName"
            placeholder="Stage Name"
            value={formData.stageName}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="text"
            name="genre"
            placeholder="Genre (e.g., Hip-Hop, Jazz)"
            value={formData.genre}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
          />

          <textarea
            name="bio"
            placeholder="Tell us about your artistry..."
            value={formData.bio}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
          />

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="minRate"
              placeholder="Min Rate"
              value={formData.minRate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="number"
              name="maxRate"
              placeholder="Max Rate"
              value={formData.maxRate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 text-gray-200 outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="USD">USD</option>
              <option value="KES">KES</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-lg font-semibold mt-6 transition duration-300 disabled:opacity-60"
          >
            {loading || uploading ? "Processing..." : "Create Profile"}
          </button>

          {error && <p className="text-red-400 text-center mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateArtist;
