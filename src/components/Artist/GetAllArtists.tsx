import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { getAllArtistProfiles } from "../../../redux/reducers/artistReducer/artistSlice";
import { Link, useNavigate } from "react-router-dom";
import type { ArtistProfile } from "../../../redux/reducers/artistReducer/artistSlice";

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

  // Filter and search logic
  const filteredArtists = allProfiles.filter((artist: ArtistProfile) => {
    const matchesSearch =
      artist.stageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesType = filterType ? artist.type === filterType : true;
    const matchesAvailability = filterAvailability
      ? artist.availability === filterAvailability
      : true;

    return matchesSearch && matchesType && matchesAvailability;
  });

  const displayedArtists = filteredArtists.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

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

      {/* Search & Filters */}
    <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
  <input
    type="text"
    placeholder="Search by name, genre, or location..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full md:w-1/2 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
  />
  <select
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
    className="w-full md:w-1/4 p-3 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
  >
    <option className="bg-gray-400" value="">Types</option>
    <option className="bg-gray-400" value="solo">Solo</option>
    <option className="bg-gray-400" value="band">Band</option>
    <option className="bg-gray-400" value="group">Group</option>
    <option className="bg-gray-400" value="company">Company</option>
  </select>
  <select
    value={filterAvailability}
    onChange={(e) => setFilterAvailability(e.target.value)}
    className="w-full md:w-1/4 p-3 rounded-lg bg-white/20 text-white outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
  >
    <option className="bg-gray-400" value="">Availability</option>
    <option className="bg-gray-400" value="available">Available</option>
    <option className="bg-gray-400" value="unavailable">Unavailable</option>
  </select>
</div>


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
                  onClick={()=> navigate(`/artist/${artistId}`)}
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
                    {artist.type && (
                      <span className="inline-block bg-yellow-400/30 text-yellow-50 font-semibold text-sm px-3 py-1 rounded-full mb-2">
                        {artist.type.charAt(0).toUpperCase() + artist.type.slice(1)}
                      </span>
                    )}

                    <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                      {artist.stageName}
                    </h2>

                    <p className="text-gray-200 mb-1 font-medium">{artist.genre}</p>
                    <p className="text-gray-300 text-sm line-clamp-3">{artist.bio}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredArtists.length && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition duration-300"
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
