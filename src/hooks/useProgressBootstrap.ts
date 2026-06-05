import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  selectPersonalRoutines,
  selectProgressEntries,
  selectRoutineExerciseOptions,
  selectRoutineMuscleOptions,
} from "../store/selectors";

/** Lee rutinas/progreso ya cargados por useAppDataBootstrap (sin fetch propio). */
export function useProgressBootstrap() {
  const navigate = useNavigate();
  const progress = useSelector(selectProgressEntries);
  const routines = useSelector(selectPersonalRoutines);
  const exerciseOptions = useSelector(selectRoutineExerciseOptions);
  const muscleOptions = useSelector(selectRoutineMuscleOptions);
  const { loading: progressLoading, status: progressStatus } = useSelector(
    (state: RootState) => state.progress
  );
  const { loading: routineLoading, status: routineStatus } = useSelector(
    (state: RootState) => state.routine
  );
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);

  return {
    progress,
    progressLoading,
    routines,
    exerciseOptions,
    muscleOptions,
    routineLoading,
    userLoading,
    navigate,
    progressStatus,
    routineStatus,
    token,
  };
}
