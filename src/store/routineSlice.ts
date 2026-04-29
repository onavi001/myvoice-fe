import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { IRoutine, RoutineData } from "../models/Routine";
import { IDay } from "../models/Day";
import { setAsyncFailed, setAsyncLoading, setAsyncSucceeded } from "./asyncState";
import { apiClient, ApiError } from "../utils/apiClient";

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
  status: "idle" | "loading" | "succeeded" | "failed";
  loadingVideos: Record<string, boolean>;
  error: string | null;
}

const initialState: RoutineState = {
  routines: [],
  selectedRoutineId: null,
  loading: false,
  status: "idle",
  loadingVideos: {},
  error: null,
};

const toThunkError = (error: unknown, fallbackMessage: string): ThunkError => {
  const apiError = error as ApiError;
  return {
    message: apiError?.message || fallbackMessage,
    status: apiError?.status,
  };
};

// Fetch todas las rutinas del usuario
export const fetchRoutines = createAsyncThunk<RoutineData[], void, { rejectValue: ThunkError }>(
  "routine/fetchRoutines",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient<RoutineData[]>("/api/routines", { method: "GET" });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al obtener rutinas"));
    }
  }
);

export const fetchRoutineById = createAsyncThunk<RoutineData, string, { rejectValue: ThunkError }>(
  "routine/fetchRoutineById",
  async (routineId, { rejectWithValue }) => {
    try {
      return await apiClient<RoutineData>(`/api/routines/${routineId}`, {
        method: "GET",
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al obtener rutina"));
    }
  }
);

// Crear una nueva rutina
export const createRoutine = createAsyncThunk<RoutineData, IRoutine, { rejectValue: ThunkError }>(
  "routine/createRoutine",
  async (routineData, { rejectWithValue }) => {
    try {
      return await apiClient<RoutineData>("/api/routines", {
        method: "POST",
        body: JSON.stringify(routineData),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al crear rutina"));
    }
  }
);

// Actualizar una rutina
export const updateRoutine = createAsyncThunk<RoutineData, RoutineData, { rejectValue: ThunkError }>(
  "routine/updateRoutine",
  async (routineData, { rejectWithValue }) => {
    try {
      return await apiClient<RoutineData>(`/api/routines/${routineData._id}`, {
        method: "PUT",
        body: JSON.stringify({ routineData }),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al actualizar rutina"));
    }
  }
);

// Eliminar una rutina
export const deleteRoutine = createAsyncThunk<string, string, { rejectValue: ThunkError }>(
  "routine/deleteRoutine",
  async (routineId, { rejectWithValue }) => {
    try {
      await apiClient<unknown>(`/api/routines/${routineId}`, {
        method: "DELETE",
      });
      return routineId;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 404) return routineId;
      return rejectWithValue(toThunkError(error, "Error al eliminar rutina"));
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
  async ({ routineId, dayData }, { rejectWithValue }) => {
    try {
      const data = await apiClient<RoutineData["days"][number]>(`/api/routines/${routineId}/days`, {
        method: "POST",
        body: JSON.stringify(dayData),
      });
      return { routineId, day: data };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al crear día"));
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
  async ({ routineId, dayId, dayName }, { rejectWithValue }) => {
    try {
      const data = await apiClient<{ dayName: string }>(`/api/days/${dayId}`, {
        method: "PUT",
        body: JSON.stringify({ dayName }),
      });
      return { routineId, dayId, dayName: data.dayName };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al actualizar día"));
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
  async ({ routineId, dayId }, { rejectWithValue }) => {
    try {
      await apiClient<unknown>(`/api/days/${dayId}`, {
        method: "DELETE",
      });
      return { routineId, dayId };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al eliminar día"));
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
  async ({ routineId, dayId, exerciseData }, { rejectWithValue }) => {
    try {
      const data = await apiClient<RoutineData["days"][number]["exercises"][number]>(`/api/days/${dayId}/exercises`, {
        method: "POST",
        body: JSON.stringify(exerciseData),
      });
      return { routineId, dayId, exercise: data };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al crear ejercicio"));
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
  async ({ routineId, dayId, exerciseId, exerciseData }, { rejectWithValue }) => {
    try {
      const data = await apiClient<RoutineData["days"][number]["exercises"][number]>(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        body: JSON.stringify(exerciseData),
      });
      return { routineId, dayId, exerciseId, exercise: data };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al actualizar ejercicio"));
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
  async ({ routineId, dayId, exerciseId }, { rejectWithValue }) => {
    try {
      await apiClient<unknown>(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
      });
      return { routineId, dayId, exerciseId };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al eliminar ejercicio"));
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
  async ({ routineId, dayId, exerciseId, completed }, { rejectWithValue }) => {
    try {
      const updatedExercise = await apiClient<{ completed: boolean }>(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        body: JSON.stringify({ completed }),
      });
      return { routineId, dayId, exerciseId, completed: updatedExercise.completed };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al actualizar ejercicio"));
    }
  }
);

//Reset de progreso de un dia
export const resetDayProgress = createAsyncThunk<
  { routineId: string; dayId: string },
  { routineId: string; dayId: string },
  { rejectValue: ThunkError }
>(
  "routine/resetDayProgress",
  async ({ routineId, dayId }, { rejectWithValue }) => {
    try {
      await apiClient<unknown>(`/api/days/${dayId}/reset`, {
        method: "PUT",
      });
      return { routineId, dayId };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al resetear progreso del día"));
    }
  }
);

//Reset de progreso de una rutina
export const resetRoutineProgress = createAsyncThunk<
  { routineId: string },
  { routineId: string },
  { rejectValue: ThunkError }
>(
  "routine/resetRoutineProgress",
  async ({ routineId }, { rejectWithValue }) => {
    try {
      await apiClient<unknown>(`/api/routines/${routineId}/reset`, {
        method: "PUT",
      });
      return { routineId };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al resetear progreso de la rutina"));
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
  async ({ routineId, dayId, exerciseId, videos }, { rejectWithValue }) => {
    try {
      const videoIds: string[] = [];
      for (const video of videos) {
        const newVideo = await apiClient<{ _id: string }>("/api/videos", {
          method: "POST",
          body: JSON.stringify(video),
        });
        videoIds.push(newVideo._id);
      }

      const updatedExercise = await apiClient<{ videos: { _id: string; url: string; isCurrent: boolean }[] }>(`/api/exercises/${exerciseId}`, {
        method: "PUT",
        body: JSON.stringify({ videos: videoIds }),
      });
      return { routineId, dayId, exerciseId, videos: updatedExercise.videos };
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al actualizar videos del ejercicio"));
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
  async ({ exerciseName }, { rejectWithValue }) => {
    try {
      return await apiClient<{ url: string; isCurrent: boolean }[]>(
        `/api/videos?exerciseName=${encodeURIComponent(exerciseName)}`,
        {
        method: "GET",
        }
      );
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al obtener videos"));
    }
  }
);

// Generar una rutina
export const generateRoutine = createAsyncThunk<RoutineData, RoutineInput, { rejectValue: ThunkError }>(
  "routine/generateRoutine",
  async (input, { rejectWithValue }) => {
    try {
      return await apiClient<RoutineData>("/api/routines/generate", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch (error) {
      return rejectWithValue(toThunkError(error, "Error al generar rutina"));
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
        state.status = "succeeded";
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
        state.status = "failed";
        state.error = action.payload?.message ?? "Error desconocido";
        //state.loading = false;
      })
      // Reset progress of a day
      .addCase(resetDayProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetDayProgress.fulfilled, (state, action: PayloadAction<{ routineId: string; dayId: string }>) => {
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          const day = routine.days.find((d) => d._id === action.payload.dayId);
          if (day) {
            day.exercises.forEach((exercise) => {
              exercise.completed = false; // Reset completed status
            });
          }
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(resetDayProgress.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Reset progress of a routine
      .addCase(resetRoutineProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetRoutineProgress.fulfilled, (state, action: PayloadAction<{ routineId: string }>) => {
        const routine = state.routines.find((r) => r._id === action.payload.routineId);
        if (routine) {
          routine.days.forEach((day) => {
            day.exercises.forEach((exercise) => {
              exercise.completed = false; // Reset completed status
            });
          });
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(resetRoutineProgress.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Fetch Routines
      .addCase(fetchRoutines.pending, (state) => {
        setAsyncLoading(state);
      })
      .addCase(fetchRoutines.fulfilled, (state, action: PayloadAction<RoutineData[]>) => {
        setAsyncSucceeded(state);
        state.routines = action.payload;
        state.selectedRoutineId = action.payload.length > 0 ? action.payload[0]._id : null;
      })
      .addCase(fetchRoutines.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        setAsyncFailed(state, action.payload?.message ?? "Error desconocido");
      })
      // Create Routine
      .addCase(createRoutine.fulfilled, (state, action: PayloadAction<RoutineData>) => {
        state.status = "succeeded";
        state.routines.push(action.payload);
        state.selectedRoutineId = action.payload._id;
      })
      .addCase(createRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.status = "failed";
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Update Routine
      .addCase(updateRoutine.fulfilled, (state, action: PayloadAction<RoutineData>) => {
        state.status = "succeeded";
        const index = state.routines.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.routines[index] = action.payload;
        }
      })
      .addCase(updateRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.status = "failed";
        state.error = action.payload?.message ?? "Error desconocido";
      })
      // Delete Routine
      .addCase(deleteRoutine.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        state.routines = state.routines.filter((r) => r._id !== action.payload);
        state.selectedRoutineId = state.routines.length > 0 ? state.routines[0]._id : null;
      })
      .addCase(deleteRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        state.status = "failed";
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
        setAsyncLoading(state);
      })
      .addCase(generateRoutine.fulfilled, (state, action: PayloadAction<RoutineData>) => {
        setAsyncSucceeded(state);
        state.routines.push(action.payload);
        state.selectedRoutineId = action.payload._id;
      })
      .addCase(generateRoutine.rejected, (state, action: PayloadAction<ThunkError | undefined>) => {
        setAsyncFailed(state, action.payload?.message ?? "Error desconocido");
      });
  },
});

export default routineSlice.reducer;