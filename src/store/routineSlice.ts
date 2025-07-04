import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IRoutine, RoutineData } from "../models/Routine";
import { IDay } from "../models/Day";

export interface ThunkError {
  message: string;
  status?: number;
}

interface RoutineInput {
  level: "principiante" | "intermedio" | "avanzado";
  goal: "fuerza" | "hipertrofia" | "resistencia";
  days: number;
  equipment: "gym" | "casa" | "pesas";
  name?: string;
  notes?: string;
}

interface RoutineState {
  routines: RoutineData[];
  selectedRoutineId: string | null;
  loading: boolean;
  loadingVideos: Record<string, boolean>;
  error: string | null;
}

const initialState: RoutineState = {
  routines: [],
  selectedRoutineId: null,
  loading: false,
  loadingVideos: {},
  error: null,
};

// Fetch todas las rutinas del usuario
export const fetchRoutines = createAsyncThunk<RoutineData[], void, { rejectValue: ThunkError }>(
  "routine/fetchRoutines",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch("/api/routines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al obtener rutinas");
      const data = await response.json();
      return data as RoutineData[];
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

export const fetchRoutineById = createAsyncThunk<RoutineData, string, { rejectValue: ThunkError }>(
  "routine/fetchRoutineById",
  async (routineId, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al eliminar rutina");
      const data = await response.json();
      return data as RoutineData;
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Crear una nueva rutina
export const createRoutine = createAsyncThunk<RoutineData, IRoutine, { rejectValue: ThunkError }>(
  "routine/createRoutine",
  async (routineData, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch("/api/routines", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(routineData),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al crear rutina");
      const data = await response.json();
      return data as RoutineData;
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Actualizar una rutina
export const updateRoutine = createAsyncThunk<RoutineData, RoutineData, { rejectValue: ThunkError }>(
  "routine/updateRoutine",
  async (routineData, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/routines/${routineData._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ routineData }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al actualizar rutina");
      const data = await response.json();
      return data as RoutineData;
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Eliminar una rutina
export const deleteRoutine = createAsyncThunk<string, string, { rejectValue: ThunkError }>(
  "routine/deleteRoutine",
  async (routineId, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/routines/${routineId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al eliminar rutina");
      return routineId;
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Seleccionar una rutina
export const selectRoutine = createAsyncThunk<string, string, { rejectValue: ThunkError }>(
  "routine/selectRoutine",
  async (routineId, { getState, rejectWithValue }) => {
    const state = getState() as { routine: RoutineState };
    if (state.routine.routines.some((r) => r._id === routineId)) {
      localStorage.setItem("routineId", routineId);
      return routineId;
    }
    return rejectWithValue({ message: "ID de rutina inválido" });
  }
);

// Crear un día en una rutina
export const createDay = createAsyncThunk<
  { routineId: string; day: RoutineData["days"][number] },
  { routineId: string; dayData: Partial<IDay> },
  { rejectValue: ThunkError }
>(
  "routine/createDay",
  async ({ routineId, dayData }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/routines/${routineId}/days`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(dayData),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al crear día");
      const data = await response.json();
      return { routineId, day: data };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Actualizar un día
export const updateDay = createAsyncThunk<
  { routineId: string; dayId: string; dayName: string },
  { routineId: string; dayId: string; dayName: string },
  { rejectValue: ThunkError }
>(
  "routine/updateDay",
  async ({ routineId, dayId, dayName }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/days/${dayId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ dayName }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al actualizar día");
      const data = await response.json();
      return { routineId, dayId, dayName: data.dayName };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Eliminar un día
export const deleteDay = createAsyncThunk<
  { routineId: string; dayId: string },
  { routineId: string; dayId: string },
  { rejectValue: ThunkError }
>(
  "routine/deleteDay",
  async ({ routineId, dayId }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/days/${dayId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al eliminar día");
      return { routineId, dayId };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Crear un ejercicio en un día
export const createExercise = createAsyncThunk<
  { routineId: string; dayId: string; exercise: RoutineData["days"][number]["exercises"][number] },
  { routineId: string; dayId: string; exerciseData: { name: string; sets: number; reps: number } },
  { rejectValue: ThunkError }
>(
  "routine/createExercise",
  async ({ routineId, dayId, exerciseData }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/days/${dayId}/exercises`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(exerciseData),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al crear ejercicio");
      const data = await response.json();
      return { routineId, dayId, exercise: data };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Actualizar un ejercicio
export const updateExercise = createAsyncThunk<
  { routineId: string; dayId: string; exerciseId: string; exercise: RoutineData["days"][number]["exercises"][number] },
  { routineId: string; dayId: string; exerciseId: string; exerciseData: Partial<RoutineData["days"][number]["exercises"][number]> },
  { rejectValue: ThunkError }
>(
  "routine/updateExercise",
  async ({ routineId, dayId, exerciseId, exerciseData }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(exerciseData),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al actualizar ejercicio");
      const data = await response.json();
      return { routineId, dayId, exerciseId, exercise: data };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Eliminar un ejercicio
export const deleteExercise = createAsyncThunk<
  { routineId: string; dayId: string; exerciseId: string },
  { routineId: string; dayId: string; exerciseId: string },
  { rejectValue: ThunkError }
>(
  "routine/deleteExercise",
  async ({ routineId, dayId, exerciseId }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al eliminar ejercicio");
      return { routineId, dayId, exerciseId };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Actualizar el estado de completado de un ejercicio
export const updateExerciseCompleted = createAsyncThunk<
  { routineId: string; dayId: string; exerciseId: string; completed: boolean },
  { routineId: string; dayId: string; exerciseId: string; completed: boolean },
  { rejectValue: ThunkError }
>(
  "routine/updateExerciseCompleted",
  async ({ routineId, dayId, exerciseId, completed }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al actualizar ejercicio");
      const updatedExercise = await response.json();
      return { routineId, dayId, exerciseId, completed: updatedExercise.completed };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Establecer videos para un ejercicio
export const setExerciseVideos = createAsyncThunk<
  { routineId: string; dayId: string; exerciseId: string; videos: { _id: string; url: string; isCurrent: boolean }[] },
  { routineId: string; dayId: string; exerciseId: string; videos: { url: string; isCurrent: boolean }[] },
  { rejectValue: ThunkError }
>(
  "routine/setExerciseVideos",
  async ({ routineId, dayId, exerciseId, videos }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const videoIds = [];
      for (const video of videos) {
        const response = await fetch("/api/videos", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(video),
        });
        if (response.status === 401) {
          return rejectWithValue({ message: "Unauthorized", status: 401 });
        }
        if (!response.ok) throw new Error("Error al crear video");
        const newVideo = await response.json();
        videoIds.push(newVideo._id);
      }

      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ videos: videoIds }),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al actualizar videos del ejercicio");
      const updatedExercise = await response.json();
      return { routineId, dayId, exerciseId, videos: updatedExercise.videos };
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Generar videos para un ejercicio
export const generateExerciseVideos = createAsyncThunk<
  { url: string; isCurrent: boolean }[],
  { exerciseName: string },
  { rejectValue: ThunkError }
>(
  "routine/generateExerciseVideos",
  async ({ exerciseName }, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch(`/api/videos?exerciseName=${encodeURIComponent(exerciseName)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) throw new Error("Error al obtener videos");
      const videos = await response.json();
      return videos as { url: string; isCurrent: boolean }[];
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

// Generar una rutina
export const generateRoutine = createAsyncThunk<RoutineData, RoutineInput, { rejectValue: ThunkError }>(
  "routine/generateRoutine",
  async (input, { getState, rejectWithValue }) => {
    const state = getState() as { user: { token: string } };
    const token = state.user.token;
    try {
      const response = await fetch("/api/routines/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });
      if (response.status === 401) {
        return rejectWithValue({ message: "Unauthorized", status: 401 });
      }
      if (!response.ok) {
        return rejectWithValue({ message: response.statusText, status: response.status });
      }
      const routine: RoutineData = await response.json();
      return routine;
    } catch (error) {
      return rejectWithValue({ message: (error as Error).message });
    }
  }
);

const routineSlice = createSlice({
  name: "routine",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Routine by ID
      .addCase(fetchRoutineById.fulfilled, (state, action: PayloadAction<RoutineData>) => {
        console.log("Rutina obtenida:", action.payload);
        const index = state.routines.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
        } else {
          state.routines.push(action.payload);
        }
        state.selectedRoutineId = action.payload._id;
        
      }
      )
      .addCase(fetchRoutineById.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
        //state.loading = false;
      })
      // Fetch Routines
      .addCase(fetchRoutines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoutines.fulfilled, (state, action: PayloadAction<RoutineData[]>) => {
        state.loading = false;
        state.routines = action.payload;
        state.selectedRoutineId = action.payload.length > 0 ? action.payload[0]._id : null;
      })
      .addCase(fetchRoutines.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Create Routine
      .addCase(createRoutine.fulfilled, (state, action: PayloadAction<RoutineData>) => {
        state.routines.push(action.payload);
        state.selectedRoutineId = action.payload._id;
      })
      .addCase(createRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Update Routine
      .addCase(updateRoutine.fulfilled, (state, action: PayloadAction<RoutineData>) => {
        const index = state.routines.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
        }
      })
      .addCase(updateRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Delete Routine
      .addCase(deleteRoutine.fulfilled, (state, action: PayloadAction<string>) => {
        state.routines = state.routines.filter((r) => r._id !== action.payload);
        state.selectedRoutineId = state.routines.length > 0 ? state.routines[0]._id : null;
      })
      .addCase(deleteRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Select Routine
      .addCase(selectRoutine.fulfilled, (state, action: PayloadAction<string>) => {
        state.selectedRoutineId = action.payload;
      })
      .addCase(selectRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Create Day
      .addCase(createDay.fulfilled, (state, action: PayloadAction<{ routineId: string; day: RoutineData["days"][number] }>) => {
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          routine.days.push(action.payload.day);
        }
      })
      .addCase(createDay.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Update Day
      .addCase(updateDay.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string; dayName: string }>) => {
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          const day = routine.days.find((d) => d._id === action.payload.dayId);
          if (day) {
            day.dayName = action.payload.dayName;
          }
        }
      })
      .addCase(updateDay.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Delete Day
      .addCase(deleteDay.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string }>) => {
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          routine.days = routine.days.filter((d) => d._id !== action.payload.dayId);
        }
      })
      .addCase(deleteDay.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Create Exercise
      .addCase(createExercise.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string; exercise: RoutineData["days"][number]["exercises"][number] }>) => {
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          const day = routine.days.find((d) => d._id === action.payload.dayId);
          if (day) {
            day.exercises.push(action.payload.exercise);
          }
        }
      })
      .addCase(createExercise.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Update Exercise
      .addCase(updateExercise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExercise.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string; exerciseId: string; exercise: RoutineData["days"][number]["exercises"][number] }>) => {
        state.loading = false;
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          const day = routine.days.find((d) => d._id === action.payload.dayId);
          if (day) {
            const exerciseIndex = day.exercises.findIndex((e) => e._id === action.payload.exerciseId);
            if (exerciseIndex !== -1) {
              day.exercises[exerciseIndex] = action.payload.exercise;
            }
          }
        }
      })
      .addCase(updateExercise.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Delete Exercise
      .addCase(deleteExercise.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string; exerciseId: string }>) => {
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          const day = routine.days.find((d) => d._id === action.payload.dayId);
          if (day) {
            day.exercises = day.exercises.filter((e) => e._id !== action.payload.exerciseId);
            delete state.loadingVideos[`${action.payload.routineId}-${action.payload.dayId}-${action.payload.exerciseId}`];
          }
        }
      })
      .addCase(deleteExercise.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Update Exercise Completed
      .addCase(updateExerciseCompleted.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string; exerciseId: string; completed: boolean }>) => {
        const { routineId, dayId, exerciseId, completed } = action.payload;
        const routine = state.routines.find((r) => r._id === routineId);
        if (routine) {
          const day = routine.days.find((d) => d._id === dayId);
          if (day) {
            const exercise = day.exercises.find((e) => e._id === exerciseId);
            if (exercise) {
              exercise.completed = completed;
            }
          }
        }
      })
      .addCase(updateExerciseCompleted.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Set Exercise Videos
      .addCase(setExerciseVideos.pending, (state, action) => {
        const { routineId, dayId, exerciseId } = action.meta.arg;
        state.loadingVideos[`${routineId}-${dayId}-${exerciseId}`] = true;
      })
      .addCase(setExerciseVideos.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string; exerciseId: string; videos: { _id: string; url: string; isCurrent: boolean }[] }>) => {
        const { routineId, dayId, exerciseId, videos } = action.payload;
        const routine = state.routines.find((r) => r._id === routineId);
        if (routine) {
          const day = routine.days.find((d) => d._id === dayId);
          if (day) {
            const exercise = day.exercises.find((e) => e._id === exerciseId);
            if (exercise) {
              exercise.videos = videos;
            }
          }
        }
        state.loadingVideos[`${routineId}-${dayId}-${exerciseId}`] = false;
      })
      .addCase(setExerciseVideos.rejected, (state, action) => {
        const { routineId, dayId, exerciseId } = action.meta.arg;
        state.loadingVideos[`${routineId}-${dayId}-${exerciseId}`] = false;
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Generate Exercise Videos
      .addCase(generateExerciseVideos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateExerciseVideos.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateExerciseVideos.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Generate Routine
      .addCase(generateRoutine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateRoutine.fulfilled, (state, action: PayloadAction<RoutineData>) => {
        state.loading = false;
        state.routines.push(action.payload);
        state.selectedRoutineId = action.payload._id;
      })
      .addCase(generateRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Error desconocido";
      });
  },
});

export default routineSlice.reducer;