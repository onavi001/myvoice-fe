import ProgressBar from "../ProgressBar";
import { RoutineData } from "../../models/Routine";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { updateExerciseCompleted } from "../../store/routineSlice";

export default function DayProgress({ routine, day }: { routine: RoutineData; day: RoutineData["days"][number] }) {
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
    for (let i = 0; i < day.exercises.length; i++) {
      await dispatch(
        updateExerciseCompleted({
          routineId: routine._id.toString(),
          dayIndex: routine.days.indexOf(day),
          exerciseIndex: i,
          completed: false,
        })
      );
    }
  };

  const handleResetRoutineProgress = async () => {
    for (let i = 0; i < routine.days.length; i++) {
      for (let j = 0; j < routine.days[i].exercises.length; j++) {
        await dispatch(
          updateExerciseCompleted({
            routineId: routine._id.toString(),
            dayIndex: i,
            exerciseIndex: j,
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