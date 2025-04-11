import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ProgressData } from "../models/Progress";

interface ProgressState {
  progress: ProgressData[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  progress: [],
  loading: false,
  error: null,
};

// Agregar una entrada de progreso
export const addProgress = createAsyncThunk(
  "progress/addProgress",
  async (
    progressData: Omit<ProgressData, "_id" | "userId">,
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { user: { token: string; user: { _id: string } } };
    const token = state.user.token;
    const userId = state.user.user._id;
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...progressData, userId, date: progressData.date.toISOString() }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al agregar progreso");
      const data = await response.json();
      return { ...data, date: new Date(data.date).toISOString() } as ProgressData;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Obtener el progreso del usuario
export const fetchProgress = createAsyncThunk(
  "progress/fetchProgress",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch("/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error al obtener progreso");
      const data = await response.json();
      return data.map((entry: ProgressData) => ({ ...entry, date: new Date(entry.date) })) as ProgressData[];
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Editar una entrada de progreso
export const editProgress = createAsyncThunk(
  "progress/editProgress",
  async (
    { progressId, updatedEntry }: { progressId: string; updatedEntry: Partial<ProgressData> },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const serializedEntry = {
        ...updatedEntry,
        date: updatedEntry.date ? updatedEntry.date.toISOString() : undefined,
      };
      const response = await fetch(`/api/progress/${progressId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(serializedEntry),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al editar progreso");
      const data = await response.json();
      return { ...data, date: new Date(data.date).toISOString() } as ProgressData;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Eliminar una entrada de progreso
export const deleteProgress = createAsyncThunk(
  "progress/deleteProgress",
  async (progressId: string, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/progress/${progressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al eliminar progreso");
      return progressId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Limpiar todo el progreso del usuario
export const clearProgress = createAsyncThunk(
  "progress/clearProgress",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch("/api/progress", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al limpiar progreso");
      return true;
    } catch (error) {
      return rejectWithValue((error as Error).message);
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
        state.loading = true;
        state.error = null;
      })
      .addCase(addProgress.fulfilled, (state, action: PayloadAction<ProgressData>) => {
        state.loading = false;
        state.progress.push(action.payload);
      })
      .addCase(addProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action: PayloadAction<ProgressData[]>) => {
        state.loading = false;
        state.progress = action.payload;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(editProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editProgress.fulfilled, (state, action: PayloadAction<ProgressData>) => {
        state.loading = false;
        const index = state.progress.findIndex((entry) => entry._id === action.payload._id);
        if (index !== -1) state.progress[index] = action.payload;
      })
      .addCase(editProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProgress.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.progress = state.progress.filter((entry) => entry._id !== action.payload);
      })
      .addCase(deleteProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(clearProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearProgress.fulfilled, (state) => {
        state.loading = false;
        state.progress = [];
      })
      .addCase(clearProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default progressSlice.reducer;