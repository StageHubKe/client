import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import {
  fetchConversations,
  fetchUnreadCount,
  addMessage,
  markMessageReadLocally,
} from "../../../redux/reducers/messageReducer/messageSlice";
import type { AppDispatch, RootState } from "../../../redux/store";
import { subscribeToMessageRead, subscribeToMessages } from "../../socket";
import { fetchCurrentUser } from "../../../redux/reducers/authReducer/authSlice";

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Conversations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { conversations, messages, loading, error } = useSelector((state: RootState) => state.messages);

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchConversations());
    dispatch(fetchUnreadCount());
  }, [dispatch, user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNewMessage = (msg: any) => {
      dispatch(addMessage({ conversationId: msg.conversation, message: msg, currentUserId: user._id }));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessageRead = ({ messageId, conversationId }: any) => {
      dispatch(markMessageReadLocally({ messageId, conversationId }));
    };

    subscribeToMessages(handleNewMessage);
    subscribeToMessageRead(handleMessageRead);
  }, [dispatch, user]);

  const getUnreadCountForConversation = useCallback(
    (conversationId: string) => {
      const convoMessages = messages[conversationId] || [];
      return convoMessages.filter(
        (msg) =>
          typeof msg.sender !== "string" &&
          msg.sender._id !== user?._id &&
          !msg.read
      ).length;
    },
    [messages, user]
  );

  if (authLoading) return <p className="text-center mt-10 text-green-400">Loading user info...</p>;
  if (!user) return <p className="text-center mt-10 text-red-400">Please log in to view your conversations.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B141A] via-[#121C22] to-[#0B141A] text-white py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-white hover:text-green-300 transition"
            aria-label="Back to home"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-3xl font-bold text-white">Your Conversations</h1>
        </div>
        {loading ? (
          <p className="text-gray-400 text-center">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p className="text-gray-400 text-center">
            No conversations yet. Start one from an artist’s profile!
          </p>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const otherParticipant = conv.participants.find((p) => p._id !== user?._id);
              const unreadCount = getUnreadCountForConversation(conv._id);

              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/chatroom/${conv._id}`)}
                  className="flex items-center justify-between bg-[#1E2A30] hover:bg-[#233036] p-4 rounded-xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-green-800/30"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-green-200">
                        {otherParticipant?.name || "Unknown User"}
                      </h2>
                      <p className="text-xs text-gray-400 ml-2">
                        {conv.updatedAt ? formatTime(conv.updatedAt) : "—"}
                      </p>
                    </div>
                    <p className="text-gray-300 text-sm truncate mt-1">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <span className="ml-4 bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-inner">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
