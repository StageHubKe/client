// src/redux/slices/meetSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/meets";

export const createMeet = createAsyncThunk(
  "meet/createMeet",
  async (
    meetData: { topic?: string; startTime?: string; endTime?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post(`${API_URL}/create`, meetData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // ✅ important: send cookies automatically
      });
      return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.log(err);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

interface MeetState {
  loading: boolean;
  success: boolean;
  meetLink?: string;
  error?: string;
}

const initialState: MeetState = {
  loading: false,
  success: false,
};

const meetSlice = createSlice({
  name: "meet",
  initialState,
  reducers: {
    resetMeet: (state) => {
      state.loading = false;
      state.success = false;
      state.meetLink = undefined;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createMeet.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = undefined;
      })
      .addCase(createMeet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.meetLink = action.payload.meetLink;
      })
      .addCase(createMeet.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetMeet } = meetSlice.actions;
export default meetSlice.reducer;
