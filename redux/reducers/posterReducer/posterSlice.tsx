import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:5000/api/gigposter";

export interface Poster {
  status: string;
  _id?: string;
  eventType: string;
  artistCategory: string;
  instrumentsProvided?: boolean;
  performerEquipment?: string;
  guestCount: number;
  venueAddress: string;
  eventName: string;
  eventDescription: string;
  performanceDuration: string;
  planningStage: string;
  budget: number;
  eventPlannerName: string;
  contactInfo: string;
  eventDate: string;
  posterImage?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PosterState {
  posters: Poster[];
  poster: Poster | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PosterState = {
  posters: [],
  poster: null,
  loading: false,
  error: null,
  success: false,
};

// ✅ CREATE gig poster
export const createPoster = createAsyncThunk<
  Poster,
  Poster,
  { rejectValue: string }
>("poster/createPoster", async (posterData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_URL}/create`, posterData, {
      withCredentials: true,
    });
    return res.data.gig;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to create gig poster"
    );
  }
});

// ✅ FETCH all gig posters
export const fetchAllPosters = createAsyncThunk<
  Poster[],
  void,
  { rejectValue: string }
>("poster/fetchAllPosters", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(API_URL);
    return res.data.gigs;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch gig posters"
    );
  }
});

// ✅ FETCH single gig poster
export const fetchPosterById = createAsyncThunk<
  Poster,
  string,
  { rejectValue: string }
>("poster/fetchPosterById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data.gig;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch poster details"
    );
  }
});

// ✅ UPDATE poster status
export const updatePosterStatus = createAsyncThunk<
  Poster,
  { id: string; status: "active" | "filled" },
  { rejectValue: string }
>("poster/updatePosterStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await axios.patch(
      `${API_URL}/status/${id}`,
      { status },
      { withCredentials: true }
    );
    return res.data.gig;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update status"
    );
  }
});

// ✅ UPDATE entire gig poster
export const updatePoster = createAsyncThunk<
  Poster,
  { id: string; data: Partial<Poster> },
  { rejectValue: string }
>("poster/updatePoster", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_URL}/updatePoster/${id}`, data, {
      withCredentials: true,
    });
    return res.data.updateGig;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update poster"
    );
  }
});

// ✅ DELETE gig poster
export const deletePoster = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("poster/deletePoster", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/deletePoster/${id}`, {
      withCredentials: true,
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete poster"
    );
  }
});

// ✅ SLICE
const posterSlice = createSlice({
  name: "poster",
  initialState,
  reducers: {
    clearPosterState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createPoster.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPoster.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.posters.unshift(action.payload);
      })
      .addCase(createPoster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating poster";
      })

      // FETCH ALL
      .addCase(fetchAllPosters.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPosters.fulfilled, (state, action) => {
        state.loading = false;
        state.posters = action.payload;
      })
      .addCase(fetchAllPosters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching posters";
      })

      // FETCH BY ID
      .addCase(fetchPosterById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosterById.fulfilled, (state, action) => {
        state.loading = false;
        state.poster = action.payload;
      })
      .addCase(fetchPosterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching poster";
      })

      // UPDATE STATUS
      .addCase(updatePosterStatus.fulfilled, (state, action) => {
        const index = state.posters.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.posters[index] = action.payload;
      })

      // UPDATE POSTER
      .addCase(updatePoster.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePoster.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.posters.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) state.posters[index] = action.payload;
      })
      .addCase(updatePoster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error updating poster";
      })

      // DELETE POSTER
      .addCase(deletePoster.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePoster.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.posters = state.posters.filter((p) => p._id !== action.payload);
      })
      .addCase(deletePoster.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error deleting poster";
      });
  },
});

export const { clearPosterState } = posterSlice.actions;
export default posterSlice.reducer;
