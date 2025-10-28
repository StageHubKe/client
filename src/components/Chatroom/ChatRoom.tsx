import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MoreVertical, Send, Smile } from "lucide-react";
import { toast } from "react-toastify";
import EmojiPicker, {
  type EmojiClickData,
  Theme,
  EmojiStyle,
} from "emoji-picker-react";

import {
  socket,
  subscribeToMessages,
  subscribeToConversationUpdates,
  subscribeToMessageRead,
} from "../../socket";

import {
  addMessage,
  fetchMessages,
  fetchConversationById,
  markMessageAsRead,
  markMessageReadLocally,
  sendMessage,
  setUnreadCount,
  updateConversation,
  deleteMessage,
  updateMessage,
  type Message,
} from "../../../redux/reducers/messageReducer/messageSlice";

import type { AppDispatch, RootState } from "../../../redux/store";
import type { User } from "../../types";
import { fetchCurrentUser } from "../../../redux/reducers/authReducer/authSlice";
import {
  createMeet,
  resetMeet,
} from "../../../redux/reducers/meetReducer/meetSlice";

const ChatRoom: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [participantOnline, setParticipantOnline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const { messages, loading, error, participantNames } = useSelector(
    (state: RootState) => state.messages
  );
  const { loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );

  const { meetLink, error: meetError } = useSelector(
    (state: RootState) => state.meet
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentMessages = conversationId ? messages[conversationId] || [] : [];
  const participantName = conversationId
    ? participantNames[conversationId] || "Chat"
    : "Chat";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (meetError) {
      toast.error(meetError);
      dispatch(resetMeet());
    }
  }, [meetError, dispatch]);

  useEffect(() => {
    if (!user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (!user || !conversationId) return;

    const loadConversation = async () => {
      try {
        if (!messages[conversationId]) {
          await dispatch(fetchMessages(conversationId)).unwrap();
        }
        await dispatch(fetchConversationById(conversationId)).unwrap();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Failed to load conversation:", err);
        toast.error("Failed to load conversation");
        navigate("/conversations");
      }
    };

    loadConversation();
  }, [dispatch, user, conversationId, messages, navigate]);
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
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
    if (!conversationId || !user) return;

    const handleUserStatus = ({
      userId,
      online,
    }: {
      userId: string;
      online: boolean;
    }) => {
      if (userId !== user._id) setParticipantOnline(online);
    };

    socket.on("user_status", handleUserStatus);
  }, [conversationId, user]);
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
    const handleConversationUpdate = (conversation: any) =>
      dispatch(updateConversation(conversation));

    const handleMessageRead = ({
      messageId,
      conversationId: receivedId,
    }: {
      messageId: string;
      conversationId: string;
    }) => {
      if (receivedId === conversationId)
        dispatch(markMessageReadLocally({ messageId, conversationId }));
    };

    const handleUnreadCountUpdated = ({ count }: { count: number }) =>
      dispatch(setUnreadCount(count));

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

  const handleSend = useCallback(async () => {
    if (!text.trim() || !user || !conversationId) {
      toast.warn("Message cannot be empty");
      return;
    }

    if (editingMessageId) {
      try {
        await dispatch(
          updateMessage({
            messageId: editingMessageId,
            conversationId,
            newText: text,
          })
        ).unwrap();
        toast.success("Message updated");
        setEditingMessageId(null);
        setText("");
        return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err.message || "Failed to update message");
      }
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
        sendMessage({ conversationId, senderId: user._id, text })
      ).unwrap();
      setText("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(err.message || "Failed to send message");
    }
  }, [text, user, conversationId, editingMessageId, dispatch]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!conversationId) return;
    if (!window.confirm("Delete this message?")) return;

    try {
      await dispatch(deleteMessage({ messageId, conversationId })).unwrap();
      toast.success("Message deleted");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Failed to delete message");
    }
  };

  const handleEditMessage = (msg: Message) => {
    setText(msg.text);
    setEditingMessageId(msg._id ?? null);
  };

  if (authLoading)
    return (
      <p className="text-center mt-10 text-blue-500">Loading user info...</p>
    );
  if (!user)
    return (
      <p className="text-center mt-10 text-red-500">
        Please log in to view this chat.
      </p>
    );

  return (
    <div className="flex flex-col h-screen sm:h-[90vh] md:h-[85vh] bg-gray-900 rounded-none sm:rounded-xl overflow-hidden shadow-lg w-full max-w-[100vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto sm:my-4">
      <div className="flex items-center justify-between bg-gray-800 p-3 sm:p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/conversations")}
            className="text-white hover:text-gray-300 transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {`Chat with ${participantName}`}
            <span
              className={`h-3 w-3 rounded-full ${
                participantOnline ? "bg-green-500" : "bg-gray-500"
              }`}
              title={participantOnline ? "Online" : "Offline"}
            ></span>
          </h2>
        </div>

        <button
          onClick={async () => {
            if (!conversationId) return;
            try {
              await dispatch(
                createMeet({ topic: `Chat with ${participantName}` })
              ).unwrap();
              if (meetLink) {
                await dispatch(
                  sendMessage({
                    conversationId,
                    senderId: user!._id,
                    text: `Join the Google Meet: ${meetLink}`,
                  })
                ).unwrap();
                toast.success("Google Meet created and shared!");
                dispatch(resetMeet());
              }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
              console.log("Error creating google meet:", err);
              toast.error(err.message || "Failed to create Google Meet");
            }
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-400 hover:to-indigo-500 transition-all duration-300"
          title="Start a Google Meet video call"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h7a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
            />
          </svg>
          <span className="hidden sm:inline font-medium">Create Meet</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-950 via-gray-900 to-black">
        {loading ? (
          <p className="text-gray-400 text-center">Loading messages...</p>
        ) : currentMessages.length === 0 ? (
          <p className="text-gray-400 text-center">
            No messages yet. Start the conversation!
          </p>
        ) : (
          currentMessages.map((msg) => {
            const isSender =
              typeof msg.sender !== "string" && msg.sender._id === user._id;
            return (
              <div
                key={msg._id || `temp-${msg.createdAt}`}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative px-4 py-2 rounded-2xl max-w-[75%] sm:max-w-[60%] lg:max-w-[50%] shadow-md group ${
                    isSender
                      ? "bg-white text-gray-900"
                      : "bg-gray-800 text-gray-100"
                  }`}
                >
                  <p className="break-words leading-relaxed">
                    {msg.text.split(" ").map((word, i) => {
                      // Detect links
                      const isLink = /^https?:\/\/[^\s]+$/.test(word);
                      return isLink ? (
                        <a
                          key={i}
                          href={word}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 font-medium underline hover:text-blue-300 break-words"
                        >
                          {word}
                        </a>
                      ) : (
                        <span key={i}> {word} </span>
                      );
                    })}
                  </p>

                  <div className="flex items-center justify-end mt-1 space-x-1 text-xs text-gray-600">
                    <span
                      className={`${
                        isSender ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.createdAt || "").toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isSender && (
                      <span className="flex items-center ml-1">
                        <Check
                          size={12}
                          className={`${
                            msg.read ? "text-green-500" : "text-gray-500"
                          } inline-block -mr-[2px]`}
                        />
                        <Check
                          size={12}
                          className={`${
                            msg.read ? "text-green-500" : "text-gray-500"
                          } inline-block`}
                        />
                      </span>
                    )}
                  </div>

                  {isSender && (
                    <div className="absolute top-1 right-1">
                      <button
                        onClick={() =>
                          setMenuOpen((prev) =>
                            prev === msg._id ? null : msg._id ?? null
                          )
                        }
                        className="text-gray-700 hover:text-gray-900  transition p-1 rounded-full"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === msg._id && (
                        <div className="absolute right-0 mt-1 w-28 bg-gray-800 rounded-lg shadow-lg text-sm z-50">
                          <button
                            onClick={() => {
                              setMenuOpen(null);
                              handleEditMessage(msg);
                            }}
                            className="block w-full text-left px-3 py-2 text-gray-200 hover:bg-gray-700 rounded-t-lg"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpen(null);
                              handleDeleteMessage(msg._id!);
                            }}
                            className="block w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 rounded-b-lg"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative border-t border-gray-700 p-3 flex items-center gap-3">
        {editingMessageId && (
          <div className="text-xs text-yellow-400 absolute -top-4 left-5">
            Editing message — press Send to update or clear text to cancel
          </div>
        )}

        {/* Emoji */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-700 text-white transition"
            aria-label="Add emoji"
          >
            <Smile size={22} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                theme={Theme.DARK}
                emojiStyle={EmojiStyle.APPLE}
                onEmojiClick={(emojiData: EmojiClickData) => {
                  setText((prev) => prev + emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-white"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || loading}
          className="p-3 rounded-full bg-green-600 hover:bg-green-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
