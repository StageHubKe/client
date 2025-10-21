import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import {
  getUserBids,
  getReceivedBids,
} from "../../../redux/reducers/bidReducer/bidSlice";
import { fetchCurrentUser } from "../../../redux/reducers/authReducer/authSlice";

const ITEMS_PER_PAGE = 5;

const MyBidsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { userBids, receivedBids, loading: bidsLoading, error: bidsError } =
    useSelector((state: RootState) => state.bid);
  const { user, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const [placedPage, setPlacedPage] = useState(1);
  const [receivedPage, setReceivedPage] = useState(1);
  const [showPlaced, setShowPlaced] = useState(true);
  const [showReceived, setShowReceived] = useState(false);

  // Fetch current user
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // Fetch bids once user is available
  useEffect(() => {
    if (user) {
      dispatch(getUserBids());
      dispatch(getReceivedBids());
    }
  }, [dispatch, user]);

  if (authLoading) {
    return <p className="text-center mt-10 text-blue-500">Loading user info...</p>;
  }

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-500">
        Please log in to view your bids.
      </p>
    );
  }

  if (bidsLoading) {
    return <p className="text-center mt-10 text-blue-500">Loading bids...</p>;
  }

  if (bidsError) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 mb-4">{bidsError}</p>
        <button
          onClick={() => {
            dispatch(getUserBids());
            dispatch(getReceivedBids());
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Pagination
  const paginatedUserBids = userBids.slice(
    (placedPage - 1) * ITEMS_PER_PAGE,
    placedPage * ITEMS_PER_PAGE
  );
  const totalPlacedPages = Math.ceil(userBids.length / ITEMS_PER_PAGE);

  const paginatedReceivedBids = receivedBids.slice(
    (receivedPage - 1) * ITEMS_PER_PAGE,
    receivedPage * ITEMS_PER_PAGE
  );
  const totalReceivedPages = Math.ceil(receivedBids.length / ITEMS_PER_PAGE);

  const pendingCount = receivedBids.filter((b) => b.status === "pending").length;

  const handleViewBid = (bidId: string, status: string) => {
    if (status === "rejected") {
      alert("This bid has been rejected and can no longer be viewed.");
      return;
    }
    navigate(`/bid/${bidId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-5">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Bids</h1>
          <button
            onClick={() => navigate("/gig-posts")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            ← Back to Gigs
          </button>
        </div>

        {/* Placed Bids */}
        <section className="mb-6">
          <button
            onClick={() => setShowPlaced(!showPlaced)}
            className="w-full flex justify-between items-center bg-indigo-100 px-4 py-3 rounded-lg hover:bg-indigo-200 transition"
          >
            <h2 className="text-xl font-semibold text-gray-700">Bids I Placed</h2>
            <span>{showPlaced ? "▲" : "▼"}</span>
          </button>

          {showPlaced && (
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              {userBids.length === 0 ? (
                <p className="text-gray-500">You haven’t placed any bids yet.</p>
              ) : (
                <>
                  <ul className="divide-y divide-gray-200">
                    {paginatedUserBids.map((bid) => (
                      <li
                        key={bid._id}
                        onClick={() => handleViewBid(bid._id, bid.status)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
                          bid.status === "rejected"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            {typeof bid.gig === "object"
                              ? bid.gig.eventName
                              : "Unknown Gig"}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Placed on{" "}
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${
                            bid.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : bid.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {bid.status.toUpperCase()}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {totalPlacedPages > 1 && (
                    <div className="flex justify-center items-center mt-4 space-x-2">
                      <button
                        disabled={placedPage === 1}
                        onClick={() => setPlacedPage((p) => p - 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-gray-600 text-sm">
                        Page {placedPage} of {totalPlacedPages}
                      </span>
                      <button
                        disabled={placedPage === totalPlacedPages}
                        onClick={() => setPlacedPage((p) => p + 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        {/* Received Bids */}
        <section>
          <button
            onClick={() => setShowReceived(!showReceived)}
            className="w-full flex justify-between items-center bg-green-100 px-4 py-3 rounded-lg hover:bg-green-200 transition relative"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-700">
                Bids Received on My Gigs
              </h2>
              {pendingCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <span>{showReceived ? "▲" : "▼"}</span>
          </button>

          {showReceived && (
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              {receivedBids.length === 0 ? (
                <p className="text-gray-500">No one has bid on your gigs yet.</p>
              ) : (
                <>
                  <ul className="divide-y divide-gray-200">
                    {paginatedReceivedBids.map((bid) => (
                      <li
                        key={bid._id}
                        className="p-4 flex justify-between items-center hover:bg-gray-50"
                      >
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            {typeof bid.gig === "object"
                              ? bid.gig.eventName
                              : "Unknown Gig"}
                          </h2>
                          <p className="text-sm text-gray-500">
                            From {bid.bidder.name} •{" "}
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Proposed Budget: Ksh {bid.proposedBudget}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-sm px-3 py-1 rounded-full ${
                              bid.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : bid.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {bid.status.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleViewBid(bid._id, bid.status)}
                            disabled={bid.status === "rejected"}
                            className={`px-3 py-1 rounded-lg transition ${
                              bid.status === "rejected"
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-indigo-500 text-white hover:bg-indigo-600"
                            }`}
                          >
                            View Bid
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {totalReceivedPages > 1 && (
                    <div className="flex justify-center items-center mt-4 space-x-2">
                      <button
                        disabled={receivedPage === 1}
                        onClick={() => setReceivedPage((p) => p - 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span className="text-gray-600 text-sm">
                        Page {receivedPage} of {totalReceivedPages}
                      </span>
                      <button
                        disabled={receivedPage === totalReceivedPages}
                        onClick={() => setReceivedPage((p) => p + 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MyBidsList;
