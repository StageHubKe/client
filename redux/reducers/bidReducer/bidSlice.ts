import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:5000/api/bids";

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Gig {
  _id: string;
  eventName: string;
  budget: number;
  createdBy: User; 
  performanceDuration?: string; 
}

export interface Bid {
  _id: string;
  gig: string | Gig;
  bidder: User;
  agreedToBudget: boolean;
  proposedBudget: number;
  reason?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt?: string;
}

export interface BidState {
  bids: Bid[];
  userBids: Bid[];
  selectedBid: Bid | null;
  receivedBids: Bid[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: BidState = {
  bids: [],
  userBids: [],
  receivedBids: [],

  selectedBid: null,
  loading: false,
  error: null,
  message: null,
};

// 🟢 Place a bid
export const placeBid = createAsyncThunk<
  { bid: Bid; message: string },
  { gigId: string; agreedToBudget: boolean; proposedBudget?: number; reason?: string },
  { rejectValue: string }
>("bid/placeBid", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post<{ bid: Bid; message: string }>(
      `${API_URL}/place`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to place bid"
    );
  }
});

// 🟡 Get bids for a specific gig
export const getBidsForGig = createAsyncThunk<
  Bid[],
  string,
  { rejectValue: string }
>("bid/getBidsForGig", async (gigId, { rejectWithValue }) => {
  try {
    const res = await axios.get<{ success: boolean; bids: Bid[] }>(
      `${API_URL}/gig/${gigId}`,
      { withCredentials: true }
    );
    return res.data.bids;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch bids for gig"
    );
  }
});

// 🔵 Get all bids by logged-in user
export const getUserBids = createAsyncThunk<
  Bid[],
  void,
  { rejectValue: string }
>("bid/getUserBids", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<{ success: boolean; bids: Bid[] }>(
      `${API_URL}/my-bids`,
      { withCredentials: true }
    );
    return res.data.bids;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch user bids"
    );
  }
});

// 🟣 Update bid status
export const updateBidStatus = createAsyncThunk<
  { bid: Bid; message: string },
  { bidId: string; status: "pending" | "accepted" | "rejected" },
  { rejectValue: string }
>("bid/updateBidStatus", async ({ bidId, status }, { rejectWithValue }) => {
  try {
    const res = await axios.put<{ bid: Bid; message: string }>(
      `${API_URL}/${bidId}/status`,
      { status },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update bid status"
    );
  }
});

// 🔴 Get a single bid by ID
export const getBidById = createAsyncThunk<
  Bid,
  string,
  { rejectValue: string }
>("bid/getBidById", async (bidId, { rejectWithValue }) => {
  try {
    const res = await axios.get<{ success: boolean; bid: Bid }>(
      `${API_URL}/${bidId}`,
      { withCredentials: true }
    );
    return res.data.bid;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch bid details"
    );
  }
});

// 🔵 Get bids received on my gigs
export const getReceivedBids = createAsyncThunk<
  Bid[],
  void,
  { rejectValue: string }
>("bid/getReceivedBids", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get<{ success: boolean; bids: Bid[] }>(
      `${API_URL}/received-bids`,
      { withCredentials: true }
    );
    return res.data.bids;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch received bids"
    );
  }
});


const bidSlice = createSlice({
  name: "bid",
  initialState,
  reducers: {
    clearBidState: (state) => {
      state.error = null;
      state.message = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // PLACE BID
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(placeBid.fulfilled, (state, action: PayloadAction<{ bid: Bid; message: string }>) => {
        state.loading = false;
        state.message = action.payload.message;
        state.bids.push(action.payload.bid);
        state.userBids.push(action.payload.bid);
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // GET BIDS FOR GIG
      .addCase(getBidsForGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBidsForGig.fulfilled, (state, action: PayloadAction<Bid[]>) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(getBidsForGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // GET USER BIDS
      .addCase(getUserBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBids.fulfilled, (state, action: PayloadAction<Bid[]>) => {
        state.loading = false;
        state.userBids = action.payload;
      })
      .addCase(getUserBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // UPDATE BID STATUS
      .addCase(updateBidStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBidStatus.fulfilled, (state, action: PayloadAction<{ bid: Bid; message: string }>) => {
        state.loading = false;
        state.message = action.payload.message;
        const updatedBid = action.payload.bid;
        state.bids = state.bids.map((b) => (b._id === updatedBid._id ? updatedBid : b));
        state.userBids = state.userBids.map((b) => (b._id === updatedBid._id ? updatedBid : b));
        if (state.selectedBid?._id === updatedBid._id) {
          state.selectedBid = updatedBid;
        }
      })
      .addCase(updateBidStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // GET BID BY ID
      .addCase(getBidById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBidById.fulfilled, (state, action: PayloadAction<Bid>) => {
        state.loading = false;
        state.selectedBid = action.payload;
      })
      .addCase(getBidById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // GET RECEIVED BIDS
.addCase(getReceivedBids.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getReceivedBids.fulfilled, (state, action: PayloadAction<Bid[]>) => {
  state.loading = false;
  state.receivedBids = action.payload;
})
.addCase(getReceivedBids.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
});

  },
});

export const { clearBidState } = bidSlice.actions;
export default bidSlice.reducer;