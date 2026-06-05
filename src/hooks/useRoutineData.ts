/**
 * Hook personalizado para manejar la selección y persistencia de rutinas y días.
 * - Sincroniza con localStorage
 * - Expone rutina y día seleccionados
 */
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { selectRoutine, fetchRoutines } from "../store/routineSlice";
import { RoutineData } from "../models/Routine";
import { selectPersonalRoutines, selectSelectedRoutine } from "../store/selectors";

const asId = (value: unknown) => String(value ?? "");

export default function useRoutineData() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const { loading, error } = useSelector((state: RootState) => state.routine);
  const routines = useSelector(selectPersonalRoutines);
  const selectedRoutine = useSelector(selectSelectedRoutine);
  const storedDayId = localStorage.getItem("dayId");
  const [selectedDay, setSelectedDay] = useState<RoutineData["days"][number] | undefined>(
    selectedRoutine?.days.find((d) => d._id === storedDayId) || selectedRoutine?.days[0]
  );
  const [selectedDayId, setSelectedDayId] = useState<string | null>(storedDayId || selectedRoutine?.days[0]?._id?.toString() || null);
  const emptyRefetchAttempted = useRef(false);

  useEffect(() => {
    if (!token || loading || routines.length > 0) return;
    if (emptyRefetchAttempted.current) return;
    emptyRefetchAttempted.current = true;
    void dispatch(fetchRoutines({ force: true }));
  }, [token, loading, routines.length, dispatch]);

  useEffect(() => {
    if (routines.length === 0) {
      setSelectedDay(undefined);
      setSelectedDayId(null);
      return;
    }

    const routineId = localStorage.getItem("routineId");
    const routine = routines.find((r) => asId(r._id) === asId(routineId)) || routines[0];
    if (!routine) {
      dispatch(selectRoutine(""));
      setSelectedDay(undefined);
      setSelectedDayId(null);
      localStorage.removeItem("dayId");
      return;
    }

    const nextRoutineId = asId(routine._id);
    dispatch(selectRoutine(nextRoutineId));
    localStorage.setItem("routineId", nextRoutineId);

    const day = routine.days.find((d) => asId(d._id) === asId(storedDayId)) || routine.days[0];
    if (day) {
      setSelectedDay(day);
      setSelectedDayId(day._id.toString());
      localStorage.setItem("dayId", day._id.toString());
    } else {
      setSelectedDay(undefined);
      setSelectedDayId(null);
      localStorage.removeItem("dayId");
    }
  }, [dispatch, routines, storedDayId]);

  const setSelectedDayIdHandler = (id: string | null) => {
    if (selectedRoutine && id) {
      const day = selectedRoutine.days.find((d) => asId(d._id) === asId(id));
      setSelectedDay(day || undefined);
      setSelectedDayId(id);
      localStorage.setItem("dayId", id || "");
    } else {
      setSelectedDay(undefined);
      setSelectedDayId(null);
      localStorage.removeItem("dayId");
    }
  };

  return {
    loading,
    error,
    routines,
    selectedRoutine,
    selectedDay,
    selectedDayId,
    setSelectedDay,
    setSelectedDayId: setSelectedDayIdHandler,
  };
}