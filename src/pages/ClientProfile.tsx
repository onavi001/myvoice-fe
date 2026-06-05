import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import {
  assignRoutine,
  fetchClientProfile,
  fetchClientProgress,
  fetchClientRoutines,
  removeClient,
  updateClientData,
} from "../store/coachSlice";
import Button from "../components/Button";
import { SmallLoader } from "../components/Loader";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/20/solid";
import AssignRoutineSheet from "../components/coach/AssignRoutineSheet";
import ClientProgressDashboard from "../components/coach/ClientProgressDashboard";
import ClientNotesEditor from "../components/coach/ClientNotesEditor";
import { fetchRoutines } from "../store/routineSlice";
import { selectCoachTemplates } from "../store/selectors";

export default function ClientProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { selectedClient, clientRoutines, clientProgress, clientProgressLoading, loading } =
    useSelector((state: RootState) => state.coach);
  const coachTemplates = useSelector(selectCoachTemplates);
  const [assignSheetOpen, setAssignSheetOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    dispatch(fetchClientProfile(clientId));
    dispatch(fetchClientRoutines(clientId));
    dispatch(fetchClientProgress(clientId));
  }, [clientId, dispatch]);

  useEffect(() => {
    if (!assignSheetOpen || coachTemplates.length > 0) return;
    void dispatch(fetchRoutines({ force: true }));
  }, [assignSheetOpen, coachTemplates.length, dispatch]);

  const handleAssignRoutine = async (routineId: string, message?: string) => {
    if (!clientId) return;
    setAssigning(true);
    try {
      await dispatch(assignRoutine({ clientId, routineId, message })).unwrap();
      await dispatch(fetchClientRoutines(clientId)).unwrap();
    } catch (err: unknown) {
      console.error("Error al asignar la rutina:", err);
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveNotes = async (payload: { goals: string; notes: string }) => {
    if (!clientId) return;
    setSavingNotes(true);
    try {
      await dispatch(updateClientData({ clientId, ...payload })).unwrap();
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRemoveClient = async () => {
    if (!clientId || !selectedClient) return;
    const confirmed = window.confirm(
      `¿Eliminar a ${selectedClient.username} de tu lista de clientes? El cliente conserva sus rutinas, pero ya no podrás ver su progreso ni asignarle planes.`
    );
    if (!confirmed) return;

    setRemoving(true);
    try {
      await dispatch(removeClient(clientId)).unwrap();
      navigate("/coach");
    } catch (err: unknown) {
      console.error("Error al eliminar cliente:", err);
    } finally {
      setRemoving(false);
    }
  };

  if (loading || !selectedClient) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-3">
        <SmallLoader />
        <p className="text-base">Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-4 max-w-lg mx-auto w-full flex-1 pb-8">
        <button
          type="button"
          onClick={() => navigate("/coach")}
          className="mb-4 flex items-center gap-1.5 text-sm text-[#B0B0B0] touch-manipulation min-h-10"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Clientes
        </button>

        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759]">Cliente</p>
          <h1 className="text-xl font-bold truncate">{selectedClient.username}</h1>
        </header>

        <ClientProgressDashboard
          progress={clientProgress}
          routines={clientRoutines}
          loading={clientProgressLoading}
        />

        <ClientNotesEditor
          client={selectedClient}
          saving={savingNotes}
          onSave={handleSaveNotes}
        />

        <div className="flex flex-col gap-2 mb-5">
          <Button
            type="button"
            onClick={() => setAssignSheetOpen(true)}
            className="w-full min-h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" aria-hidden />
            Asignar rutina
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/routine-form")}
            className="w-full min-h-11 rounded-xl text-sm"
          >
            Crear plantilla nueva
          </Button>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-[#E0E0E0] mb-2">
            Rutinas asignadas ({clientRoutines?.length ?? 0})
          </h2>
          {!clientRoutines?.length ? (
            <p className="text-sm text-[#888] text-center py-6">Aún no hay rutinas para este cliente.</p>
          ) : (
            <ul className="space-y-2">
              {clientRoutines.map((routine) => (
                <li
                  key={routine._id}
                  className="rounded-xl border border-[#3A3A3A] bg-[#252525] px-4 py-3 flex items-center justify-between gap-2"
                >
                  <p className="text-sm font-semibold truncate">{routine.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/routine-edit/${routine._id}`)}
                    className="shrink-0 text-xs min-h-9 px-3 rounded-lg"
                  >
                    Editar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-[#EF5350]/25 bg-[#252525] p-4">
          <p className="text-sm font-semibold text-[#E0E0E0] mb-1">Eliminar cliente</p>
          <p className="text-xs text-[#888] mb-3">
            El cliente mantiene sus rutinas y progreso. Solo se rompe el vínculo contigo.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveClient}
            disabled={removing}
            className="w-full min-h-11 rounded-xl text-sm text-[#FF8A80] border-[#EF5350]/40 hover:bg-[#EF5350]/10"
          >
            {removing ? "Eliminando…" : "Eliminar de mi lista"}
          </Button>
        </section>
      </div>

      <AssignRoutineSheet
        open={assignSheetOpen}
        onClose={() => setAssignSheetOpen(false)}
        routines={coachTemplates}
        assigning={assigning}
        onAssign={handleAssignRoutine}
      />
    </div>
  );
}
