import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  deletePoster,
  fetchPosterById,
} from "../../../redux/reducers/posterReducer/posterSlice";
import { placeBid, getUserBids } from "../../../redux/reducers/bidReducer/bidSlice";
import { Menu } from "lucide-react";

const GigPosterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { poster, loading, error } = useSelector(
    (state: RootState) => state.poster
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const { userBids, loading: bidLoading, message, error: bidError } = useSelector(
    (state: RootState) => state.bid
  );

  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);

  // Bid form fields
  const [agreedToBudget, setAgreedToBudget] = useState(true);
  const [proposedBudget, setProposedBudget] = useState<number | undefined>(undefined);
  const [reason, setReason] = useState("");

  // Check if a bid exists for this gig by the current user
  const hasBid = userBids.some(
    (bid: { gig: string | { _id: string }; bidder: { _id: string } }) =>
      (typeof bid.gig === "string" ? bid.gig : bid.gig._id) === id && bid.bidder._id === user?._id
  );

  useEffect(() => {
    if (id) dispatch(fetchPosterById(id));
    if (user?._id) dispatch(getUserBids());
  }, [id, user, dispatch]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this gig poster?"
    );
    if (!confirmDelete) return;

    if (poster && poster._id) {
      await dispatch(deletePoster(poster._id));
      navigate("/gig-posts");
    }
  };

  const handleEdit = () => {
    if (poster && poster._id) navigate(`/edit-gig/${poster._id}`);
  };

  const handleViewBids = () => {
    if (poster && poster._id) navigate(`/bids/${poster._id}`);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poster?._id) return;

    const bidData = {
      gigId: poster._id,
      agreedToBudget,
      proposedBudget: agreedToBudget ? poster.budget : proposedBudget,
      reason: reason || undefined,
    };

    await dispatch(placeBid(bidData));

    setShowBidForm(false);
    setReason("");
    setProposedBudget(undefined);
    setAgreedToBudget(true);
    dispatch(getUserBids());
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-300">
        Loading details...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-400 mt-10">
        Failed to load gig details: {error}
      </div>
    );

  if (!poster) return null;

  const formattedDate = poster.multiDay
    ? `${new Date(poster.eventStartDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })} - ${new Date(poster.eventEndDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`
    : poster.eventStartDate
    ? new Date(poster.eventStartDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not specified";

  const isCreator =
    user && poster.createdBy && user._id === poster.createdBy._id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900 p-8 text-gray-200 relative">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/gig-posts")}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          ← Back to Posters
        </button>

        {/* Hamburger Menu - Only visible for creator */}
        {isCreator && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
            >
              <Menu className="text-yellow-400 w-6 h-6" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                >
                  ✏️ Edit Poster
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  🗑️ Delete Poster
                </button>
                <button
                  onClick={handleViewBids}
                  className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                >
                  📋 View Bids
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Poster Image */}
      {poster.posterImage && (
        <div className="relative mb-8 cursor-pointer group">
          <img
            src={poster.posterImage}
            alt={poster.eventName}
            onClick={() => setShowModal(true)}
            className="w-full h-80 object-cover rounded-xl shadow-lg transition-transform group-hover:scale-[1.02]"
          />
          <div className="absolute top-4 left-4 bg-indigo-600/80 text-white text-sm px-4 py-2 rounded-full shadow-md">
            📅 {formattedDate}
          </div>
          <p className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-lg">
            Click to view full image
          </p>
        </div>
      )}

      {/* Image Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl w-full p-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-white text-3xl hover:text-gray-400 transition"
            >
              ✕
            </button>
            <img
              src={poster.posterImage}
              alt="Full poster"
              className="w-full h-auto rounded-xl shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-3 text-yellow-400 drop-shadow">
          {poster.eventName}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-300">
          <span className="bg-gray-800/70 px-3 py-1 rounded-full border border-gray-700">
            🎭 {poster.eventType}
          </span>
          <span className="bg-gray-800/70 px-3 py-1 rounded-full border border-gray-700">
            👤 {poster.artistCategory}
          </span>
          <span className="bg-gray-800/70 px-3 py-1 rounded-full border border-gray-700 capitalize">
            📋 {poster.planningStage || "Not specified"}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-yellow-300">
          Event Description
        </h2>
        <p className="text-gray-200 leading-relaxed bg-gray-800/50 p-5 rounded-lg border border-gray-700 shadow-sm">
          {poster.eventDescription || "No description provided."}
        </p>
      </div>

      {/* Event Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-yellow-300">
            Event Details
          </h2>
          <ul className="space-y-2 text-gray-200">
            <li>
              <strong>Performance Duration:</strong>{" "}
              {poster.performanceDuration}
            </li>
            <li>
              <strong>Guest Count:</strong> {poster.guestCount}
            </li>
            <li>
              <strong>Venue Address:</strong> {poster.venueAddress}
            </li>
            <li>
              <strong>Instruments Provided:</strong>{" "}
              {poster.instrumentsProvided ? "Yes" : "No"}
            </li>
            <li>
              <strong>Performer Equipment:</strong>{" "}
              {poster.performerEquipment || "Not specified"}
            </li>
          </ul>
        </div>

        <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700 shadow-md">
          <h2 className="text-lg font-semibold mb-3 text-yellow-300">
            Planner Information
          </h2>
          <ul className="space-y-2 text-gray-200">
            <li>
              <strong>Planner Name:</strong> {poster.eventPlannerName}
            </li>
            <li>
              <strong>Contact Info:</strong> {poster.contactInfo}
            </li>
            <li>
              <strong>Budget:</strong>{" "}
              <span className="text-green-400 font-medium">
                KSH.{poster.budget}
              </span>
            </li>
            {poster.createdBy && (
              <li>
                <strong>Created By:</strong>{" "}
                <Link
                  to={`/artist/${poster.createdBy._id}`}
                  className="text-blue-500 hover:underline"
                >
                  {poster.createdBy.name}
                </Link>{" "}
                ({poster.createdBy.email})
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bid Section */}
      {!isCreator && (
        <div className="flex justify-center mb-10">
          <button
            onClick={() => setShowBidForm(true)}
            disabled={hasBid}
            className={`bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-xl shadow-md transition-transform ${
              hasBid
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-yellow-400 hover:scale-105"
            }`}
          >
            💰 {hasBid ? "Bid Already Placed" : "Place a Bid"}
          </button>
        </div>
      )}

      {/* Bid Modal Form */}
      {showBidForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 p-8 rounded-2xl w-[90%] max-w-md border border-gray-700 shadow-xl relative">
            <button
              onClick={() => setShowBidForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
            <h2 className="text-2xl text-yellow-400 mb-4 font-semibold">
              Place Your Bid
            </h2>

            <form onSubmit={handleSubmitBid} className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreedToBudget}
                    onChange={(e) => setAgreedToBudget(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span>I agree to the gig’s budget (KSH {poster.budget})</span>
                </label>
              </div>

              {!agreedToBudget && (
                <>
                  <div>
                    <label className="block mb-1 text-gray-300">Your Proposed Budget (KSH)</label>
                    <input
                      type="number"
                      value={proposedBudget ?? ""}
                      onChange={(e) => setProposedBudget(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-yellow-400 outline-none"
                      placeholder="Enter your proposed amount"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-300">Reason / Notes (Optional)</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-yellow-400 outline-none"
                      rows={4}
                      placeholder="Explain your offer (optional)..."
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={bidLoading}
                className="w-full bg-yellow-500 text-gray-900 font-semibold py-2 rounded-md hover:bg-yellow-400 transition"
              >
                {bidLoading ? "Submitting..." : "Submit Bid"}
              </button>

              {bidError && <p className="text-red-400 text-sm">{bidError}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GigPosterDetails;