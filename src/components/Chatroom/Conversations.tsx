import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import {
  fetchConversations,
  fetchMessages,
  fetchUnreadCount,
  addMessage,
  markMessageReadLocally,
} from "../../../redux/reducers/messageReducer/messageSlice";

import type { AppDispatch, RootState } from "../../../redux/store";
import { subscribeToMessageRead, subscribeToMessages } from "../../socket";

const Conversations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { conversations, messages, loading, error } = useSelector(
    (state: RootState) => state.messages
  );

  // Fetch conversations and unread counts
  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast.warn("Please log in to view conversations");
      return;
    }

    const loadConversations = async () => {
      const result = await dispatch(fetchConversations());
      if (fetchConversations.fulfilled.match(result) && result.payload.length) {
        // Fetch messages for all conversations to calculate unread counts
        result.payload.forEach((conv) => dispatch(fetchMessages(conv._id)));
      }
      dispatch(fetchUnreadCount());
    };

    loadConversations();
  }, [dispatch, navigate, user]);

  // Display error toasts
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Subscribe to socket events
  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNewMessage = (msg: any) => {
      dispatch(
        addMessage({
          conversationId: msg.conversation,
          message: msg,
          currentUserId: user._id,
        })
      );
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessageRead = ({ messageId, conversationId }: any) => {
      dispatch(markMessageReadLocally({ messageId, conversationId }));
    };

    subscribeToMessages(handleNewMessage);
    subscribeToMessageRead(handleMessageRead);
  }, [dispatch, user]);

  // Calculate unread count for a conversation
  const getUnreadCountForConversation = useCallback(
    (conversationId: string) => {
      return (messages[conversationId] || []).filter(
        (msg) =>
          typeof msg.sender !== "string" &&
          msg.sender._id !== user?._id &&
          !msg.read
      ).length;
    },
    [messages, user]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-yellow-400 hover:text-yellow-300 transition"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Your Conversations</h1>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <p className="text-gray-400 text-center">
            No conversations yet. Start one from an artist's profile!
          </p>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => {
              const otherParticipant = conv.participants.find(
                (p) => p._id !== user?._id
              );
              const unreadCount = getUnreadCountForConversation(conv._id);

              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/chatroom/${conv._id}`)}
                  className="flex items-center justify-between bg-gray-800 p-4 rounded-xl hover:bg-gray-700 cursor-pointer transition"
                >
                  <div>
                    <h2 className="text-lg font-semibold">
                      {otherParticipant?.name || "Unknown"}
                    </h2>
                    <p className="text-gray-400 text-sm truncate">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
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
