import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error } = useSelector((state: RootState) => state.artist);

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

  // handle field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // handle cover image upload
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
      alert("Cover image upload failed. Try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videos.length >= 5) {
      alert("You can upload up to 5 videos only.");
      return;
    }

    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";

    videoEl.onloadedmetadata = async () => {
      if (videoEl.duration > 60) {
        alert("Video too long! Upload 45s or less.");
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
        alert("Video upload failed. Try again.");
        console.error(err);
      } finally {
        setUploading(false);
      }
    };

    videoEl.src = URL.createObjectURL(file);
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

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) {
      alert("Please wait for uploads to finish.");
      return;
    }

    const profileData: NewArtistProfileInput = {
      user: user?.id || "",
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

    try {
      await dispatch(createArtistProfile(profileData)).unwrap();
      alert("🎉 Profile created successfully!");
      navigate("/getAllArtists");
    } catch (err) {
      console.error("Error creating profile:", err);
      alert("Failed to create profile. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-2xl text-white">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-300">
          Create Your Artist Profile 🎤
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover Image */}
          <div className="flex flex-col items-center gap-2">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-48 object-cover rounded-xl border-2 border-purple-400 shadow-md"
              />
            ) : (
              <div className="w-full h-48 bg-white/20 flex items-center justify-center text-gray-300 rounded-xl">
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

          {/* Videos */}
          <div className="flex flex-col items-center gap-4">
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
                  className="text-red-400 hover:text-red-600"
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

          {/* Experience & Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              name="experienceYears"
              placeholder="Years of Experience"
              value={formData.experienceYears}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="text"
              name="location"
              placeholder="Location (City, Country)"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Socials */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="url"
              name="instagram"
              placeholder="Instagram Link"
              value={formData.instagram}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="url"
              name="twitter"
              placeholder="Twitter Link"
              value={formData.twitter}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="url"
              name="youtube"
              placeholder="YouTube Link"
              value={formData.youtube}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="url"
              name="tiktok"
              placeholder="TikTok Link"
              value={formData.tiktok}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="number"
              name="minRate"
              placeholder="Min Rate"
              value={formData.minRate}
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="number"
              name="maxRate"
              placeholder="Max Rate"
              value={formData.maxRate}
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 text-gray-200 outline-none focus:ring-2 focus:ring-purple-400"
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
