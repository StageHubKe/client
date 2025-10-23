import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

export interface User {
   _id: string;     
  id?: string;  
  name: string;
  email: string;
  picture?: string;
  authProvider?: string;
}


interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Register
export const registerUser = createAsyncThunk<
  { message: string },
  RegisterData,
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<{ message: string }>(
      `${API_URL}/register`,
      userData
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Registration failed"
    );
  }
});

// ✅ Login
export const loginUser = createAsyncThunk<
  { user: User; message: string },
  LoginData,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<{ user: User; message: string }>(
      `${API_URL}/login`,
      credentials,
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

// ✅ Fetch Current User
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get<{ user: User }>(`${API_URL}/me`, {
      withCredentials: true,
    });
    return data.user;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch user"
    );
  }
});

// ✅ Logout
export const logoutUser = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<{ message: string }>(
      `${API_URL}/logout`,
      {},
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(err.response?.data?.message || "Logout failed");
  }
});

// ✅ Forgot Password
export const forgotPassword = createAsyncThunk<
  { message: string },
  ForgotPasswordData,
  { rejectValue: string }
>("auth/forgotPassword", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<{ message: string }>(
      `${API_URL}/forgot-password`,
      userData
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to send reset email"
    );
  }
});

// ✅ Reset Password
export const resetPassword = createAsyncThunk<
  { message: string },
  ResetPasswordData,
  { rejectValue: string }
>("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<{ message: string }>(
      `${API_URL}/reset-password/${token}`,
      { password }
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Failed to reset password"
    );
  }
});

// ✅ Google Login
export const googleLogin = createAsyncThunk<
  { user: User; message: string },
  { credential: string },
  { rejectValue: string }
>("auth/googleLogin", async ({ credential }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<{ user: User; message: string }>(
      `${API_URL}/google`,
      { credential },
      { withCredentials: true }
    );
    return data;
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      err.response?.data?.message || "Google login failed"
    );
  }
});

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  success: false,
  message: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      // ✅ Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      // ✅ Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user";
      })

      // ✅ Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.success = false;
        state.message = "Logged out successfully";
      })

      // ✅ Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send reset link";
      })

      // ✅ Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to reset password";
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Google login failed";
      });
  },
});

export const { clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;
