import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import type { CoachAssignmentNotice } from "../types/coach";

const NOTIFICATION_ID_BASE = 9000;

async function notifyNativeAssignment(assignment: CoachAssignmentNotice) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;

    const id = NOTIFICATION_ID_BASE + (Number.parseInt(assignment.routineId.slice(-4), 16) % 1000);
    const body = assignment.coachMessage?.trim()
      ? assignment.coachMessage.trim()
      : `Tu coach te asignó "${assignment.routineName}".`;

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: "Nueva rutina de tu coach",
          body: body.slice(0, 180),
          schedule: { at: new Date(Date.now() + 500) },
        },
      ],
    });
  } catch {
    /* ignore notification errors */
  }
}

export function useCoachAssignmentAlerts(assignments: CoachAssignmentNotice[] | undefined) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!assignments?.length) return;

    for (const assignment of assignments) {
      if (notifiedRef.current.has(assignment.routineId)) continue;
      notifiedRef.current.add(assignment.routineId);
      void notifyNativeAssignment(assignment);
    }
  }, [assignments]);
}
