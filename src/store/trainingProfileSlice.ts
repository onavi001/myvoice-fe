import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TrainingProfile } from "../models/TrainingProfile";
import { apiClient } from "../utils/apiClient";
import { toThunkError as mapThunkError } from "../utils/apiErrors";
import type { ThunkError } from "./routineSlice";

type TrainingProfileState = {
  profile: TrainingProfile | null;
  loaded: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: TrainingProfileState = {
  profile: null,
  loaded: false,
  loading: false,
  saving: false,
  error: null,
};

export const fetchTrainingProfile = createAsyncThunk<
  TrainingProfile | null,
  void,
  { rejectValue: ThunkError; state: import("./index").RootState }
>("trainingProfile/fetch", async (_, { rejectWithValue }) => {
  try {
    return await apiClient<TrainingProfile | null>("/api/profile/training");
  } catch (error) {
    return rejectWithValue(mapThunkError(error, "Error al cargar tu perfil de entrenamiento"));
  }
}, {
  condition: (_, { getState }) => {
    const { loaded, loading } = getState().trainingProfile;
    return !loaded && !loading;
  },
});

export const saveTrainingProfile = createAsyncThunk<
  TrainingProfile,
  Pick<TrainingProfile, "biologicalSex" | "heightCm" | "weightKg" | "sessionDurationMin">,
  { rejectValue: ThunkError }
>("trainingProfile/save", async (payload, { rejectWithValue }) => {
  try {
    return await apiClient<TrainingProfile>("/api/profile/training", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return rejectWithValue(mapThunkError(error, "Error al guardar tu perfil de entrenamiento"));
  }
});

const trainingProfileSlice = createSlice({
  name: "trainingProfile",
  initialState,
  reducers: {
    clearTrainingProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainingProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.profile = action.payload;
      })
      .addCase(fetchTrainingProfile.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload?.message || "Error al cargar perfil";
      })
      .addCase(saveTrainingProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveTrainingProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
        state.loaded = true;
      })
      .addCase(saveTrainingProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || "Error al guardar perfil";
      });
  },
});

export const { clearTrainingProfileError } = trainingProfileSlice.actions;
export default trainingProfileSlice.reducer;
