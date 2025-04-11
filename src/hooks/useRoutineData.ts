import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchRoutines, selectRoutine } from "../store/routineSlice";
import { RoutineData } from "../models/Routine";

export default function useRoutineData(initialRoutines: RoutineData[]) {
  const dispatch = useDispatch<AppDispatch>();
  const { routines, selectedRoutineIndex, loading, error } = useSelector((state: RootState) => state.routine);
  const selectedRoutine = selectedRoutineIndex !== null ? routines[selectedRoutineIndex] : undefined;
  const storedDayIndex = localStorage.getItem("dayIndex");
  const initialDayIndex = storedDayIndex ? parseInt(storedDayIndex) : 0;
  const [selectedDay, setSelectedDay] = useState<RoutineData["days"][number] | undefined>(selectedRoutine?.days[initialDayIndex]);
  console.log(routines)
  useEffect(() => {
    if (routines.length > 0) {
      const routineIndex = localStorage.getItem("routineIndex");
      const index = routineIndex ? parseInt(routineIndex) : 0;
      if (index >= 0 && index < routines.length) {
        dispatch(selectRoutine(index));
        setSelectedDay(routines[index].days[initialDayIndex]);
      } else {
        dispatch(selectRoutine(0));
        setSelectedDay(routines[0].days[0]);
      }
    }
  }, [dispatch, routines]);

  useEffect(() => {
    if (initialRoutines && routines.length === 0) {
      dispatch(fetchRoutines.fulfilled(initialRoutines, "", undefined));
    } else if (routines.length === 0) {
      dispatch(fetchRoutines());
    }
  }, [dispatch, initialRoutines, routines.length]);

  const setSelectedDayIndex = (index: number) => {
    setSelectedDay(selectedRoutine?.days[index] || {} as RoutineData["days"][number]);
    //(selectedRoutine?.days[index] || {} as RoutineData["days"][number]);
    localStorage.setItem("dayIndex", index.toString());
  };

  return {
    loading,
    error,
    routines,
    selectedRoutine,
    selectedDay,
    selectedDayIndex: initialDayIndex,
    setSelectedDay,
    setSelectedDayIndex,
  };
}