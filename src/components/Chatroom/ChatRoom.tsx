import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Send } from "lucide-react";

import { toast } from "react-toastify";
import {
  socket,
  subscribeToMessages,
  subscribeToConversationUpdates,
  subscribeToMessageRead,
} from "../../socket";

import {
  addMessage,
  fetchMessages,
  markMessageAsRead,
  markMessageReadLocally,
  sendMessage,
  setUnreadCount,
  updateConversation,
  fetchConversationById,
  type Message,
} from "../../../redux/reducers/messageReducer/messageSlice";
import type { AppDispatch, RootState } from "../../../redux/store";
import type { User } from "../../types";

const ChatRoom: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [participantOnline, setParticipantOnline] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, error, participantNames } = useSelector(
    (state: RootState) => state.messages
  );
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const currentMessages = conversationId ? messages[conversationId] || [] : [];
  const participantName = conversationId
    ? participantNames[conversationId] || null
    : null;

  // Scroll to the bottom of the message list
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  // Display error toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  //track if user is online or offline
  useEffect(() => {
    if (!conversationId || !user) return;

    const handleUserStatus = ({
      userId,
      online,
    }: {
      userId: string;
      online: boolean;
    }) => {
      // Only update if it's the participant
      if (participantName && userId !== user._id) {
        setParticipantOnline(online);
      }
    };

    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("user_status", handleUserStatus);
    };
  }, [participantName, user]);

  // Verify conversation
  const verifyConversation = useCallback(async () => {
    if (!user || !conversationId) {
      navigate("/login");
      toast.error("Please log in to view the conversation");
      return;
    }

    try {
      await dispatch(fetchMessages(conversationId)).unwrap();
      await dispatch(fetchConversationById(conversationId)).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error verifying conversation:", err);
      navigate("/conversations");
      toast.error(err.message || "Failed to load conversation");
    }
  }, [conversationId, user, navigate, dispatch]);

  useEffect(() => {
    verifyConversation();
  }, [verifyConversation]);

  // Mark unread messages as read when viewed
  const markMessagesAsRead = useCallback(() => {
    if (!conversationId || !user) return;

    currentMessages.forEach((msg) => {
      if (
        msg._id &&
        typeof msg.sender !== "string" &&
        msg.sender._id !== user._id &&
        !msg.read
      ) {
        dispatch(markMessageAsRead({ messageId: msg._id, conversationId }));
        socket.emit("mark_as_read", { messageId: msg._id });
      }
    });
  }, [currentMessages, conversationId, user, dispatch]);

  useEffect(() => {
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  // Handle real-time socket events
  useEffect(() => {
    if (!conversationId || !user) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversation !== conversationId) return;
      dispatch(addMessage({ conversationId, message }));
      if (
        typeof message.sender !== "string" &&
        message.sender._id !== user._id &&
        message._id
      ) {
        dispatch(markMessageAsRead({ messageId: message._id, conversationId }));
        socket.emit("mark_as_read", { messageId: message._id });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleConversationUpdate = (conversation: any) => {
      dispatch(updateConversation(conversation));
    };

    const handleMessageRead = ({
      messageId,
      conversationId: receivedConversationId,
    }: {
      messageId: string;
      conversationId: string;
    }) => {
      if (receivedConversationId === conversationId) {
        dispatch(markMessageReadLocally({ messageId, conversationId }));
      }
    };

    const handleUnreadCountUpdated = ({ count }: { count: number }) => {
      dispatch(setUnreadCount(count));
    };

    subscribeToMessages(handleNewMessage);
    subscribeToConversationUpdates(handleConversationUpdate);
    subscribeToMessageRead(handleMessageRead);
    socket.on("unread_count_updated", handleUnreadCountUpdated);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("conversation_updated", handleConversationUpdate);
      socket.off("message_read", handleMessageRead);
      socket.off("unread_count_updated", handleUnreadCountUpdated);
    };
  }, [dispatch, conversationId, user]);

  // Send a new message
  const handleSend = useCallback(async () => {
    if (!text.trim() || !user || !conversationId) {
      if (!text.trim()) toast.warn("Message cannot be empty");
      return;
    }

    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversation: conversationId,
      sender: user,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };

    dispatch(addMessage({ conversationId, message: optimisticMessage }));

    try {
      await dispatch(
        sendMessage({
          conversationId,
          senderId: user._id,
          text,
        })
      ).unwrap();
      setText("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(err.message || "Failed to send message");
      dispatch(
        addMessage({
          conversationId,
          message: { ...optimisticMessage, _id: undefined },
        })
      );
    }
  }, [text, user, conversationId, dispatch]);

  return (
    <div className="flex flex-col h-[85vh] bg-gray-900 rounded-xl overflow-hidden shadow-lg max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/conversations")}
            className="text-yellow-400 hover:text-yellow-300 transition"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {participantName ? `Chat with ${participantName}` : "Chat"}
            {participantName && (
              <span
                className={`h-3 w-3 rounded-full ${
                  participantOnline ? "bg-green-500" : "bg-gray-500"
                }`}
                title={participantOnline ? "Online" : "Offline"}
              ></span>
            )}
          </h2>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-gray-400 text-center">Loading messages...</p>
        ) : currentMessages.length === 0 ? (
          <p className="text-gray-400 text-center">
            No messages yet. Start the conversation!
          </p>
        ) : (
          currentMessages.map((msg) => (
            <div
              key={msg._id || `temp-${msg.createdAt}`}
              className={`flex ${
                typeof msg.sender !== "string" && msg.sender._id === user?._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  typeof msg.sender !== "string" && msg.sender._id === user?._id
                    ? "bg-yellow-500 text-gray-900"
                    : "bg-gray-700 text-white"
                } shadow-md flex items-end gap-2`}
              >
                <div>
                  <p>{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(msg.createdAt || "").toLocaleTimeString()}
                    {typeof msg.sender !== "string" &&
                      msg.sender._id === user?._id && (
                        <span className="ml-2 flex items-center space-x-[2px]">
                          <Check
                            size={12}
                            className={`${
                              msg.read ? "text-green-500" : "text-gray-500"
                            } inline-block -mr-1`}
                          />
                          <Check
                            size={12}
                            className={`${
                              msg.read ? "text-green-500" : "text-gray-500"
                            } inline-block`}
                          />
                        </span>
                      )}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-3 flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          className="p-3 rounded-full bg-green-600 hover:bg-green-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!text.trim() || loading}
          aria-label="Send message"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            <Send size={22} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
