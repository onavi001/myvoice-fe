import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "../store";
import { fetchMyCoachOverview, leaveCoach, markAssignmentSeen } from "../store/coachSlice";
import { clearCoachRoutineMarkers } from "../store/routineSlice";
import { SmallLoader } from "../components/Loader";
import Button from "../components/Button";
import CoachAssignmentAlerts from "../components/coach/CoachAssignmentAlerts";
import { useCoachAssignmentAlerts } from "../hooks/useCoachAssignmentAlerts";
import { calculateWeekProgress } from "../utils/calculateProgress";

export default function MyCoach() {
  const [leaving, setLeaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.user);
  const { myCoachOverview, loading, error } = useSelector((state: RootState) => state.coach);
  const { routines } = useSelector((state: RootState) => state.routine);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (user?.role === "coach") {
      navigate("/coach");
      return;
    }
    if (user?.role !== "user") {
      navigate("/home");
      return;
    }
    void dispatch(fetchMyCoachOverview());
  }, [token, user?.role, dispatch, navigate]);

  const coachRoutines = routines.filter(
    (r) => r.couchId && user?.coachId && r.couchId === user.coachId
  );

  const pendingAssignments =
    myCoachOverview?.status === "assigned" ? myCoachOverview.pendingAssignments ?? [] : [];

  useCoachAssignmentAlerts(pendingAssignments);

  const handleDismissAssignment = (routineId: string) => {
    void dispatch(markAssignmentSeen(routineId));
  };

  const handleLeaveCoach = async () => {
    const coachName = myCoachOverview?.status === "assigned" ? myCoachOverview.coach.username : "tu coach";
    const confirmed = window.confirm(
      myCoachOverview?.status === "pending"
        ? "¿Cancelar tu solicitud pendiente?"
        : `¿Dejar de trabajar con ${coachName}? Tus rutinas se quedan contigo, pero ya no verás mensajes del coach.`
    );
    if (!confirmed) return;

    setLeaving(true);
    try {
      const result = await dispatch(leaveCoach()).unwrap();
      if (result.action === "left" && result.coachId) {
        dispatch(clearCoachRoutineMarkers({ coachId: result.coachId }));
      }
    } catch {
      // error shown via coach slice
    } finally {
      setLeaving(false);
    }
  };

  if (loading && !myCoachOverview) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <SmallLoader />
        <p className="text-sm text-[#888]">Cargando…</p>
      </div>
    );
  }

  const goFindCoach = () => navigate("/coaches");
  const goTrain = () => {
    if (coachRoutines.length > 0) {
      navigate("/routine");
    } else {
      navigate("/routine");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0]">
      <div className="p-4 max-w-lg mx-auto pb-10">
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mb-4 flex items-center gap-1.5 text-sm text-[#B0B0B0] touch-manipulation min-h-10"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Inicio
        </button>

        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759]">Mi coach</p>
          <h1 className="text-xl font-bold mt-0.5">Tu entrenador</h1>
        </header>

        {error && (
          <p className="text-sm text-[#FF8A80] mb-4 text-center" role="alert">
            {error}
          </p>
        )}

        {myCoachOverview?.status === "none" && (
          <div className="rounded-2xl border border-[#3A3A3A] bg-[#252525] p-5 text-center">
            <p className="text-sm text-[#B0B0B0] mb-4">
              Aún no tienes coach. Explora entrenadores o usa un código de invitación.
            </p>
            <div className="flex flex-col gap-2">
              <Button type="button" onClick={goFindCoach} className="w-full min-h-12 rounded-xl">
                <UserPlusIcon className="w-5 h-5 inline mr-1" aria-hidden />
                Buscar coach
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/join-coach")}
                className="w-full min-h-11 rounded-xl text-sm"
              >
                Tengo un código
              </Button>
            </div>
          </div>
        )}

        {myCoachOverview?.status === "pending" && (
          <div className="rounded-2xl border border-[#5DD4F7]/30 bg-[#252525] p-5">
            <div className="flex items-start gap-3 mb-3">
              <ClockIcon className="w-6 h-6 text-[#5DD4F7] shrink-0" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-[#E0E0E0]">Solicitud pendiente</p>
                <p className="text-xs text-[#888] mt-1">
                  Esperando respuesta de{" "}
                  <span className="text-[#E0E0E0]">
                    {myCoachOverview.pendingRequest.coach?.username ?? "tu coach"}
                  </span>
                </p>
              </div>
            </div>
            {myCoachOverview.pendingRequest.coach?.bio && (
              <p className="text-xs text-[#B0B0B0] leading-relaxed">
                {myCoachOverview.pendingRequest.coach.bio}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={goFindCoach}
              className="w-full min-h-11 rounded-xl mt-4 text-sm"
            >
              Ver otros coaches
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleLeaveCoach}
              disabled={leaving}
              className="w-full min-h-11 rounded-xl mt-2 text-sm text-[#FF8A80] border-[#EF5350]/40 hover:bg-[#EF5350]/10"
            >
              {leaving ? "Cancelando…" : "Cancelar solicitud"}
            </Button>
          </div>
        )}

        {myCoachOverview?.status === "assigned" && (
          <>
            <CoachAssignmentAlerts
              assignments={pendingAssignments}
              coachName={myCoachOverview.coach.username}
              onDismiss={handleDismissAssignment}
            />

            <div className="rounded-2xl border border-[#34C759]/30 bg-[#252525] p-5 mb-4">
              <p className="text-lg font-bold text-[#E0E0E0]">{myCoachOverview.coach.username}</p>
              {myCoachOverview.coach.specialties &&
                myCoachOverview.coach.specialties.length > 0 && (
                  <p className="text-xs text-[#B0B0B0] mt-2">
                    {myCoachOverview.coach.specialties.join(" · ")}
                  </p>
                )}
              {myCoachOverview.coach.bio && (
                <p className="text-sm text-[#B0B0B0] mt-3 leading-relaxed">{myCoachOverview.coach.bio}</p>
              )}
            </div>

            <div className="rounded-xl border border-[#3A3A3A] bg-[#1f1f1f] p-4 mb-4">
              <p className="text-xs text-[#888] uppercase tracking-wide">Rutinas de tu coach</p>
              <p className="text-2xl font-bold text-[#34C759] tabular-nums mt-1">
                {myCoachOverview.assignedRoutineCount}
              </p>
            </div>

            {coachRoutines.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {coachRoutines.map((routine) => {
                  const pct = Math.round(calculateWeekProgress(routine));
                  return (
                    <li
                      key={routine._id}
                      className="rounded-xl border border-[#3A3A3A] bg-[#252525] px-4 py-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{routine.name}</p>
                        <p className="text-xs text-[#888]">
                          Por tu coach · {pct}% semana
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30 shrink-0">
                        Coach
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[#888] mb-4 text-center">
                Tu coach aún no te ha asignado una rutina.
              </p>
            )}

            <Button type="button" onClick={goTrain} className="w-full min-h-12 rounded-xl font-semibold">
              Ir a entrenar
              <ArrowRightIcon className="w-5 h-5 inline ml-1" aria-hidden />
            </Button>

            <section className="mt-8 rounded-2xl border border-[#EF5350]/25 bg-[#252525] p-4">
              <p className="text-sm font-semibold text-[#E0E0E0] mb-1">Dejar al coach</p>
              <p className="text-xs text-[#888] mb-3">
                Tus rutinas y progreso se mantienen. Solo dejas de estar vinculado.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleLeaveCoach}
                disabled={leaving}
                className="w-full min-h-11 rounded-xl text-sm text-[#FF8A80] border-[#EF5350]/40 hover:bg-[#EF5350]/10"
              >
                {leaving ? "Procesando…" : "Dejar de trabajar con este coach"}
              </Button>
            </section>
          </>
        )}

        {user?.role === "user" && (
          <section className="mt-8 rounded-2xl border border-[#5DD4F7]/25 bg-[#252525] p-4">
            <p className="text-sm font-semibold text-[#E0E0E0] mb-1">¿Quieres ser coach?</p>
            <p className="text-xs text-[#888] mb-3">
              Gestiona clientes y asigna rutinas desde el móvil.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/become-coach")}
              className="w-full min-h-11 rounded-xl text-sm"
            >
              Solicitar ser coach
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
