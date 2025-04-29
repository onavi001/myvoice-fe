import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchRoutines, selectRoutine } from "../store/routineSlice";
import { RoutineData } from "../models/Routine";

export default function useRoutineData(initialRoutines: RoutineData[]) {
  const dispatch = useDispatch<AppDispatch>();
  const { routines, selectedRoutineId, loading, error } = useSelector((state: RootState) => state.routine);
  const selectedRoutine = routines.find((r) => r._id === selectedRoutineId) || undefined;
  const storedDayId = localStorage.getItem("dayId");
  const [selectedDay, setSelectedDay] = useState<RoutineData["days"][number] | undefined>(
    selectedRoutine?.days.find((d) => d._id === storedDayId) || selectedRoutine?.days[0]
  );
  const [selectedDayId, setSelectedDayId] = useState<string | null>(storedDayId || selectedRoutine?.days[0]?._id?.toString() || null);

  useEffect(() => {
    if (routines.length > 0) {
      const routineId = localStorage.getItem("routineId");
      const routine = routines.find((r) => r._id === routineId) || routines[0];
      if (routine) {
        dispatch(selectRoutine(routine._id.toString()));
        const day = routine.days.find((d) => d._id === storedDayId) || routine.days[0];
        if (day) {
          setSelectedDay(day);
          setSelectedDayId(day._id.toString());
          localStorage.setItem("dayId", day._id.toString());
        } else {
          setSelectedDay(undefined);
          setSelectedDayId(null);
          localStorage.removeItem("dayId");
        }
      } else {
        dispatch(selectRoutine(""));
        setSelectedDay(undefined);
        setSelectedDayId(null);
        localStorage.removeItem("dayId");
      }
    }
  }, [dispatch, routines, storedDayId]);

  useEffect(() => {
    if (initialRoutines && routines.length === 0) {
      dispatch(fetchRoutines.fulfilled(initialRoutines, "", undefined));
    } else if (routines.length === 0) {
      dispatch(fetchRoutines());
    }
  }, [dispatch, initialRoutines, routines.length]);

  const setSelectedDayIdHandler = (id: string | null) => {
    if (selectedRoutine && id) {
      const day = selectedRoutine.days.find((d) => d._id === id);
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