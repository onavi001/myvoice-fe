import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ProgressData } from "../models/Progress";
import { setAsyncFailed, setAsyncLoading, setAsyncSucceeded } from "./asyncState";
import { apiClient, ApiError } from "../utils/apiClient";

interface ThunkError {
  message: string;
  status?: number;
}

interface ProgressState {
  progress: ProgressData[];
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const normalizeProgressDate = (date: string | Date | undefined): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Date) return date.toISOString();
  return new Date(date).toISOString();
};

const normalizeProgressEntry = (entry: ProgressData): ProgressData => ({
  ...entry,
  date: normalizeProgressDate(entry.date),
});

const initialState: ProgressState = {
  progress: [],
  loading: false,
  status: "idle",
  error: null,
};

const toThunkError = (error: unknown, fallbackMessage: string): ThunkError => {
  const apiError = error as ApiError;
  return {
    message: apiError?.message || fallbackMessage,
    status: apiError?.status,
  };
};

// Agregar una entrada de progreso
export const addProgress = createAsyncThunk<ProgressData, Omit<ProgressData, "_id" | "userId">, { rejectValue: ThunkError }>(
  "progress/addProgress",
  async (progressData, { rejectWithValue }) => {
    try {
      const data = await apiClient<ProgressData>("/api/progress", {
        method: "POST",
        body: JSON.stringify({ ...progressData, date: normalizeProgressDate(progressData.date) }),
      });
      return normalizeProgressEntry(data);
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al agregar progreso"));
    }
  }
);

// Obtener el progreso del usuario
export const fetchProgress = createAsyncThunk<ProgressData[], void, { rejectValue: ThunkError }>(
  "progress/fetchProgress",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient<ProgressData[]>("/api/progress", { method: "GET" });
      return data.map(normalizeProgressEntry);
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al obtener progreso"));
    }
  }
);

// Editar una entrada de progreso
export const editProgress = createAsyncThunk<
  ProgressData,
  { progressId: string; updatedEntry: Partial<ProgressData> },
  { rejectValue: ThunkError }
>(
  "progress/editProgress",
  async ({ progressId, updatedEntry }, { rejectWithValue }) => {
    try {
      const serializedEntry = {
        ...updatedEntry,
        date: updatedEntry.date ? normalizeProgressDate(updatedEntry.date) : undefined,
      };
      const data = await apiClient<ProgressData>(`/api/progress/${progressId}`, {
        method: "PUT",
        body: JSON.stringify(serializedEntry),
      });
      return normalizeProgressEntry(data);
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al editar progreso"));
    }
  }
);

// Eliminar una entrada de progreso
export const deleteProgress = createAsyncThunk<string, string, { rejectValue: ThunkError }>(
  "progress/deleteProgress",
  async (progressId, { rejectWithValue }) => {
    try {
      await apiClient<unknown>(`/api/progress/${progressId}`, {
        method: "DELETE",
      });
      return progressId;
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al eliminar progreso"));
    }
  }
);

// Limpiar todo el progreso del usuario
export const clearProgress = createAsyncThunk<boolean, void, { rejectValue: ThunkError }>(
  "progress/clearProgress",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient<unknown>("/api/progress", {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al limpiar progreso"));
    }
  }
);

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProgress.pending, (state) => {
        setAsyncLoading(state);
      })
      .addCase(addProgress.fulfilled, (state, action: PayloadAction<ProgressData>) => {
        setAsyncSucceeded(state);
        state.progress.push(action.payload);
      })
      .addCase(addProgress.rejected, (state, action) => {
        setAsyncFailed(state, (action.payload as ThunkError | undefined)?.message ?? "Error desconocido");
      })
      .addCase(fetchProgress.pending, (state) => {
        setAsyncLoading(state);
      })
      .addCase(fetchProgress.fulfilled, (state, action: PayloadAction<ProgressData[]>) => {
        setAsyncSucceeded(state);
        state.progress = action.payload;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        setAsyncFailed(state, (action.payload as ThunkError | undefined)?.message ?? "Error desconocido");
      })
      .addCase(editProgress.pending, (state) => {
        setAsyncLoading(state);
      })
      .addCase(editProgress.fulfilled, (state, action: PayloadAction<ProgressData>) => {
        setAsyncSucceeded(state);
        const index = state.progress.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) state.progress[index] = action.payload;
      })
      .addCase(editProgress.rejected, (state, action) => {
        setAsyncFailed(state, (action.payload as ThunkError | undefined)?.message ?? "Error desconocido");
      })
      .addCase(deleteProgress.pending, (state) => {
        setAsyncLoading(state);
      })
      .addCase(deleteProgress.fulfilled, (state, action: PayloadAction<string>) => {
        setAsyncSucceeded(state);
        state.progress = state.progress.filter((entry) => entry._id !== action.payload);
      })
      .addCase(deleteProgress.rejected, (state, action) => {
        setAsyncFailed(state, (action.payload as ThunkError | undefined)?.message ?? "Error desconocido");
      })
      .addCase(clearProgress.pending, (state) => {
        setAsyncLoading(state);
      })
      .addCase(clearProgress.fulfilled, (state) => {
        setAsyncSucceeded(state);
        state.progress = [];
      })
      .addCase(clearProgress.rejected, (state, action) => {
        setAsyncFailed(state, (action.payload as ThunkError | undefined)?.message ?? "Error desconocido");
      });
  },
});

export default progressSlice.reducer;