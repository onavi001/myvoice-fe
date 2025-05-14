import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { IUser } from "../models/Users";

interface UserState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  token: Cookies.get("token") || null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      const data = await response.json();
      Cookies.set("token", data.token, { expires: 1 / 24 }); // 1 hora
      return { user: data.user, token: data.token };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const verifyUser = createAsyncThunk(
  "user/verifyUser",
  async (_, { rejectWithValue }) => {
    const token = Cookies.get("token");
    if (!token) throw new Error("No token found");

    try {
      const response = await fetch("/api/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error((await response.json()).message);
      return await response.json();
    } catch (error) {
      Cookies.remove("token");
      return rejectWithValue((error as Error).message);
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