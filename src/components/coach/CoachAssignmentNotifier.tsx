import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchMyCoachOverview } from "../../store/coachSlice";
import { useCoachAssignmentAlerts } from "../../hooks/useCoachAssignmentAlerts";

/** Carga asignaciones pendientes y dispara notificación local (sin bloquear UI). */
export default function CoachAssignmentNotifier() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.user);
  const { myCoachOverview } = useSelector((state: RootState) => state.coach);

  useEffect(() => {
    if (!token || user?.role !== "user" || !user.coachId) return;
    void dispatch(fetchMyCoachOverview());
  }, [token, user?.role, user?.coachId, dispatch]);

  const pending =
    myCoachOverview?.status === "assigned" ? myCoachOverview.pendingAssignments ?? [] : [];

  useCoachAssignmentAlerts(pending);

  return null;
}
