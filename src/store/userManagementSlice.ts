import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { IUser } from "../models/Users";
import { RootState } from ".";

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

export const fetchUsers = createAsyncThunk<IUser[], void, { rejectValue: ThunkError }>(
  "userManagement/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error fetching users",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error fetching users" });
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedUser),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error updating user",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error updating user" });
    }
  }
);

export const fetchCoachRequests = createAsyncThunk<IAdminCoachRequest[], void, { rejectValue: ThunkError }>(
  "userManagement/fetchCoachRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/coach-requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error fetching requests",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error fetching requests" });
    }
  }
);

export const fetchUserCoachRequest = createAsyncThunk<IAdminCoachRequest | null, void, { rejectValue: ThunkError }>(
  "userManagement/fetchUserCoachRequest",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/coach-requests/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error fetching user request",
          status: response.status,
        });
      }
      const data = await response.json();
      return data || null;
    } catch {
      return rejectWithValue({ message: "Network error fetching user request" });
    }
  }
);

export const createCoachRequest = createAsyncThunk<IAdminCoachRequest, { message: string }, { rejectValue: ThunkError }>(
  "userManagement/createCoachRequest",
  async ({ message }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/admin/coach-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error creating request",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error creating request" });
    }
  }
);

export const approveCoachRequest = createAsyncThunk<IAdminCoachRequest, string, { rejectValue: ThunkError }>(
  "userManagement/approveCoachRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/coach-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error approving request",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error approving request" });
    }
  }
);

export const rejectCoachRequest = createAsyncThunk<IAdminCoachRequest, string, { rejectValue: ThunkError }>(
  "userManagement/rejectCoachRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/coach-requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error rejecting request",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error rejecting request" });
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
        if (JSON.stringify(state.users) !== JSON.stringify(action.payload)) {
          state.users = action.payload;
        }
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
        if (JSON.stringify(state.requests) !== JSON.stringify(action.payload)) {
          state.requests = action.payload;
        }
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