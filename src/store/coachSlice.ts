import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { IUser } from "../models/Users";
import { RoutineData } from "../models/Routine";
import { RootState } from ".";

export interface ThunkError {
  message: string;
  status?: number;
}

interface ICoachRequest {
  _id: string;
  userId: IUser;
  coachId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface CoachState {
  clients: IUser[];
  selectedClient: IUser | null;
  clientRoutines: RoutineData[];
  coaches: IUser[];
  requests: ICoachRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: CoachState = {
  clients: [],
  selectedClient: null,
  clientRoutines: [],
  coaches: [],
  requests: [],
  loading: false,
  error: null,
};

export const fetchClients = createAsyncThunk<IUser[], void, { rejectValue: ThunkError }>(
  "coach/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/clients", {
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
          message: errorData.message || "Error fetching clients",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error fetching clients" });
    }
  }
);

export const fetchClientProfile = createAsyncThunk<IUser, string, { rejectValue: ThunkError }>(
  "coach/fetchClientProfile",
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
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
          message: errorData.message || "Error fetching client profile",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error fetching client profile" });
    }
  }
);

export const fetchClientRoutines = createAsyncThunk<RoutineData[], string, { rejectValue: ThunkError }>(
  "coach/fetchClientRoutines",
  async (clientId, { rejectWithValue }) => {
    try {
      console.log("Fetching routines for clientId:", clientId);
      const response = await fetch(`/api/clients/${clientId}/routines`, {
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
          message: errorData.message || "Error fetching routines",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error fetching routines" });
    }
  }
);

export const assignRoutine = createAsyncThunk<RoutineData, { clientId: string; routineId: string }, { rejectValue: ThunkError }>(
  "coach/assignRoutine",
  async ({ clientId, routineId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/routines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ routineId }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error assigning routine",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error assigning routine" });
    }
  }
);

export const updateClientData = createAsyncThunk<IUser, { clientId: string; goals?: string[]; notes?: string }, { rejectValue: ThunkError }>(
  "coach/updateClientData",
  async ({ clientId, goals, notes }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ goals, notes }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error updating client",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error updating client" });
    }
  }
);

export const fetchCoaches = createAsyncThunk<IUser[], void, { rejectValue: ThunkError }>(
  "coach/fetchCoaches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/coaches", {
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
          message: errorData.message || "Error fetching coaches",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error fetching coaches" });
    }
  }
);

export const requestCoach = createAsyncThunk<void, string, { rejectValue: ThunkError }>(
  "coach/requestCoach",
  async (coachId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/coaches/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id:coachId }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error requesting coach",
          status: response.status,
        });
      }
    } catch {
      return rejectWithValue({ message: "Network error requesting coach" });
    }
  }
);

export const fetchCoachRequests = createAsyncThunk<ICoachRequest[], void, { rejectValue: ThunkError }>(
  "coach/fetchCoachRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/coaches/requests", {
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

export const acceptCoachRequest = createAsyncThunk<IUser, string, { rejectValue: ThunkError }>(
  "coach/acceptCoachRequest",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/coaches/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ id: userId }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Error accepting request",
          status: response.status,
        });
      }
      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue({ message: "Network error accepting request" });
    }
  }
);

export const rejectCoachRequest = createAsyncThunk<ICoachRequest, string, { rejectValue: ThunkError }>(
  "coach/rejectCoachRequest",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/coaches/requests/${userId}/reject`, {
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
const selectCoachState = (state: RootState) => state.coach;

export const selectSelectedClient = createSelector(
  [selectCoachState],
  (coach) => coach.selectedClient
);

export const selectClientRoutines = createSelector(
  [selectCoachState],
  (coach) => coach.clientRoutines
);

const coachSlice = createSlice({
  name: "coach",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearClientData: (state) => {
      state.selectedClient = null;
      state.clientRoutines = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.loading = false;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching clients";
      })
      .addCase(fetchClientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientProfile.fulfilled, (state, action) => {
        // Evitar actualización si los datos son idénticos
        if (
          !state.selectedClient ||
          JSON.stringify(state.selectedClient) !== JSON.stringify(action.payload)
        ) {
          state.selectedClient = action.payload;
        }
        state.loading = false;
      })
      .addCase(fetchClientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching client profile";
      })
      .addCase(fetchClientRoutines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientRoutines.fulfilled, (state, action) => {
        // Evitar actualización si los datos son idénticos
        if (
          JSON.stringify(state.clientRoutines) !== JSON.stringify(action.payload)
        ) {
          state.clientRoutines = action.payload;
        }
        state.loading = false;
      })
      .addCase(fetchClientRoutines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching routines";
      })
      .addCase(assignRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignRoutine.fulfilled, (state, action) => {
        state.clientRoutines.push(action.payload);
        state.loading = false;
      })
      .addCase(assignRoutine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error assigning routine";
      })
      .addCase(updateClientData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClientData.fulfilled, (state, action) => {
        // Evitar actualización si los datos son idénticos
        if (
          !state.selectedClient ||
          JSON.stringify(state.selectedClient) !== JSON.stringify(action.payload)
        ) {
          state.selectedClient = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateClientData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error updating client";
      })
      .addCase(fetchCoaches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoaches.fulfilled, (state, action) => {
        state.coaches = action.payload;
        state.loading = false;
      })
      .addCase(fetchCoaches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching coaches";
      })
      .addCase(requestCoach.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestCoach.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestCoach.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error requesting coach";
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
      .addCase(acceptCoachRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptCoachRequest.fulfilled, (state, action) => {
        state.clients.push(action.payload);
        state.requests = state.requests.filter((req) => req.userId._id !== action.payload._id);
        state.loading = false;
      })
      .addCase(acceptCoachRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error accepting request";
      })
      .addCase(rejectCoachRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectCoachRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((req) => req._id !== action.payload._id);
        state.loading = false;
      })
      .addCase(rejectCoachRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error rejecting request";
      });
  },
});

export const { clearError, clearClientData } = coachSlice.actions;
export default coachSlice.reducer;