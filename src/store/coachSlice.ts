/**
 * Redux slice para la gestión de coaches y clientes:
 * - Maneja solicitudes de coach
 * - Asigna rutinas
 * - Gestiona el estado de clientes y coaches
 */
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { IUser } from "../models/Users";
import { RoutineData } from "../models/Routine";
import { RootState } from ".";
import { apiClient, ApiError } from "../utils/apiClient";

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

const toThunkError = (error: unknown, fallbackMessage: string): ThunkError => {
  const apiError = error as ApiError;
  return {
    message: apiError?.message || fallbackMessage,
    status: apiError?.status,
  };
};

export const fetchClients = createAsyncThunk<IUser[], void, { rejectValue: ThunkError }>(
  "coach/fetchClients",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient<IUser[]>("/api/clients", {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching clients"));
    }
  }
);

export const fetchClientProfile = createAsyncThunk<IUser, string, { rejectValue: ThunkError }>(
  "coach/fetchClientProfile",
  async (clientId, { rejectWithValue }) => {
    try {
      return await apiClient<IUser>(`/api/clients/${clientId}`, {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching client profile"));
    }
  }
);

export const fetchClientRoutines = createAsyncThunk<RoutineData[], string, { rejectValue: ThunkError }>(
  "coach/fetchClientRoutines",
  async (clientId, { rejectWithValue }) => {
    try {
      return await apiClient<RoutineData[]>(`/api/clients/${clientId}/routines`, {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching routines"));
    }
  }
);

export const assignRoutine = createAsyncThunk<RoutineData, { clientId: string; routineId: string }, { rejectValue: ThunkError }>(
  "coach/assignRoutine",
  async ({ clientId, routineId }, { rejectWithValue }) => {
    try {
      return await apiClient<RoutineData>(`/api/clients/${clientId}/routines`, {
        method: "POST",
        body: JSON.stringify({ routineId }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error assigning routine"));
    }
  }
);

export const updateClientData = createAsyncThunk<IUser, { clientId: string; goals?: string; notes?: string }, { rejectValue: ThunkError }>(
  "coach/updateClientData",
  async ({ clientId, goals, notes }, { rejectWithValue }) => {
    try {
      return await apiClient<IUser>(`/api/clients/${clientId}`, {
        method: "PUT",
        body: JSON.stringify({ goals, notes }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error updating client"));
    }
  }
);

export const fetchCoaches = createAsyncThunk<IUser[], void, { rejectValue: ThunkError }>(
  "coach/fetchCoaches",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient<IUser[]>("/api/coaches", {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching coaches"));
    }
  }
);

export const requestCoach = createAsyncThunk<void, string, { rejectValue: ThunkError }>(
  "coach/requestCoach",
  async (coachId, { rejectWithValue }) => {
    try {
      await apiClient<unknown>(`/api/coaches/requests`, {
        method: "POST",
        body: JSON.stringify({ id:coachId }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error requesting coach"));
    }
  }
);

export const fetchCoachRequests = createAsyncThunk<ICoachRequest[], void, { rejectValue: ThunkError }>(
  "coach/fetchCoachRequests",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient<ICoachRequest[]>("/api/coaches/requests", {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching requests"));
    }
  }
);

export const acceptCoachRequest = createAsyncThunk<IUser, string, { rejectValue: ThunkError }>(
  "coach/acceptCoachRequest",
  async (userId, { rejectWithValue }) => {
    try {
      return await apiClient<IUser>(`/api/coaches/accept`, {
        method: "POST",
        body: JSON.stringify({ id: userId }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error accepting request"));
    }
  }
);

export const rejectCoachRequest = createAsyncThunk<ICoachRequest, string, { rejectValue: ThunkError }>(
  "coach/rejectCoachRequest",
  async (userId, { rejectWithValue }) => {
    try {
      return await apiClient<ICoachRequest>(`/api/coaches/reject`, {
        method: "POST",
        body: JSON.stringify({ id: userId }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error rejecting request"));
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
        state.selectedClient = action.payload;
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
        state.clientRoutines = action.payload;
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
        state.selectedClient = action.payload;
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