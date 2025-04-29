import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { selectRoutine } from "../../store/routineSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { RoutineData } from "../../models/Routine";

export default function RoutineSelector({
  selectedDayId,
  setSelectedDayId,
  setSelectedDay,
}: {
  selectedDayId: string | null;
  setSelectedDayId: (id: string | null) => void;
  setSelectedDay: (day: RoutineData["days"][number]) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { routines, selectedRoutineId } = useSelector((state: RootState) => state.routine);

  return (
    <>
      <div className="flex overflow-x-auto space-x-2 mb-4 scrollbar-hidden">
        {routines.map((routine) => (
          <button
            key={routine._id.toString()}
            onClick={() => {
              dispatch(selectRoutine(routine._id.toString()));
              localStorage.setItem("routineId", routine._id.toString());
              const firstDay = routine.days[0];
              setSelectedDayId(firstDay ? firstDay._id.toString() : null);
              setSelectedDay(firstDay || { _id: "", dayName: "", exercises: [], musclesWorked: [], warmupOptions: [] });
            }}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors shadow-sm truncate max-w-[120px] ${
              selectedRoutineId === routine._id.toString() ? "bg-white text-black" : "bg-[#2D2D2D] text-[#B0B0B0] hover:bg-[#4A4A4A]"
            }`}
          >
            {routine.name}
          </button>
        ))}
      </div>
      {selectedRoutineId && (
        <div className="flex overflow-x-auto space-x-2 mb-4 scrollbar-hidden">
          {routines.find((r) => r._id === selectedRoutineId)?.days.map((day) => (
            <button
              key={day._id.toString()}
              onClick={() => {
                setSelectedDayId(day._id.toString());
                setSelectedDay(day);
              }}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors shadow-sm truncate max-w-[120px] ${
                selectedDayId === day._id.toString() ? "bg-white text-black" : "bg-[#2D2D2D] text-[#B0B0B0] hover:bg-[#4A4A4A]"
              }`}
            >
              {day.dayName}
            </button>
          ))}
        </div>
      )}
    </>
  );
}