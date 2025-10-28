import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

export interface Call {
  _id: string;
  caller: string;
  receiver: string;
  conversation: string;
  sessionId?: string;
  status: "initiated" | "accepted" | "rejected" | "ended";
  createdAt?: string;
  endTime?: string;
}

interface CallState {
  currentCall: Call | null;
  incomingCall: Call | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: CallState = {
  currentCall: null,
  incomingCall: null,
  loading: false,
  error: null,
  success: false,
};

const API_URL = "http://localhost:5000/api/calls";

// ✅ Initiate a new call
export const initiateCall = createAsyncThunk<
  Call,
  { receiverId: string; conversationId: string },
  { rejectValue: string }
>("call/initiateCall", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/initiate`, data, {
      withCredentials: true,
    });
    return res.data.call as Call;
  } catch (error) {
    const err = error as AxiosError<{ msg?: string }>;
    return rejectWithValue(err.response?.data?.msg || "Failed to initiate call");
  }
});

// ✅ Update call status (accept/reject)
export const updateCallStatus = createAsyncThunk<
  Call,
  { callId: string; status: string },
  { rejectValue: string }
>("call/updateCallStatus", async ({ callId, status }, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `${API_URL}/status/${callId}`,
      { status },
      { withCredentials: true }
    );
    return res.data.call as Call;
  } catch (error) {
    const err = error as AxiosError<{ msg?: string }>;
    return rejectWithValue(
      err.response?.data?.msg || "Failed to update call status"
    );
  }
});

// ✅ End the call
export const endCall = createAsyncThunk<
  Call,
  { callId: string },
  { rejectValue: string }
>("call/endCall", async ({ callId }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_URL}/${callId}/end`, {}, {
      withCredentials: true,
    });
    return res.data.call as Call;
  } catch (error) {
    const err = error as AxiosError<{ msg?: string }>;
    return rejectWithValue(err.response?.data?.msg || "Failed to end call");
  }
});

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setIncomingCall: (state, action: PayloadAction<Call | null>) => {
      state.incomingCall = action.payload;
    },
    setCurrentCall: (state, action: PayloadAction<Call | null>) => {
      state.currentCall = action.payload;
    },
    clearCallState: (state) => {
      state.currentCall = null;
      state.incomingCall = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate Call
      .addCase(initiateCall.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(initiateCall.fulfilled, (state, action) => {
  state.loading = false;
  state.currentCall = {
    ...action.payload,
    sessionId: action.payload.sessionId,
  };
  state.success = true;
})
      .addCase(initiateCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error initiating call";
      })
      // Update Call Status
      .addCase(updateCallStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCallStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCall = action.payload;
        state.success = true;
      })
      .addCase(updateCallStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error updating call status";
      })
      // End Call
      .addCase(endCall.pending, (state) => {
        state.loading = true;
      })
      .addCase(endCall.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCall = action.payload;
        state.success = true;
      })
      .addCase(endCall.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error ending call";
      });
  },
});

export const { setIncomingCall, setCurrentCall, clearCallState } =
  callSlice.actions;
export default callSlice.reducer;