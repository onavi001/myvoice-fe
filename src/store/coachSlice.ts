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
import type { CoachClientSummary, CoachCodePreview, CoachProfile, MyCoachOverview } from "../types/coach";
import { ProgressData } from "../models/Progress";
import { clearUserCoachLink } from "./userSlice";

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
  clients: CoachClientSummary[];
  selectedClient: IUser | null;
  clientRoutines: RoutineData[];
  clientProgress: ProgressData[];
  clientProgressLoading: boolean;
  coaches: IUser[];
  requests: ICoachRequest[];
  myCoachOverview: MyCoachOverview | null;
  coachProfile: CoachProfile | null;
  coachProfileLoading: boolean;
  coachCodePreview: CoachCodePreview | null;
  loading: boolean;
  error: string | null;
}

const initialState: CoachState = {
  clients: [],
  selectedClient: null,
  clientRoutines: [],
  clientProgress: [],
  clientProgressLoading: false,
  coaches: [],
  requests: [],
  myCoachOverview: null,
  coachProfile: null,
  coachProfileLoading: false,
  coachCodePreview: null,
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

export const fetchMyCoachOverview = createAsyncThunk<
  MyCoachOverview,
  void,
  { rejectValue: ThunkError; state: RootState }
>("coach/fetchMyCoachOverview", async (_, { rejectWithValue }) => {
  try {
    return await apiClient<MyCoachOverview>("/api/coaches/my-coach", { method: "GET" });
  } catch (error) {
    return rejectWithValue(toThunkError(error, "Error al cargar tu coach"));
  }
}, {
  condition: (_, { getState }) => {
    const { loading, myCoachOverview } = getState().coach;
    return !loading && myCoachOverview == null;
  },
});

export const fetchClients = createAsyncThunk<CoachClientSummary[], void, { rejectValue: ThunkError }>(
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

export const fetchClientProgress = createAsyncThunk<ProgressData[], string, { rejectValue: ThunkError }>(
  "coach/fetchClientProgress",
  async (clientId, { rejectWithValue }) => {
    try {
      return await apiClient<ProgressData[]>(`/api/clients/${clientId}/progress`, {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error fetching client progress"));
    }
  }
);

export const assignRoutine = createAsyncThunk<
  RoutineData,
  { clientId: string; routineId: string; message?: string },
  { rejectValue: ThunkError }
>("coach/assignRoutine", async ({ clientId, routineId, message }, { rejectWithValue }) => {
  try {
    return await apiClient<RoutineData>(`/api/clients/${clientId}/routines`, {
      method: "POST",
      body: JSON.stringify({ routineId, message }),
    });
  } catch (error) {
    return rejectWithValue(toThunkError(error, "Error assigning routine"));
  }
});

export const fetchCoachProfile = createAsyncThunk<CoachProfile, void, { rejectValue: ThunkError }>(
  "coach/fetchCoachProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient<CoachProfile>("/api/coaches/profile", { method: "GET" });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al cargar perfil de coach"));
    }
  }
);

export const fetchCoachByCode = createAsyncThunk<CoachCodePreview, string, { rejectValue: ThunkError }>(
  "coach/fetchCoachByCode",
  async (code, { rejectWithValue }) => {
    try {
      return await apiClient<CoachCodePreview>(`/api/coaches/code/${encodeURIComponent(code)}`, {
        method: "GET",
        auth: false,
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Coach no encontrado"));
    }
  }
);

export const requestCoachByCode = createAsyncThunk<void, string, { rejectValue: ThunkError }>(
  "coach/requestCoachByCode",
  async (code, { rejectWithValue }) => {
    try {
      await apiClient<unknown>("/api/coaches/join", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al enviar solicitud"));
    }
  }
);

export type LeaveCoachResult = {
  action: "left" | "cancelled_pending";
  clientId?: string;
  coachId?: string;
};

export const leaveCoach = createAsyncThunk<LeaveCoachResult, void, { rejectValue: ThunkError }>(
  "coach/leaveCoach",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const data = await apiClient<LeaveCoachResult>("/api/coaches/leave", { method: "POST" });
      if (data.action === "left") {
        dispatch(clearUserCoachLink());
      }
      return data;
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al dejar al coach"));
    }
  }
);

export const removeClient = createAsyncThunk<
  { clientId: string; coachId: string },
  string,
  { rejectValue: ThunkError }
>("coach/removeClient", async (clientId, { rejectWithValue }) => {
  try {
    return await apiClient<{ clientId: string; coachId: string }>(`/api/clients/${clientId}`, {
      method: "DELETE",
    });
  } catch (error) {
    return rejectWithValue(toThunkError(error, "Error al eliminar cliente"));
  }
});

export const markAssignmentSeen = createAsyncThunk<string, string, { rejectValue: ThunkError }>(
  "coach/markAssignmentSeen",
  async (routineId, { rejectWithValue }) => {
    try {
      const data = await apiClient<{ routineId: string }>(`/api/coaches/assignments/${routineId}/seen`, {
        method: "POST",
      });
      return data.routineId;
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al marcar asignación"));
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
      state.clientProgress = [];
      state.clientProgressLoading = false;
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
      .addCase(fetchClientProgress.pending, (state) => {
        state.clientProgressLoading = true;
        state.error = null;
      })
      .addCase(fetchClientProgress.fulfilled, (state, action) => {
        state.clientProgress = action.payload;
        state.clientProgressLoading = false;
      })
      .addCase(fetchClientProgress.rejected, (state, action) => {
        state.clientProgressLoading = false;
        state.error = action.payload?.message || "Error fetching client progress";
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
      .addCase(fetchMyCoachOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCoachOverview.fulfilled, (state, action) => {
        state.myCoachOverview = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyCoachOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error al cargar tu coach";
      })
      .addCase(fetchCoachProfile.pending, (state) => {
        state.coachProfileLoading = true;
        state.error = null;
      })
      .addCase(fetchCoachProfile.fulfilled, (state, action) => {
        state.coachProfile = action.payload;
        state.coachProfileLoading = false;
      })
      .addCase(fetchCoachProfile.rejected, (state, action) => {
        state.coachProfileLoading = false;
        state.error = action.payload?.message || "Error al cargar perfil de coach";
      })
      .addCase(fetchCoachByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.coachCodePreview = null;
      })
      .addCase(fetchCoachByCode.fulfilled, (state, action) => {
        state.coachCodePreview = action.payload;
        state.loading = false;
      })
      .addCase(fetchCoachByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Coach no encontrado";
      })
      .addCase(markAssignmentSeen.fulfilled, (state, action) => {
        if (state.myCoachOverview?.status === "assigned" && state.myCoachOverview.pendingAssignments) {
          state.myCoachOverview.pendingAssignments = state.myCoachOverview.pendingAssignments.filter(
            (item) => item.routineId !== action.payload
          );
        }
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
      })
      .addCase(leaveCoach.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveCoach.fulfilled, (state, action) => {
        state.loading = false;
        state.myCoachOverview = { status: "none" };
        if (action.payload.action === "cancelled_pending") {
          state.myCoachOverview = { status: "none" };
        }
      })
      .addCase(leaveCoach.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error al dejar al coach";
      })
      .addCase(removeClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter((c) => c._id !== action.payload.clientId);
        if (state.selectedClient?._id === action.payload.clientId) {
          state.selectedClient = null;
          state.clientRoutines = [];
          state.clientProgress = [];
        }
      })
      .addCase(removeClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error al eliminar cliente";
      });
  },
});

export const { clearError, clearClientData } = coachSlice.actions;
export default coachSlice.reducer;