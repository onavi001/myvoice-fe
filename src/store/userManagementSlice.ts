import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { IUser } from "../models/Users";
import { RootState } from ".";
import { apiClient, ApiError } from "../utils/apiClient";

export interface ThunkError {
  message: string;
  status?: number;
}

interface IAdminCoachRequest {
  _id: string;
  userId: IUser;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface UserManagementState {
  users: IUser[];
  requests: IAdminCoachRequest[];
  userCoachRequest: IAdminCoachRequest | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserManagementState = {
  users: [],
  requests: [],
  userCoachRequest: null,
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

export const fetchUsers = createAsyncThunk<IUser[], void, { rejectValue: ThunkError }>(
  "userManagement/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient<IUser[]>("/api/admin/users", {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching users"));
    }
  }
);

export const updateUser = createAsyncThunk<
  IUser,
  { userId: string; updatedUser: Partial<IUser> },
  { rejectValue: ThunkError }
>(
  "userManagement/updateUser",
  async ({ userId, updatedUser }, { rejectWithValue }) => {
    try {
      return await apiClient<IUser>(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error updating user"));
    }
  }
);

export const fetchCoachRequests = createAsyncThunk<IAdminCoachRequest[], void, { rejectValue: ThunkError }>(
  "userManagement/fetchCoachRequests",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient<IAdminCoachRequest[]>("/api/admin/coach-requests", {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching requests"));
    }
  }
);

export const fetchUserCoachRequest = createAsyncThunk<IAdminCoachRequest | null, void, { rejectValue: ThunkError }>(
  "userManagement/fetchUserCoachRequest",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient<IAdminCoachRequest | null>("/api/admin/user", {
        method: "GET",
      });
      return data || null;
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching user request"));
    }
  }
);

export const createCoachRequest = createAsyncThunk<IAdminCoachRequest, { message: string }, { rejectValue: ThunkError }>(
  "userManagement/createCoachRequest",
  async ({ message }, { rejectWithValue }) => {
    try {
      return await apiClient<IAdminCoachRequest>("/api/admin/coach-requests", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error creating request"));
    }
  }
);

export const approveCoachRequest = createAsyncThunk<IAdminCoachRequest, string, { rejectValue: ThunkError }>(
  "userManagement/approveCoachRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      return await apiClient<IAdminCoachRequest>(`/api/admin/coach-requests/${requestId}/approve`, {
        method: "POST",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error approving request"));
    }
  }
);

export const rejectCoachRequest = createAsyncThunk<IAdminCoachRequest, string, { rejectValue: ThunkError }>(
  "userManagement/rejectCoachRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      return await apiClient<IAdminCoachRequest>(`/api/admin/coach-requests/${requestId}/reject`, {
        method: "POST",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error rejecting request"));
    }
  }
);

const selectUserManagementState = (state: RootState) => state.userManagement;

export const selectUsers = createSelector(
  [selectUserManagementState],
  (userManagement) => userManagement.users
);

export const selectCoachRequests = createSelector(
  [selectUserManagementState],
  (userManagement) => userManagement.requests
);

export const selectUserCoachRequest = createSelector(
  [selectUserManagementState],
  (userManagement) => userManagement.userCoachRequest
);

const userManagementSlice = createSlice({
  name: "userManagement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching users";
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error updating user";
      })
      .addCase(fetchCoachRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoachRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
        state.loading = false;
      })
      .addCase(fetchCoachRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching requests";
      })
      .addCase(fetchUserCoachRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCoachRequest.fulfilled, (state, action) => {
        state.userCoachRequest = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserCoachRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching user request";
      })
      .addCase(createCoachRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoachRequest.fulfilled, (state, action) => {
        state.userCoachRequest = action.payload;
        state.loading = false;
      })
      .addCase(createCoachRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error creating request";
      })
      .addCase(approveCoachRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveCoachRequest.fulfilled, (state, action) => {
        state.requests = state.requests.map((req) =>
          req._id === action.payload._id ? action.payload : req
        );
        state.users = state.users.map((user) =>
          user._id === action.payload.userId._id ? { ...user, role: "coach" } : user
        );
        if (state.userCoachRequest?._id === action.payload._id) {
          state.userCoachRequest = action.payload;
        }
        state.loading = false;
      })
      .addCase(approveCoachRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error approving request";
      })
      .addCase(rejectCoachRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectCoachRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((req) => req._id !== action.payload._id);
        if (state.userCoachRequest?._id === action.payload._id) {
          state.userCoachRequest = action.payload;
        }
        state.loading = false;
      })
      .addCase(rejectCoachRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error rejecting request";
      });
  },
});

export const { clearError } = userManagementSlice.actions;
export default userManagementSlice.reducer;