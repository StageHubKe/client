import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate} from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  deletePoster,
  fetchPosterById,
} from "../../../redux/reducers/posterReducer/posterSlice";
import { placeBid, getUserBids } from "../../../redux/reducers/bidReducer/bidSlice";
import { Menu, X, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";

const GigPosterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { poster, loading, error } = useSelector((state: RootState) => state.poster);
  const { user } = useSelector((state: RootState) => state.auth);
  const { userBids, loading: bidLoading, message, error: bidError } = useSelector(
    (state: RootState) => state.bid
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);

  const [agreedToBudget, setAgreedToBudget] = useState(true);
  const [proposedBudget, setProposedBudget] = useState<number | undefined>();
  const [reason, setReason] = useState("");

  const menuRef = useRef<HTMLDivElement | null>(null);

  const hasBid = userBids.some(
    (bid: { gig: string | { _id: string }; bidder: { _id: string } }) =>
      (typeof bid.gig === "string" ? bid.gig : bid.gig._id) === id && bid.bidder._id === user?._id
  );

  useEffect(() => {
    if (id) dispatch(fetchPosterById(id));
    if (user?._id) dispatch(getUserBids());
  }, [id, user, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleDelete = async () => {
    if (!poster?._id) return;
    try {
      await dispatch(deletePoster(poster._id)).unwrap();
      toast.success("🗑️ Poster deleted successfully");
      navigate("/gig-posts");
    } catch {
      toast.error("❌ Failed to delete poster");
    }
  };

  const handleEdit = () => {
    if (poster?._id) navigate(`/edit-gig/${poster._id}`);
    setMenuOpen(false);
  };

  const handleViewBids = () => {
    if (poster?._id) navigate(`/bids/${poster._id}`);
    setMenuOpen(false);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poster?._id) return;

    await dispatch(
      placeBid({
        gigId: poster._id,
        agreedToBudget,
        proposedBudget: agreedToBudget ? poster.budget : proposedBudget,
        reason: reason || undefined,
      })
    );

    setShowBidForm(false);
    setReason("");
    setProposedBudget(undefined);
    setAgreedToBudget(true);
    dispatch(getUserBids());
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-xl text-gray-300 animate-pulse">Loading poster...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-red-400 text-lg font-semibold">{error}</p>
      </div>
    );

  if (!poster)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
        <p className="text-gray-400 text-lg">Poster not found.</p>
      </div>
    );

  const isCreator = user?._id === poster.createdBy?._id;
  const formattedDate = poster.multiDay
    ? `${new Date(poster.eventStartDate).toLocaleDateString()} - ${new Date(
        poster.eventEndDate
      ).toLocaleDateString()}`
    : poster.eventStartDate
    ? new Date(poster.eventStartDate).toLocaleDateString()
    : "Not specified";

  return (
    <div className="w-full min-h-screen flex justify-center items-start py-10 bg-gradient-to-b from-gray-900 via-purple-900 to-indigo-900">
      <div className="w-full max-w-5xl bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/gig-posts")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-sm font-medium text-gray-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft size={18} /> Back to Posters
          </button>

          {isCreator && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
              >
                {menuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <button
                    onClick={handleEdit}
                    className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    🗑️ Delete
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
          <div className="relative mb-8">
            <img
              src={poster.posterImage}
              alt={poster.eventName}
              onClick={() => setShowModal(true)}
              className="w-full h-80 object-cover rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
          </div>
        )}

        {/* Poster Details */}
        <div className="bg-gray-900/70 rounded-2xl p-6 shadow-inner text-gray-200">
          <h1 className="text-3xl font-bold text-yellow-400 mb-3">{poster.eventName}</h1>
          <p className="text-gray-300 mb-4">{poster.eventDescription || "No description provided."}</p>

          <div className="flex flex-wrap gap-3 mb-6 text-sm">
            <span className="bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
              🎭 {poster.eventType}
            </span>
            <span className="bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
              👤 {poster.artistCategory}
            </span>
            <span className="bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700 capitalize">
              📋 {poster.planningStage || "Not specified"}
            </span>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-yellow-300">Event Details</h2>
              <ul className="text-gray-200 space-y-1">
                <li>
                  <strong>Date:</strong> {formattedDate}
                </li>
                <li>
                  <strong>Performance Duration:</strong> {poster.performanceDuration}
                </li>
                <li>
                  <strong>Guest Count:</strong> {poster.guestCount}
                </li>
                <li>
                  <strong>Venue Address:</strong> {poster.venueAddress}
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 shadow-md">
              <h2 className="text-lg font-semibold mb-2 text-yellow-300">Planner Info</h2>
              <ul className="text-gray-200 space-y-1">
                <li>
                  <strong>Name:</strong> {poster.eventPlannerName}
                </li>
                <li>
                  <strong>Contact:</strong> {poster.contactInfo}
                </li>
                <li>
                  <strong>Budget:</strong>{" "}
                  <span className="text-green-400 font-medium">KSH.{poster.budget}</span>
                </li>
              
              </ul>
            </div>
          </div>

          {/* Bid Section */}
          {!isCreator && (
            <div className="flex justify-center mb-6">
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
        </div>

        {/* Bid Modal */}
        {showBidForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-gray-900 p-8 rounded-2xl w-[90%] max-w-md border border-gray-700 shadow-xl relative">
              <button
                onClick={() => setShowBidForm(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
              <h2 className="text-2xl text-yellow-400 mb-4 font-semibold">Place Your Bid</h2>

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

        {/* Image Modal */}
        {showModal && poster.posterImage && (
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
      </div>
    </div>
  );
};

export default GigPosterDetails;
