import ProgressBar from "../ProgressBar";
import { RoutineData } from "../../models/Routine";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { updateExerciseCompleted } from "../../store/routineSlice";

export default function DayProgress({ routine, day, dayId }: { routine: RoutineData; day: RoutineData["days"][number]; dayId: string }) {
  const dispatch = useDispatch<AppDispatch>();

  const calculateDayProgress = () => {
    const total = day.exercises.length;
    const completed = day.exercises.filter((ex) => ex.completed).length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const calculateWeekProgress = () => {
    const total = routine.days.reduce((sum, d) => sum + d.exercises.length, 0);
    const completed = routine.days.reduce((sum, d) => sum + d.exercises.filter((ex) => ex.completed).length, 0);
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const handleResetDayProgress = async () => {
    for (const exercise of day.exercises) {
      await dispatch(
        updateExerciseCompleted({
          routineId: routine._id.toString(),
          dayId: dayId,
          exerciseId: exercise._id.toString(),
          completed: false,
        })
      );
    }
  };

  const handleResetRoutineProgress = async () => {
    for (const day of routine.days) {
      for (const exercise of day.exercises) {
        await dispatch(
          updateExerciseCompleted({
            routineId: routine._id.toString(),
            dayId: day._id.toString(),
            exerciseId: exercise._id.toString(),
            completed: false,
          })
        );
      }
    }
  };

  return (
    <>
      <ProgressBar progress={calculateWeekProgress()} label="Progreso Semanal" resetFunction={handleResetRoutineProgress} />
      <ProgressBar progress={calculateDayProgress()} label="Progreso Día" resetFunction={handleResetDayProgress} />
    </>
  );
}