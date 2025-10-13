import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { User } from "../../../src/types";
import type { RootState } from "../../store";

const API_URL = "http://localhost:5000/api/messages";

// Message interface
export interface Message {
  _id?: string;
  conversation: string;
  sender: User | string;
  text: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Conversation interface
export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: string;
  updatedAt?: string;
}

// Slice state
interface MessagesState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  participantNames: Record<string, string>;
}

// Initial state
const initialState: MessagesState = {
  conversations: [],
  messages: {},
  loading: false,
  error: null,
  unreadCount: 0,
  participantNames: {},
};


const handleAxiosError = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ msg?: string; message?: string }>;
    return axiosErr.response?.data?.msg || axiosErr.response?.data?.message || fallback;
  }
  return fallback;
};


// Fetch all conversations
export const fetchConversations = createAsyncThunk<
  Conversation[],
  void,
  { rejectValue: string }
>("messages/fetchConversations", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${API_URL}/conversations`, {
      withCredentials: true,
    });
    return data.conversations;
  } catch (err: unknown) {
       return rejectWithValue(handleAxiosError(err, "Failed to fetch conversations"));

  }
});

// Fetch messages for a conversation
export const fetchMessages = createAsyncThunk<
  { conversationId: string; messages: Message[] },
  string,
  { rejectValue: string }
>("messages/fetchMessages", async (conversationId, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/conversation/${conversationId}/messages`,
      {
        withCredentials: true,
      }
    );
    return { conversationId, messages: data.messages };
  } catch (err: unknown) {
      return rejectWithValue(handleAxiosError(err, "Failed to fetch messages"));

  }
});

// Send a message
export const sendMessage = createAsyncThunk<
  Message,
  { conversationId: string; senderId: string; text: string },
  { rejectValue: string }
>(
  "messages/sendMessage",
  async ({ conversationId, senderId, text }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/message`,
        { conversationId, senderId, text },
        { withCredentials: true }
      );
      return data.message;
    } catch (err: unknown) {
         return rejectWithValue(handleAxiosError(err, "Failed to send message"));

    }
  }
);

// Create a conversation with an artist
export const createConversation = createAsyncThunk<
  { conversation: Conversation },
  { artistId: string },
  { rejectValue: string }
>("messages/createConversation", async ({ artistId }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/conversation/artist`,
      { artistId },
      { withCredentials: true }
    );
    return data;
  } catch (err: unknown) {
        return rejectWithValue(handleAxiosError(err, "Failed to create conversation"));

  }
});

// Mark a message as read
export const markMessageAsRead = createAsyncThunk<
  { messageId: string; conversationId: string },
  { messageId: string; conversationId: string },
  { rejectValue: string }
>(
  "messages/markMessageAsRead",
  async ({ messageId, conversationId }, { rejectWithValue }) => {
    try {
      await axios.put(
        `${API_URL}/message/${messageId}/read`,
        {},
        { withCredentials: true }
      );
      return { messageId, conversationId };
    } catch (err: unknown) {
       return rejectWithValue(handleAxiosError(err, "Failed to mark message as read"));

    }
  }
);

// Fetch single conversation by ID
export const fetchConversationById = createAsyncThunk<
  { conversation: Conversation; participantName: string },
  string,
  { rejectValue: string; state: RootState }
>(
  "messages/fetchConversationById",
  async (conversationId, { rejectWithValue, getState }) => {
    try {
      const { data } = await axios.get(`${API_URL}/conversations`, {
        withCredentials: true,
      });
      const conversation = data.conversations.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c._id === conversationId
      );
      if (!conversation) {
        return rejectWithValue("Conversation not found");
      }

      const userId = getState().auth.user?._id;
      if (!userId) {
        return rejectWithValue("User not authenticated");
      }
      const otherParticipant = conversation.participants.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p._id !== userId
      );
      return {
        conversation,
        participantName: otherParticipant?.name || "Unknown",
      };
    } catch (err: unknown) {
          return rejectWithValue(handleAxiosError(err, "Failed to fetch conversation"));

    }
  }
);

// Fetch unread message count
export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("messages/fetchUnreadCount", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${API_URL}/unreadCount`, {
      withCredentials: true,
    });
    return data.count;
  } catch (err: unknown) {
       return rejectWithValue(handleAxiosError(err, "Failed to fetch unread count"));

  }
});

// Slice
const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{
        conversationId: string;
        message: Message;
        currentUserId?: string;
      }>
    ) => {
      const { conversationId, message, currentUserId } = action.payload;

      if (!state.messages[conversationId]) state.messages[conversationId] = [];

      // Prevent duplicates
      const exists = state.messages[conversationId].some(
        (m) =>
          m._id === message._id ||
          (m._id?.startsWith("temp-") && m.text === message.text)
      );

      if (!exists) {
        state.messages[conversationId].push(message);
      } else if (message._id && !message._id.startsWith("temp-")) {
        state.messages[conversationId] = state.messages[conversationId].map(
          (m) =>
            m._id?.startsWith("temp-") && m.text === message.text ? message : m
        );
      }

      // ✅ Increment unread count if message is from another user and unread
      if (
        typeof message.sender !== "string" &&
        message.sender._id !== currentUserId &&
        !message.read
      ) {
        state.unreadCount += 1;
      }
    },

    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const updatedConv = action.payload;
      const index = state.conversations.findIndex(
        (c) => c._id === updatedConv._id
      );
      if (index !== -1) {
        state.conversations[index] = updatedConv;
      } else {
        state.conversations.push(updatedConv);
      }
      state.conversations.sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
      );
    },
    markMessageReadLocally: (
      state,
      action: PayloadAction<{ messageId: string; conversationId: string }>
    ) => {
      const { messageId, conversationId } = action.payload;
      if (state.messages[conversationId]) {
        const message = state.messages[conversationId].find(
          (m) => m._id === messageId
        );
        if (message && !message.read) {
          state.messages[conversationId] = state.messages[conversationId].map(
            (m) => (m._id === messageId ? { ...m, read: true } : m)
          );
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setParticipantName: (
      state,
      action: PayloadAction<{ conversationId: string; name: string }>
    ) => {
      const { conversationId, name } = action.payload;
      state.participantNames[conversationId] = name;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch conversations";
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const message = action.payload;
        const conversationId = message.conversation;
        if (!state.messages[conversationId])
          state.messages[conversationId] = [];
        const exists = state.messages[conversationId].some(
          (m) =>
            m._id === message._id ||
            (m._id?.startsWith("temp-") && m.text === message.text)
        );
        if (!exists) {
          state.messages[conversationId].push(message);
        } else {
          state.messages[conversationId] = state.messages[conversationId].map(
            (m) =>
              m._id?.startsWith("temp-") && m.text === message.text
                ? message
                : m
          );
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send message";
      })
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        const { conversation } = action.payload;
        const index = state.conversations.findIndex(
          (c) => c._id === conversation._id
        );
        if (index === -1) state.conversations.push(conversation);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create conversation";
      })
      .addCase(markMessageAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const { messageId, conversationId } = action.payload;
        if (state.messages[conversationId]) {
          const message = state.messages[conversationId].find(
            (m) => m._id === messageId
          );
          if (message && !message.read) {
            state.messages[conversationId] = state.messages[conversationId].map(
              (m) => (m._id === messageId ? { ...m, read: true } : m)
            );
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to mark message as read";
      })
      .addCase(fetchConversationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.loading = false;
        const { conversation, participantName } = action.payload;
        const index = state.conversations.findIndex(
          (c) => c._id === conversation._id
        );
        if (index !== -1) {
          state.conversations[index] = conversation;
        } else {
          state.conversations.push(conversation);
        }
        state.participantNames[conversation._id] = participantName;
      })
      .addCase(fetchConversationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch conversation";
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch unread count";
      });
  },
});

export const {
  addMessage,
  updateConversation,
  markMessageReadLocally,
  setUnreadCount,
  setParticipantName,
} = messageSlice.actions;
export default messageSlice.reducer;


