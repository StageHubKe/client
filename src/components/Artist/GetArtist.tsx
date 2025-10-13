import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  deleteArtistProfile,
  getArtistProfileById,
} from "../../../redux/reducers/artistReducer/artistSlice";
import { createConversation, fetchConversations } from "../../../redux/reducers/messageReducer/messageSlice";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "react-toastify";

const GetArtist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [chatLoading, setChatLoading] = useState(false);

  const { profile, loading, error } = useSelector((state: RootState) => state.artist);
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations } = useSelector((state: RootState) => state.messages);

  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    title?: string;
    description?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (id && user) {
      dispatch(getArtistProfileById(id));
      dispatch(fetchConversations());
    }
  }, [dispatch, id, user]);

  const handleDelete = async (artistId: string) => {
    if (!window.confirm("Are you sure you want to delete this artist profile?"))
      return;
    try {
      await dispatch(deleteArtistProfile(artistId)).unwrap();
      toast.success("Artist profile deleted successfully!");
      navigate("/getAllArtists");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete artist profile");
    }
  };

  const handleChatWithArtist = async () => {
    if (!id || !user || !profile?.user || typeof profile.user === "string") return;

    setChatLoading(true);
    try {
      const artistUserId = profile.user._id;
      const existingConversation = conversations.find((conv) =>
        conv.participants.some(
          (p) => p._id === artistUserId && p._id !== user._id
        ) && conv.participants.length === 2
      );

      if (existingConversation) {
        navigate(`/chatroom/${existingConversation._id}`);
        return;
      }

      const result = await dispatch(createConversation({ artistId: id })).unwrap();
      navigate(`/chatroom/${result.conversation._id}`);
    } catch (error) {
      console.error("Error initiating conversation:", error);
      toast.error("Failed to start chat");
    } finally {
      setChatLoading(false);
    }
  };

  if (!user) return null;
  if (!id)
    return <p className="text-center mt-10 text-red-500">Invalid artist ID.</p>;
  if (loading)
    return (
      <p className="text-center mt-10 text-gray-300">
        Loading artist profile...
      </p>
    );
  if (error) return <p className="text-center mt-10 text-red-400">{error}</p>;
  if (!profile)
    return (
      <p className="text-center mt-10 text-gray-400">
        No artist profile found.
      </p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4">
          <button
            onClick={() => navigate("/getAllArtists")}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition"
          >
            <ArrowLeft size={20} />
            <span>Back to All Artists</span>
          </button>
          <div className="flex gap-4">
            {user &&
              profile.user &&
              typeof profile.user !== "string" &&
              user._id === profile.user._id && (
                <>
                  <button
                    onClick={() => navigate(`/updateArtist/${profile._id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all"
                  >
                    ✏️ Update Profile
                  </button>
                  <button
                    onClick={() => handleDelete(profile._id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all"
                  >
                    🗑️ Delete Profile
                  </button>
                </>
              )}
            {user &&
              profile.user &&
              typeof profile.user !== "string" &&
              user._id !== profile.user._id && (
                <button
                  onClick={handleChatWithArtist}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-all disabled:opacity-50"
                  disabled={chatLoading}
                >
                  {chatLoading ? "Starting Chat..." : "💬 Chat with Artist"}
                </button>
              )}
          </div>
        </div>
        {profile.coverImage && (
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <img
              src={profile.coverImage}
              alt={`${profile.stageName} Cover`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60"></div>
            <div className="absolute bottom-4 left-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
                {profile.stageName}
              </h1>
              <p className="text-md sm:text-lg text-yellow-400 drop-shadow-md">
                {profile.genre} | {profile.type}
              </p>
            </div>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 text-center text-gray-300 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-2">Introduction</h2>
          <p className="text-lg">
            Welcome to {profile.stageName}'s page. {profile.stageName} is a
            passionate {profile.genre} {profile.type} from {profile.location},
            with over {profile.experienceYears} years of experience.{" "}
            {profile.stageName} brings vibrant energy to every performance and
            continues to inspire audiences everywhere.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-6 pb-6 mt-6"
        >
          <h2 className="text-2xl font-semibold mb-2">Biography</h2>
          <p className="text-gray-200 leading-relaxed text-lg bg-white/5 p-4 rounded-lg shadow-inner">
            {profile.bio}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 text-gray-300">
            <p>
              <strong className="text-yellow-400">Experience:</strong>{" "}
              {profile.experienceYears} years
            </p>
            <p>
              <strong className="text-yellow-400">Location:</strong>{" "}
              {profile.location}
            </p>
            <p>
              <strong className="text-yellow-400">Availability:</strong>{" "}
              {profile.availability}
            </p>
            {profile.pricing && (
              <>
                <p>
                  <strong className="text-yellow-400">Min Rate:</strong>{" "}
                  {profile.pricing.minRate} {profile.pricing.currency}
                </p>
                <p>
                  <strong className="text-yellow-400">Max Rate:</strong>{" "}
                  {profile.pricing.maxRate} {profile.pricing.currency}
                </p>
              </>
            )}
            <p>
              <strong className="text-yellow-400">Rating:</strong>{" "}
              {profile.rating} ⭐
            </p>
            <p>
              <strong className="text-yellow-400">Total Reviews:</strong>{" "}
              {profile.totalReviews}
            </p>
          </div>
          {profile.user && (
            <div className="mt-8 border-t border-gray-700 pt-6">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
                Artist Account Info
              </h2>
              <p>
                <strong className="text-yellow-400">Name:</strong>{" "}
                {(profile.user as { name: string }).name}
              </p>
              <p>
                <strong className="text-yellow-400">Email:</strong>{" "}
                {(profile.user as { email: string }).email}
              </p>
              <p>
                <strong className="text-yellow-400">Role:</strong>{" "}
                {(profile.user as { role: string }).role || "Artist"}
              </p>
            </div>
          )}
          {profile.socialLinks && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
                Follow {profile.stageName}
              </h2>
              <div className="flex flex-wrap gap-4 text-xl">
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-400/20 hover:bg-blue-400/40 transition"
                  >
                    <SiX />
                  </a>
                )}
                {profile.socialLinks.instagram && (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 transition"
                  >
                    <FaInstagram />
                  </a>
                )}
                {profile.socialLinks.youtube && (
                  <a
                    href={profile.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 transition"
                  >
                    <FaYoutube />
                  </a>
                )}
              </div>
            </div>
          )}
          {profile.videos?.length ? (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-4">
                Performance Videos
              </h2>
              <div className="overflow-x-auto">
                <div className="flex gap-6 w-max animate-slideLeft">
                  {profile.videos.map((video, i) => (
                    <div
                      key={i}
                      className="cursor-pointer group min-w-[300px]"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <video
                        src={video.url}
                        className="w-full h-56 object-cover rounded-xl shadow-lg border border-white/10 group-hover:opacity-80 transition"
                      />
                      <p className="mt-2 text-yellow-400 font-semibold">
                        {video.title}
                      </p>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-10">
              No performance videos uploaded yet.
            </p>
          )}
        </motion.div>
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-6">
            <div className="relative bg-gray-900/90 rounded-2xl p-4 sm:p-6 shadow-2xl w-full max-w-md sm:max-w-2xl md:max-w-3xl">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-3 right-3 text-white hover:text-yellow-400 transition-all"
              >
                <X size={26} />
              </button>
              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full rounded-lg shadow-md max-h-[60vh] object-contain"
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {selectedVideo.title}
                </h3>
                <p className="text-gray-300 text-sm sm:text-base mt-2">
                  {selectedVideo.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetArtist;