import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { getAllArtistProfiles } from "../../../redux/reducers/artistReducer/artistSlice";
import { Link, useNavigate } from "react-router-dom";
import type { ArtistProfile } from "../../../redux/reducers/artistReducer/artistSlice";
import { ArrowLeft } from "lucide-react";

const PAGE_SIZE = 6;

const GetAllArtists: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allProfiles, loading, error } = useSelector(
    (state: RootState) => state.artist
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getAllArtistProfiles());
  }, [dispatch]);

  const filteredArtists = allProfiles.filter((artist: ArtistProfile) => {
    const matchesSearch =
      artist.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.location?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesType = filterType ? artist.type === filterType : true;
    const matchesAvailability = filterAvailability
      ? artist.availability === filterAvailability
      : true;

    return matchesSearch && matchesType && matchesAvailability;
  });

  const displayedArtists = filteredArtists.slice(0, visibleCount);

  const handleLoadMore = () => setVisibleCount((prev) => prev + PAGE_SIZE);

  if (loading)
    return (
      <div className="text-center py-20 text-lg font-medium text-yellow-400">
        Loading artists...
      </div>
    );

  if (error)
    return <div className="text-center text-red-400 py-20">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900 text-white p-8">
      {/* Header Navigation */}
      <div className="mb-8 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium text-gray-200 shadow-md hover:shadow-lg"
        >
          <ArrowLeft size={18} />  Back Home
        </Link>
       <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Explore Artists
        </h2>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, genre, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full md:w-1/4 p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
        >
          <option value="">Type</option>
          <option value="solo">Solo</option>
          <option value="band">Band</option>
          <option value="group">Group</option>
          <option value="company">Company</option>
        </select>
        <select
          value={filterAvailability}
          onChange={(e) => setFilterAvailability(e.target.value)}
          className="w-full md:w-1/4 p-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
        >
          <option value="">Availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* Artist Cards */}
      {displayedArtists.length === 0 ? (
        <p className="text-gray-300 text-center py-10 text-lg">
          No artists found.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedArtists.map((artist: ArtistProfile) => {
              const artistId =
                typeof artist._id === "string" ? artist._id : undefined;
              if (!artistId) return null;

              return (
                <div
                  key={artistId}
                  onClick={() => navigate(`/artist/${artistId}`)}
                  className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-yellow-400/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {artist.coverImage && (
                    <div className="relative w-full h-48">
                      <img
                        src={artist.coverImage}
                        alt={`${artist.stageName} Cover`}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {artist.type && (
                      <span className="inline-block bg-yellow-100 text-yellow-700 font-semibold text-sm px-3 py-1 rounded-full mb-3">
                        {artist.type.charAt(0).toUpperCase() +
                          artist.type.slice(1)}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-black font-bold mb-1">
                      {artist.stageName}
                    </h2>
                    <p className="text-gray-700 mb-1 font-medium">
                      🎵 {artist.genre}
                    </p>
                    {/* <p className="text-gray-600 text-sm line-clamp-3">
                      {artist.bio || "No bio provided."}
                    </p> */}
                    <p className="mt-3 text-sm text-yellow-600 italic">
                      📍 {artist.location || "Location not specified"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredArtists.length && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-lg hover:bg-yellow-300 hover:shadow-yellow-400/50 transition-transform duration-300 hover:scale-105"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GetAllArtists;
