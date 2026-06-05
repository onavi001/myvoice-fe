import type { CoachAssignmentNotice } from "../../types/coach";
import Button from "../Button";

type Props = {
  assignments: CoachAssignmentNotice[];
  coachName?: string;
  onDismiss: (routineId: string) => void;
};

export default function CoachAssignmentAlerts({ assignments, coachName, onDismiss }: Props) {
  if (!assignments.length) return null;

  return (
    <div className="space-y-2 mb-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.routineId}
          className="rounded-xl border border-[#34C759]/40 bg-[#34C759]/10 p-4"
          role="status"
        >
          <p className="text-sm font-semibold text-[#E0E0E0]">
            Nueva rutina{coachName ? ` de ${coachName}` : ""}: {assignment.routineName}
          </p>
          {assignment.coachMessage ? (
            <p className="text-sm text-[#B0B0B0] mt-2 leading-relaxed whitespace-pre-wrap">
              “{assignment.coachMessage}”
            </p>
          ) : (
            <p className="text-xs text-[#888] mt-1">Tu coach te asignó un plan nuevo.</p>
          )}
          <Button
            type="button"
            onClick={() => onDismiss(assignment.routineId)}
            className="w-full min-h-10 rounded-lg mt-3 text-sm"
          >
            Entendido
          </Button>
        </div>
      ))}
    </div>
  );
}
