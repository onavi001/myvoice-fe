import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import { selectRoutine } from "../../store/routineSlice";
import { RootState } from "../../store";
import { RoutineData } from "../../models/Routine";
import { selectPersonalRoutines } from "../../store/selectors";

const asId = (value: unknown) => String(value ?? "");

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
  const routines = useSelector(selectPersonalRoutines);
  const { selectedRoutineId } = useSelector((state: RootState) => state.routine);
  const { user } = useSelector((state: RootState) => state.user);
  const coachId = user?.coachId;

  return (
    <>
      <div className="flex overflow-x-auto space-x-2 mb-4 scrollbar-hidden">
        {routines.map((routine) => {
          const routineId = asId(routine._id);
          const isCoachRoutine = Boolean(coachId && routine.couchId && routine.couchId === coachId);
          return (
          <button
            key={routineId}
            onClick={() => {
              dispatch(selectRoutine(routineId));
              localStorage.setItem("routineId", routineId);
              const firstDay = routine.days[0];
              setSelectedDayId(firstDay ? firstDay._id.toString() : null);
              setSelectedDay(firstDay || { _id: "", dayName: "", exercises: [], musclesWorked: [], warmupOptions: [] });
            }}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors shadow-sm truncate max-w-[140px] flex items-center gap-1 ${
              asId(selectedRoutineId) === routineId
                ? "bg-white text-black"
                : "bg-[#2D2D2D] text-[#B0B0B0] hover:bg-[#4A4A4A]"
            }`}
          >
            {isCoachRoutine && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#34C759]" aria-hidden />
            )}
            <span className="truncate">{routine.name}</span>
          </button>
          );
        })}
      </div>
      {selectedRoutineId && (
        <div className="flex overflow-x-auto space-x-2 mb-4 scrollbar-hidden">
          {routines
            .find((r) => asId(r._id) === asId(selectedRoutineId))
            ?.days.map((day) => (
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