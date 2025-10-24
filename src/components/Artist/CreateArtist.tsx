import React, { useEffect, useRef, useState } from "react";
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

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /** Initialize Autocomplete once mounted */
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
            location: place.formatted_address ?? "",
          }));
        }
      });
    }
  }, []);

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

          <div className="flex flex-col items-center gap-3 w-full mb-10">
            <h3 className="text-xl font-semibold text-white text-center">
              🎨 Upload a Cover Image
            </h3>
            <p className="text-sm text-gray-300 text-center max-w-md">
              This will be the main image displayed for your content. Choose a
              high-quality, engaging image that best represents you, your band or your
              team.
            </p>

            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-56 object-cover rounded-xl border-2 border-purple-400 shadow-lg hover:scale-[1.02] transition-transform"
              />
            ) : (
              <div className="w-full h-56 bg-white/10 border-2 border-dashed border-purple-400 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                No Cover Image Uploaded Yet
              </div>
            )}

            <label
              htmlFor="cover-upload"
              className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg cursor-pointer transition"
            >
              Upload Cover Image
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {/* Videos Upload Section */}
          <div className="flex flex-col items-center gap-5 w-full">
            <h3 className="text-xl font-semibold text-white text-center">
              🎥 Add Videos
            </h3>
            <p className="text-sm text-gray-300 text-center max-w-md">
              You can upload up to{" "}
              <span className="font-semibold text-purple-300">5 videos that introduces you or showcases your work</span>.
              Each video can include a title and short description to explain
              its content.
            </p>

            {videos.map((video, index) => (
              <div
                key={index}
                className="w-full bg-white/10 p-4 rounded-xl border border-purple-400 shadow-md space-y-3"
              >
                <video
                  src={video.url}
                  controls
                  className="w-full h-48 rounded-lg border-2 border-purple-400 shadow-sm"
                />

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Video Title (e.g., Introduction or Walkthrough)"
                    value={video.title}
                    onChange={(e) =>
                      handleVideoDetailChange(index, "title", e.target.value)
                    }
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <textarea
                    placeholder="Add a brief description about this video..."
                    value={video.description}
                    onChange={(e) =>
                      handleVideoDetailChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    rows={2}
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium"
                >
                  ✖ Remove Video
                </button>
              </div>
            ))}

            {videos.length < 5 && (
              <div className="flex flex-col items-center gap-2">
                <label
                  htmlFor="video-upload"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg cursor-pointer transition"
                >
                  Upload New Video
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            )}

            {uploading && (
              <p className="text-yellow-300 mt-2 animate-pulse">Uploading...</p>
            )}
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
              ref={inputRef}
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
