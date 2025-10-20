import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  getBidById,
  updateBidStatus,
} from "../../../redux/reducers/bidReducer/bidSlice";
import { fetchPosterById } from "../../../redux/reducers/posterReducer/posterSlice";
import { fetchCurrentUser } from "../../../redux/reducers/authReducer/authSlice";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageCircle,
  Clock,
} from "lucide-react";
import { getArtistProfileById } from "../../../redux/reducers/artistReducer/artistSlice";

const StatusBadge = ({ status }: { status: string }) => {
  const colors =
    status === "accepted"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-sm font-semibold ${colors} uppercase`}
    >
      {status}
    </span>
  );
};

const SingleBid: React.FC = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    selectedBid,
    loading: bidLoading,
    error: bidError,
  } = useSelector((state: RootState) => state.bid);
  const {
    poster,
    loading: posterLoading,
    error: posterError,
  } = useSelector((state: RootState) => state.poster);
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const { profile } = useSelector((state: RootState) => state.artist);
  console.log("profile", profile);

  useEffect(() => {
    const id = profile?._id ?? "";
    dispatch(getArtistProfileById(id));
  }, [dispatch, profile]);

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (user && bidId) {
      dispatch(getBidById(bidId));
    }
  }, [dispatch, bidId, user]);

  useEffect(() => {
    if (selectedBid && typeof selectedBid.gig === "string") {
      dispatch(fetchPosterById(selectedBid.gig));
    }
  }, [dispatch, selectedBid]);

  useEffect(() => {
    if (selectedBid) {
      dispatch(getBidById(selectedBid._id));
    }
  }, [dispatch, selectedBid?.status]);

  if (authLoading)
    return (
      <p className="text-center mt-10 text-blue-500">Loading user info...</p>
    );
  if (!user)
    return (
      <p className="text-center mt-10 text-red-500">
        Please log in to view this bid.
      </p>
    );
  if (bidLoading || posterLoading)
    return <p className="text-center mt-10 text-blue-500">Loading bid...</p>;
  if (bidError || posterError)
    return (
      <p className="text-center mt-10 text-red-500">
        {bidError || posterError}
      </p>
    );
  if (!selectedBid)
    return <p className="text-center mt-10 text-gray-500">Bid not found.</p>;

  const isBidder = user._id === selectedBid.bidder._id;
  const isGigCreator =
    selectedBid.gig &&
    typeof selectedBid.gig !== "string" &&
    user._id === selectedBid.gig.createdBy?._id;

  if (!isBidder && !isGigCreator)
    return (
      <p className="text-center mt-10 text-red-500">
        Unauthorized: You can only view bids you created or bids placed on your
        gigs.
      </p>
    );

  const gigName =
    typeof selectedBid.gig === "object"
      ? selectedBid.gig.eventName
      : poster?.eventName || "Unknown Gig";
  const gigBudget =
    typeof selectedBid.gig === "object"
      ? selectedBid.gig.budget
      : poster?.budget;

  const handleStatusChange = (status: "accepted" | "rejected") => {
    dispatch(updateBidStatus({ bidId: selectedBid._id, status }));
  };
  const artistId = profile?._id ?? "";
  const handleViewArtist = () => {
    navigate(`/artist/${artistId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/my-bids")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              aria-label="Back to bids"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bid Details</h1>
              <p className="text-gray-600">
                {isGigCreator ? "Bid received" : "Your bid"} •{" "}
                {new Date(selectedBid.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <StatusBadge status={selectedBid.status} />
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div
            className={`px-8 py-6 text-white ${
              isGigCreator
                ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                : "bg-gradient-to-r from-emerald-600 to-teal-600"
            }`}
          >
            <h2 className="text-2xl font-bold">{gigName}</h2>
            <p className="text-blue-100 opacity-90 mt-1">
              {isGigCreator ? "Bid from artist" : "Your proposal for gig"}
            </p>
          </div>

          <div className="p-8 space-y-8">
            {selectedBid.status === "accepted" && isGigCreator && (
              <div className="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="text-green-600" size={28} />
                  <h3 className="text-lg font-semibold text-green-800">
                    You have accepted this bid! 🎉
                  </h3>
                  <p className="text-sm text-green-700 max-w-md">
                    You can now view the bidder’s profile for further contact.
                  </p>
                  <button
                    onClick={handleViewArtist}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all shadow-lg"
                  >
                    View Artist
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="text-blue-500" size={20} />
                  {isGigCreator ? "Bidder Info" : "Gig Creator"}
                </h3>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-2">
                  <p className="font-medium text-gray-800">
                    {isGigCreator && selectedBid.bidder.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedBid.bidder.email}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  💰 Budget
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                  <div className="text-3xl font-bold text-green-800 mb-2">
                    Ksh{" "}
                    {selectedBid.agreedToBudget
                      ? gigBudget
                      : selectedBid.proposedBudget}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedBid.agreedToBudget
                      ? "✅ Agreed to gig budget"
                      : "💬 Proposed amount"}
                  </p>
                </div>
              </div>
            </div>

            {poster?.performanceDuration && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="text-gray-400" size={18} /> Gig Details
                </h3>
                <p className="text-gray-700">
                  Duration: {poster.performanceDuration}
                </p>
              </div>
            )}

            {selectedBid.reason && (
              <div className="bg-indigo-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  💭 Reason for Bid
                </h3>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-gray-700 italic">"{selectedBid.reason}"</p>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-4 pt-6 border-t border-gray-200">
              {selectedBid.status === "pending" && isGigCreator && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => handleStatusChange("accepted")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <CheckCircle size={20} /> Accept Bid
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <XCircle size={20} /> Reject Bid
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBid;
