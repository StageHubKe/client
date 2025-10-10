import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { getAllArtistProfiles } from "../../../redux/reducers/artistReducer/artistSlice";
import { Link } from "react-router-dom";
import type { ArtistProfile } from "../../../redux/reducers/artistReducer/artistSlice";

const GetAllArtists: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allProfiles, loading, error } = useSelector(
    (state: RootState) => state.artist
  );

  useEffect(() => {
    dispatch(getAllArtistProfiles());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-center py-20 text-lg font-medium text-gray-300">
        Loading artists...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center py-20">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="mb-6">
        <Link
          to="/"
          className="text-lg font-semibold text-yellow-400 hover:text-yellow-300 transition"
        >
          ← Back Home
        </Link>
      </div>

      {allProfiles.length === 0 ? (
        <p className="text-gray-300 text-center py-10 text-lg">
          No artists found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProfiles.map((artist: ArtistProfile) => {
            const artistId =
              typeof artist._id === "string" ? artist._id : undefined;
            if (!artistId) return null;

            return (
              <div
                key={artistId}
                className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Cover Image */}
                {artist.coverImage && (
                  <div className="relative w-full h-40 sm:h-48 mb-4">
                    <img
                      src={artist.coverImage}
                      alt={`${artist.stageName} Cover`}
                      className="w-full h-full object-cover object-center rounded-t-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 rounded-t-2xl"></div>
                  </div>
                )}

                <div className="p-6">
                  {/* Type Badge */}
                  {artist.type && (
                    <span className="inline-block bg-yellow-400/30 text-yellow-50 font-semibold text-sm px-3 py-1 rounded-full mb-2">
                      {artist.type.charAt(0).toUpperCase() +
                        artist.type.slice(1)}
                    </span>
                  )}

                  {/* Artist Name */}
                  <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                    {artist.stageName}
                  </h2>

                  {/* Genre */}
                  <p className="text-gray-200 mb-1 font-medium">
                    {artist.genre}
                  </p>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {artist.bio}
                  </p>

                  {/* View Profile Link */}
                  <Link
                    to={`/artist/${artistId}`}
                    className="mt-5 inline-block text-yellow-400 font-semibold hover:text-yellow-300 hover:underline transition"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GetAllArtists;
