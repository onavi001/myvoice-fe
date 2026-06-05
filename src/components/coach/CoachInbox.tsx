import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRightIcon,
  CheckIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { RootState } from "../../store";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { acceptCoachRequest, fetchCoachProfile, rejectCoachRequest } from "../../store/coachSlice";
import { useMemo, useState } from "react";
import { SmallLoader } from "../Loader";
import { formatTrainingProfileSummary } from "../training/TrainingProfileFields";
import type { CoachClientSummary } from "../../types/coach";
import { formatRelativeSessionLabel } from "../../utils/coachProgressView";
import CoachInviteCard from "./CoachInviteCard";

const INACTIVE_DAYS_THRESHOLD = 7;

function isClientInactive(client: CoachClientSummary): boolean {
  const days = client.activity?.daysSinceLastSession;
  return days == null || days >= INACTIVE_DAYS_THRESHOLD;
}

function ClientRow({ client, onOpen }: { client: CoachClientSummary; onOpen: () => void }) {
  const initial = (client.username?.[0] ?? "?").toUpperCase();
  const routineSubtitle =
    client.assignedRoutineCount != null && client.assignedRoutineCount > 0
      ? `${client.assignedRoutineCount} rutina${client.assignedRoutineCount === 1 ? "" : "s"}`
      : "Sin rutinas";

  const activityLabel = formatRelativeSessionLabel(client.activity?.daysSinceLastSession);
  const isInactive = isClientInactive(client);
  const weekDays = client.activity?.weekTrainingDays ?? 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-3 rounded-xl border border-[#3A3A3A] bg-[#252525] px-3 py-3 touch-manipulation min-h-[4.5rem] text-left hover:border-[#34C759]/40 transition-colors"
    >
      <span
        className="w-11 h-11 shrink-0 rounded-full bg-[#34C759]/20 text-[#34C759] font-bold text-lg flex items-center justify-center"
        aria-hidden
      >
        {initial}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-[#E0E0E0] truncate">{client.username}</span>
        <span className="block text-xs text-[#888] truncate">
          {routineSubtitle}
          {weekDays > 0 ? ` · ${weekDays}d esta semana` : ""}
        </span>
        <span
          className={`block text-[11px] mt-0.5 truncate ${
            isInactive ? "text-[#FF8A80]" : "text-[#666]"
          }`}
        >
          {activityLabel}
        </span>
      </span>
      <ArrowRightIcon className="w-5 h-5 text-[#666] shrink-0" aria-hidden />
    </button>
  );
}

export default function CoachInbox() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { clients, requests, coachProfile, coachProfileLoading, error, loading } = useSelector(
    (state: RootState) => state.coach
  );
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  const inactiveCount = useMemo(
    () => clients.filter(isClientInactive).length,
    [clients]
  );

  const visibleClients = useMemo(() => {
    if (!showInactiveOnly) return clients;
    return clients.filter(isClientInactive);
  }, [clients, showInactiveOnly]);

  const handleAccept = async (userId: string) => {
    if (coachProfile?.atLimit) {
      setActionError(`Límite de clientes alcanzado (${coachProfile.clientLimit})`);
      return;
    }
    setAccepting(userId);
    setActionError(null);
    try {
      await dispatch(acceptCoachRequest(userId)).unwrap();
      void dispatch(fetchCoachProfile());
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err && typeof err.message === "string"
          ? err.message
          : "No se pudo aceptar la solicitud";
      setActionError(message);
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (userId: string) => {
    setRejecting(userId);
    setActionError(null);
    try {
      await dispatch(rejectCoachRequest(userId)).unwrap();
    } catch {
      setActionError("No se pudo rechazar la solicitud");
    } finally {
      setRejecting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <SmallLoader />
        <p className="text-sm text-[#888]">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto w-full pb-8">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759]">Coach</p>
        <h1 className="text-xl font-bold text-[#E0E0E0] mt-0.5">Mis clientes</h1>
        <p className="text-xs text-[#888] mt-1">Gestiona solicitudes, progreso y rutinas.</p>
      </header>

      {(error || actionError) && (
        <p className="text-sm text-[#FF8A80] mb-4 text-center" role="alert">
          {error || actionError}
        </p>
      )}

      <CoachInviteCard profile={coachProfile} loading={coachProfileLoading} />

      {coachProfile?.atLimit && requests.length > 0 && (
        <p className="text-xs text-[#FF8A80] mb-4 text-center">
          Has alcanzado el límite de clientes. No puedes aceptar nuevas solicitudes.
        </p>
      )}

      {requests.length > 0 && (
        <section className="mb-6" aria-labelledby="coach-requests-heading">
          <h2 id="coach-requests-heading" className="text-sm font-semibold text-[#5DD4F7] mb-2">
            Solicitudes ({requests.length})
          </h2>
          <div className="space-y-2">
            {requests.map((req) => {
              const uid = req.userId._id;
              const busy = accepting === uid || rejecting === uid;
              const acceptDisabled = busy || coachProfile?.atLimit;
              return (
                <div
                  key={req._id}
                  className="rounded-xl border border-[#5DD4F7]/30 bg-[#252525] p-3"
                >
                  <p className="text-sm font-semibold text-[#E0E0E0]">{req.userId.username}</p>
                  {req.userId.bio ? (
                    <p className="text-xs text-[#B0B0B0] mt-2 leading-relaxed line-clamp-3">{req.userId.bio}</p>
                  ) : null}
                  {req.userId.goals && req.userId.goals.length > 0 ? (
                    <p className="text-xs text-[#888] mt-1.5">
                      <span className="text-[#666]">Objetivos:</span> {req.userId.goals.join(", ")}
                    </p>
                  ) : null}
                  {req.userId.notes ? (
                    <p className="text-xs text-[#888] mt-1.5 leading-relaxed line-clamp-2">
                      <span className="text-[#666]">Notas:</span> {req.userId.notes}
                    </p>
                  ) : null}
                  {req.userId.trainingProfile ? (
                    <p className="text-xs text-[#888] mt-1.5">
                      <span className="text-[#666]">Entrenamiento:</span>{" "}
                      {formatTrainingProfileSummary(req.userId.trainingProfile)}
                    </p>
                  ) : null}
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      disabled={acceptDisabled}
                      onClick={() => void handleAccept(uid)}
                      className="flex-1 min-h-10 rounded-lg bg-[#34C759] text-black text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-60 touch-manipulation"
                    >
                      {accepting === uid ? (
                        <SmallLoader />
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4" /> Aceptar
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleReject(uid)}
                      className="flex-1 min-h-10 rounded-lg border border-[#EF5350]/50 text-[#FF8A80] text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-60 touch-manipulation"
                    >
                      {rejecting === uid ? (
                        <SmallLoader />
                      ) : (
                        <>
                          <XMarkIcon className="w-4 h-4" /> Rechazar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="coach-clients-heading">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 id="coach-clients-heading" className="text-sm font-semibold text-[#E0E0E0] flex items-center gap-1.5">
            <UserGroupIcon className="w-4 h-4 text-[#34C759]" aria-hidden />
            Clientes ({visibleClients.length})
          </h2>
          {clients.length > 0 && (
            <button
              type="button"
              onClick={() => setShowInactiveOnly((v) => !v)}
              className={`text-xs px-2.5 py-1.5 rounded-full border touch-manipulation min-h-9 ${
                showInactiveOnly
                  ? "border-[#FF8A80]/50 text-[#FF8A80] bg-[#FF8A80]/10"
                  : "border-[#3A3A3A] text-[#888]"
              }`}
            >
              Inactivos 7+ días{inactiveCount > 0 ? ` (${inactiveCount})` : ""}
            </button>
          )}
        </div>
        {visibleClients.length === 0 ? (
          <p className="text-sm text-[#888] text-center py-8">
            {showInactiveOnly
              ? "Ningún cliente lleva 7+ días sin entrenar."
              : requests.length > 0
                ? "Acepta solicitudes para añadir clientes."
                : "Aún no tienes clientes asignados."}
          </p>
        ) : (
          <div className="space-y-2">
            {visibleClients.map((client) => (
              <ClientRow
                key={client._id}
                client={client as CoachClientSummary}
                onOpen={() => navigate(`/coach/client/${client._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
