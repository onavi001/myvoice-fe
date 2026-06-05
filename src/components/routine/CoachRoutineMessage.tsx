import { useDispatch, useSelector } from "react-redux";
import { AcademicCapIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "../../store";
import { markAssignmentSeen } from "../../store/coachSlice";
import type { RoutineData } from "../../models/Routine";

type Props = {
  routine: RoutineData;
};

export default function CoachRoutineMessage({ routine }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);

  const isCoachRoutine = Boolean(routine.couchId && user?.coachId && routine.couchId === user.coachId);
  const message = routine.coachMessage?.trim();
  const isUnseen = isCoachRoutine && !routine.assignmentSeenAt;

  if (!isCoachRoutine || (!message && routine.assignmentSeenAt)) {
    return null;
  }

  const handleDismiss = () => {
    void dispatch(markAssignmentSeen(routine._id.toString()));
  };

  return (
    <section
      className="mb-4 rounded-xl border border-[#34C759]/35 bg-[#34C759]/10 p-3"
      aria-label="Mensaje de tu coach"
    >
      <div className="flex items-start gap-2">
        <AcademicCapIcon className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#34C759] uppercase tracking-wide">Tu coach</p>
          {message ? (
            <p className="text-sm text-[#E0E0E0] mt-1 leading-relaxed whitespace-pre-wrap">{message}</p>
          ) : (
            <p className="text-sm text-[#B0B0B0] mt-1">Te asignó esta rutina.</p>
          )}
        </div>
        {isUnseen && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 p-1.5 rounded-lg text-[#888] hover:text-[#E0E0E0] touch-manipulation min-h-9 min-w-9 flex items-center justify-center"
            aria-label="Cerrar mensaje"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}
