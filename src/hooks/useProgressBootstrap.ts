import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchRoutines } from "../store/routineSlice";
import { fetchProgress } from "../store/progressSlice";
import {
  selectProgressEntries,
  selectRoutineExerciseOptions,
  selectRoutineMuscleOptions,
  selectRoutines,
} from "../store/selectors";

export function useProgressBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const progress = useSelector(selectProgressEntries);
  const routines = useSelector(selectRoutines);
  const exerciseOptions = useSelector(selectRoutineExerciseOptions);
  const muscleOptions = useSelector(selectRoutineMuscleOptions);
  const { loading: progressLoading } = useSelector((state: RootState) => state.progress);
  const { loading: routineLoading } = useSelector((state: RootState) => state.routine);
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (token) {
      if (!routineLoading && routines.length === 0) dispatch(fetchRoutines());
      if (!progressLoading && progress.length === 0) dispatch(fetchProgress());
    } else {
      navigate("/login");
    }
  }, [token, routineLoading, progressLoading, routines.length, progress.length, dispatch, navigate]);

  return {
    progress,
    progressLoading,
    routines,
    exerciseOptions,
    muscleOptions,
    routineLoading,
    userLoading,
    navigate,
    dispatch,
  };
}

