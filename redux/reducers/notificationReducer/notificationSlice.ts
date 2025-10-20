import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:5000/api/notifications";

export interface Notification {
  _id: string;
  recipient: string;
  message: string;
  bidderId?: string;
  bidderName?: string;
  gigId?: string;
  type: "bid" | "message";
  read: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
};

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>("notifications/fetchNotifications", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(API_URL, { withCredentials: true });
    return res.data.notifications;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch notifications"
    );
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: { payload: Notification }) => {
      state.notifications.unshift(action.payload);
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching notifications";
      });
  },
});

export const { addNotification, clearNotificationError } =
  notificationSlice.actions;
export default notificationSlice.reducer;