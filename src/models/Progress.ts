export interface IProgress {
  _id: string;
  userId: string;
  routineId: string;
  routineName: string;
  dayId: string;
  dayName: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  repsUnit: "count" | "seconds";
  weightUnit: "kg" | "lb";
  weight: number;
  notes: string;
  date: Date;
  completed: boolean;
}
export interface ProgressData {
  _id: string;
  userId: string;
  routineId: string;
  routineName: string;
  dayId: string;
  dayName: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  repsUnit: "count" | "seconds";
  weightUnit: "kg" | "lb";
  weight: number;
  notes: string;
  date: Date;
  completed: boolean;
}