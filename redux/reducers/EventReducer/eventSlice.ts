import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:5000/api/events";

export interface Event {
  _id?: string;
  title: string;
  description: string;
  eventType?: "concert" | "festival" | "exhibition" | "party" | "other";
  location: string;
  date: string; // ISO string
  image?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// 🎯 Create new event
export const createEvent = createAsyncThunk<
  Event,
  Event, 
  { rejectValue: string }
>("events/createEvent", async (eventData, { rejectWithValue }) => {
  try {
    const response = await axios.post<{ event: Event }>(API_URL, eventData, {
      withCredentials: true,
    });
    return response.data.event;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to create event");
  }
});

// 📦 Get all events
export const getAllEvents = createAsyncThunk<
  Event[], 
  void,
  { rejectValue: string }
>("events/getAllEvents", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<{ events: Event[] }>(API_URL);
    return response.data.events;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to fetch events");
  }
});

// 🔍 Get single event
export const getEventById = createAsyncThunk<
  Event,
  string,
  { rejectValue: string }
>("events/getEventById", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<{ event: Event }>(`${API_URL}/${id}`);
    return response.data.event;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to fetch event");
  }
});

// ✏️ Update event
export const updateEvent = createAsyncThunk<
  Event,
  { id: string; updatedData: Partial<Event> },
  { rejectValue: string }
>("events/updateEvent", async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const response = await axios.put<{ event: Event }>(
      `${API_URL}/update/${id}`,
      updatedData,
      { withCredentials: true }
    );
    return response.data.event;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to update event");
  }
});

// 🗑️ Delete event
export const deleteEvent = createAsyncThunk<
  string, 
  string, 
  { rejectValue: string }
>("events/deleteEvent", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
    return id;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || "Failed to delete event");
  }
});

interface EventState {
  events: Event[];
  singleEvent: Event | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: EventState = {
  events: [],
  singleEvent: null,
  loading: false,
  error: null,
  success: false,
};

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE EVENT
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false;
        state.success = true;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create event";
      })

      // GET ALL
      .addCase(getAllEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllEvents.fulfilled, (state, action: PayloadAction<Event[]>) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(getAllEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch events";
      })

      // GET ONE
      .addCase(getEventById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false;
        state.singleEvent = action.payload;
      })
      .addCase(getEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch event";
      })

      // UPDATE
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.loading = false;
        state.success = true;
        const index = state.events.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.events[index] = action.payload;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update event";
      })

      // DELETE
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.success = true;
        state.events = state.events.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to delete event";
      });
  },
});

export const { clearEventState } = eventSlice.actions;
export default eventSlice.reducer;
