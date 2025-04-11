import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { selectRoutine } from "../../store/routineSlice";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { RoutineData } from "../../models/Routine";

export default function RoutineSelector({
  selectedDayIndex,
  setSelectedDayIndex,
  setSelectedDay,
}: {
  selectedDayIndex: number;
  setSelectedDayIndex: (index: number) => void;
  setSelectedDay: (day: RoutineData["days"][number]) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { routines, selectedRoutineIndex } = useSelector((state: RootState) => state.routine);

  return (
    <>
      <div className="flex overflow-x-auto space-x-2 mb-4 scrollbar-hidden">
        {routines.map((routine, index) => (
          <button
            key={routine._id.toString()}
            onClick={() => {
              dispatch(selectRoutine(index));
              localStorage.setItem("routineIndex", index.toString());
              setSelectedDayIndex(0);
              setSelectedDay(routine.days[0]);
            }}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors shadow-sm truncate max-w-[120px] ${
              selectedRoutineIndex === index ? "bg-white text-black" : "bg-[#2D2D2D] text-[#B0B0B0] hover:bg-[#4A4A4A]"
            }`}
          >
            {routine.name}
          </button>
        ))}
      </div>
      {selectedRoutineIndex !== null && (
        <div className="flex overflow-x-auto space-x-2 mb-4 scrollbar-hidden">
          {routines[selectedRoutineIndex].days.map((day, index) => (
            <button
              key={day._id.toString()}
              onClick={() => {
                setSelectedDayIndex(index);
              }}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors shadow-sm truncate max-w-[120px] ${
                selectedDayIndex === index ? "bg-white text-black" : "bg-[#2D2D2D] text-[#B0B0B0] hover:bg-[#4A4A4A]"
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