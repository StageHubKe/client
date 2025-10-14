import { io, Socket } from "socket.io-client";
import type { Message } from "../redux/reducers/messageReducer/messageSlice";
import { toast } from "react-toastify";
import axios from "axios";

const SOCKET_URL = "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  text: string;
}

export const subscribeToMessages = (callback: (message: Message) => void) => {
  socket.on("receive_message", callback);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const subscribeToConversationUpdates = (callback: (conversation: any) => void) => {
  socket.on("conversation_updated", callback);
};

export const subscribeToMessageRead = (callback: (data: { messageId: string; conversationId: string }) => void) => {
  socket.on("message_read", callback);
};

export const subscribeToMessageUpdated = (callback: (message: Message) => void) => {
  socket.on("message_updated", callback);
};

export const subscribeToMessageDeleted = (callback: (data: { messageId: string; conversationId: string }) => void) => {
  socket.on("message_deleted", callback);
};

export const subscribeToConversationDeleted = (callback: (data: { conversationId: string }) => void) => {
  socket.on("conversation_deleted", callback);
};

export const sendMessage = (message: SendMessagePayload) => {
  socket.emit("send_message", message);
};

export const markMessageAsRead = (messageId: string) => {
  socket.emit("mark_as_read", { messageId });
};

export const editMessage = (messageId: string, text: string) => {
  socket.emit("edit_message", { messageId, text });
};

export const deleteMessage = (messageId: string, conversationId: string) => {
  socket.emit("delete_message", { messageId, conversationId });
};

export const deleteConversation = (conversationId: string) => {
  socket.emit("delete_conversation", { conversationId });
};

socket.on("connect", async () => {
  console.log("✅ Socket connected:", socket.id);
  try {
    const response = await axios.get("http://localhost:5000/api/auth/me", {
      withCredentials: true,
    });
    const userId = response.data.user._id;
    if (userId) {
      socket.emit("user_connected", userId);
    } else {
      console.error("No userId found in /api/auth/me response");
      toast.error("Failed to authenticate socket connection");
    }
  } catch (err) {
    console.error("Error fetching userId for socket:", err);
    toast.error("Failed to authenticate socket connection");
  }
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err);
  toast.error("Socket connection failed");
});