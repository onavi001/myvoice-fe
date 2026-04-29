import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { IUser } from "../models/Users";
import { apiClient, ApiError } from "../utils/apiClient";
export interface ProfileUpdateData {
  username: string;
  email: string;
  password?: string;
  oldPassword?: string;
  bio?: string;
  goals?: string;
  notes?: string;
}
interface UserState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface ThunkError {
  message: string;
  status?: number;
}

const initialState: UserState = {
  user: null,
  token: Cookies.get("token") || null,
  loading: false,
  error: null,
};

const toThunkError = (error: unknown, fallbackMessage: string): ThunkError => {
  const apiError = error as ApiError;
  return {
    message: apiError?.message || fallbackMessage,
    status: apiError?.status,
  };
};

export const registerUser = createAsyncThunk<unknown, { username: string; email: string; password: string }, { rejectValue: string }>(
  "user/registerUser",
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await apiClient<unknown>("/api/users", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
    } catch (error) {
      return rejectWithValue((error as ApiError)?.message || "Error al registrar usuario");
    }
  }
);

export const loginUser = createAsyncThunk<
  { user: IUser; token: string },
  { email: string; password: string },
  { rejectValue: string }
>(
  "user/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiClient<{ token: string; user: IUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      Cookies.set("token", data.token, { expires: 1 / 24 }); // 1 hora
      return { user: data.user, token: data.token };
    } catch (error) {
      return rejectWithValue((error as ApiError)?.message || "Error en login");
    }
  }
);

export const verifyUser = createAsyncThunk<{ user: IUser }, void, { rejectValue: string }>(
  "user/verifyUser",
  async (_, { rejectWithValue }) => {
    const token = Cookies.get("token");
    if (!token) throw new Error("No token found");

    try {
      return await apiClient<{ user: IUser }>("/api/auth/verify", {
        method: "GET",
      });
    } catch (error) {
      Cookies.remove("token");
      return rejectWithValue((error as ApiError)?.message || "Error al verificar sesión");
    }
  }
);

export const updateProfile = createAsyncThunk<IUser, ProfileUpdateData, { rejectValue: ThunkError }>(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      return await apiClient<IUser>(`/api/profile`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al actualizar perfil"));
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: IUser; token: string } | null>) {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        Cookies.set("token", action.payload.token, { expires: 1 / 24 });
      } else {
        state.user = null;
        state.token = null;
        Cookies.remove("token");
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      Cookies.remove("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as ThunkError | undefined)?.message || "Error al actualizar el perfil";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: IUser; token: string }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action: PayloadAction<{ user: IUser }>) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;