// ✅ artistSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:5000/api/artistProfile";

// ✅ Types
export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

export interface Pricing {
  minRate?: number;
  maxRate?: number;
  currency?: string;
}

// ✅ Full artist object
export interface ArtistProfile {
  _id: string;
  user:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
      };
  stageName: string;
  genre: string;
  type: string;
  bio: string;
  experienceYears: number;
  location: string;
  socialLinks?: SocialLinks;
  videos?: { url: string; title?: string; description?: string }[];
  coverImage?: string;
  availability: "available" | "booked" | "unavailable";
  pricing?: Pricing;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

// ✅ Fields for creating profile
export interface NewArtistProfileInput {
  user: string;
  stageName: string;
  genre: string;
  type: string;
  bio: string;
  experienceYears: number;
  location: string;
  socialLinks?: SocialLinks;
  pricing?: Pricing;
  videos?: { url: string; title?: string; description?: string }[];
  coverImage?: string;
  availability?: "available" | "booked" | "unavailable";
}

interface ArtistProfileState {
  profile: ArtistProfile | null;
  allProfiles: ArtistProfile[];
   searchTerm: string;
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ArtistProfileState = {
  profile: null,
  allProfiles: [],
  searchTerm: "",
  loading: false,
  success: false,
  error: null,
};

// ✅ Create
export const createArtistProfile = createAsyncThunk<
  ArtistProfile,
  NewArtistProfileInput,
  { rejectValue: string }
>("artistProfile/create", async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/createArtistProfile`,
      profileData
    );
    return data.profile as ArtistProfile;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Error creating profile"
    );
  }
});

// ✅ Get by ID
export const getArtistProfileById = createAsyncThunk<
  ArtistProfile,
  string,
  { rejectValue: string }
>("artistProfile/getById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${API_URL}/getArtistProfileById/${id}`);
    return data.profile as ArtistProfile;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Error fetching artist profile"
    );
  }
});

// ✅ Update artist profile
export const updateArtistProfile = createAsyncThunk<
  ArtistProfile,
  Partial<ArtistProfile>,
  { rejectValue: string }
>("artistProfile/update", async (updatedData, { rejectWithValue }) => {
  try {
    const { data } = await axios.put(
      `${API_URL}/updateArtistProfile`,
      updatedData
    );
    return data.profile as ArtistProfile;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Error updating profile"
    );
  }
});

// ✅ Get all
export const getAllArtistProfiles = createAsyncThunk<
  ArtistProfile[],
  void,
  { rejectValue: string }
>("artistProfile/getAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${API_URL}/getAllArtistProfiles`);
    return Array.isArray(data.profiles) ? data.profiles : [];
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Error fetching artist profiles"
    );
  }
});

// ✅ Delete artist profile
export const deleteArtistProfile = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: string }
>("artistProfile/delete", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axios.delete(`${API_URL}/deleteArtistProfile/${id}`);
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Error deleting artist profile"
    );
  }
});

export const getArtistProfileByUserId = createAsyncThunk<
  ArtistProfile,
  string,
  { rejectValue: string }
>("artistProfile/getByUserId", async (userId, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/getArtistProfileByUserId/${userId}`
    );
    return data.profile as ArtistProfile;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message ||
        "Error fetching artist profile by user ID"
    );
  }
});


// ✅ Slice
const artistProfileSlice = createSlice({
  name: "artistProfile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.success = false;
    },
     setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createArtistProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        createArtistProfile.fulfilled,
        (state, action: PayloadAction<ArtistProfile>) => {
          state.loading = false;
          state.success = true;
          state.profile = action.payload;
        }
      )
      .addCase(createArtistProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create profile";
      })
      .addCase(getAllArtistProfiles.fulfilled, (state, action) => {
        state.allProfiles = action.payload;
      })
      .addCase(getArtistProfileById.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateArtistProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateArtistProfile.fulfilled,
        (state, action: PayloadAction<ArtistProfile>) => {
          state.loading = false;
          state.success = true;
          state.profile = action.payload;
        }
      )
      .addCase(updateArtistProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update profile";
      })
      .addCase(deleteArtistProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteArtistProfile.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.profile = null;
      })
      .addCase(deleteArtistProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete profile";
      })
      .addCase(getArtistProfileByUserId.fulfilled, (state, action) => {
  state.profile = action.payload;
})

  },
});

export const { clearProfile, setSearchTerm } = artistProfileSlice.actions;
export default artistProfileSlice.reducer;
