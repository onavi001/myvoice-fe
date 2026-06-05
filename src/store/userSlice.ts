import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { IUser } from "../models/Users";
import { apiClient, ApiError } from "../utils/apiClient";
import type { RootState } from "./index";

const AUTH_TOKEN_KEY = "token";
const USER_CACHE_KEY = "mv_user_session";
export const VERIFY_RATE_LIMIT = "RATE_LIMIT";

const readToken = () => Cookies.get(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY) || null;

const readCachedUser = (): IUser | null => {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as IUser) : null;
  } catch {
    return null;
  }
};

const persistUserCache = (user: IUser | null) => {
  if (!user) {
    sessionStorage.removeItem(USER_CACHE_KEY);
    return;
  }
  sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
};

const persistToken = (token: string) => {
  Cookies.set(AUTH_TOKEN_KEY, token, { expires: 7 });
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const clearPersistedToken = () => {
  Cookies.remove(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

let verifyInFlight: Promise<{ user: IUser }> | null = null;
let lastVerifyStartedAt = 0;
const VERIFY_DEBOUNCE_MS = 15_000;

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
  user: readCachedUser(),
  token: readToken(),
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
      persistToken(data.token);
      persistUserCache(data.user);
      return { user: data.user, token: data.token };
    } catch (error) {
      return rejectWithValue((error as ApiError)?.message || "Error en login");
    }
  }
);

export const verifyUser = createAsyncThunk<
  { user: IUser },
  void,
  { rejectValue: string; state: RootState }
>(
  "user/verifyUser",
  async (_, { rejectWithValue }) => {
    const token = readToken();
    if (!token) return rejectWithValue("No token found");

    const runVerify = () =>
      apiClient<{ user: IUser }>("/api/auth/verify", {
        method: "GET",
      });

    lastVerifyStartedAt = Date.now();

    if (!verifyInFlight) {
      verifyInFlight = runVerify().finally(() => {
        verifyInFlight = null;
      });
    }

    try {
      const result = await verifyInFlight;
      persistUserCache(result.user);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 429) {
        return rejectWithValue(VERIFY_RATE_LIMIT);
      }
      if (apiError.status === 401 || apiError.status === 403) {
        clearPersistedToken();
        persistUserCache(null);
      }
      return rejectWithValue(apiError?.message || "Error al verificar sesión");
    }
  },
  {
    condition: (_, { getState }) => {
      if (!readToken()) return false;
      if (verifyInFlight) return false;
      if (Date.now() - lastVerifyStartedAt < VERIFY_DEBOUNCE_MS) return false;
      if (getState().user.loading) return false;
      return true;
    },
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
        persistToken(action.payload.token);
        persistUserCache(action.payload.user);
      } else {
        state.user = null;
        state.token = null;
        clearPersistedToken();
        persistUserCache(null);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      clearPersistedToken();
      persistUserCache(null);
    },
    clearUserCoachLink(state) {
      if (!state.user) return;
      state.user = { ...state.user, coachId: undefined };
      persistUserCache(state.user);
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
        state.user = { ...state.user, ...action.payload } as IUser;
        if (state.user) persistUserCache(state.user);
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
        if (action.payload === VERIFY_RATE_LIMIT) {
          state.error = null;
          if (!state.user) {
            state.user = readCachedUser();
          }
          return;
        }
        if (action.payload === "No token found") {
          state.user = null;
          state.token = null;
          return;
        }
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
        clearPersistedToken();
        persistUserCache(null);
      });
  },
});

export const { setUser, logout, clearUserCoachLink } = userSlice.actions;
export default userSlice.reducer;
