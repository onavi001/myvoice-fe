import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchProgress } from "../store/progressSlice";
import { fetchRoutines } from "../store/routineSlice";

/**
 * Carga rutinas y progreso al iniciar sesión (status === "idle").
 * No reintenta en "failed" para evitar bucles con 429 u otros errores persistentes.
 */
export function useAppDataBootstrap() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const { status: routineStatus } = useSelector((state: RootState) => state.routine);
  const { status: progressStatus } = useSelector((state: RootState) => state.progress);

  useEffect(() => {
    if (!token) return;
    if (routineStatus === "idle") {
      void dispatch(fetchRoutines());
    }
    if (progressStatus === "idle") {
      void dispatch(fetchProgress());
    }
  }, [token, routineStatus, progressStatus, dispatch]);
}
