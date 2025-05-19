import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import {
  assignRoutine,
  fetchClientProfile,
  fetchClientRoutines,
  updateClientData,
} from "../store/coachSlice";
import { fetchRoutines } from "../store/routineSlice";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import { SmallLoader } from "../components/Loader";
import { ArrowLeftIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

export default function ClientProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { selectedClient, clientRoutines, loading } = useSelector((state: RootState) => state.coach);
  const { routines } = useSelector((state: RootState) => state.routine);
  const [notes, setNotes] = useState("");
  const [goals, setGoals] = useState("");
  const [selectedRoutineId, setSelectedRoutineId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const [errors, setErrors] = useState<{ goals?: string; notes?: string }>({});

  useEffect(() => {
    if (!clientId) return;

    dispatch(fetchClientProfile(clientId));
    dispatch(fetchClientRoutines(clientId));
    dispatch(fetchRoutines());
  }, [clientId, dispatch]);

  useEffect(() => {
    if (selectedClient) {
      setNotes(selectedClient.notes || "");
      setGoals(selectedClient.goals?.join(", ") || "");
    }
  }, [selectedClient]);

  const handleAssignRoutine = async () => {
    if (!selectedRoutineId || !clientId) return;
    const routine = routines.find((r) => r._id === selectedRoutineId);
    if (!routine) return;
    setAssigning(true);
    try {
      await dispatch(assignRoutine({ clientId, routineId: selectedRoutineId })).unwrap();
      await dispatch(fetchClientRoutines(clientId)).unwrap();
      setSelectedRoutineId("");
    } catch (err) {
      console.error(err);
      setErrors({ notes: "Error al asignar la rutina" });
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveData = async () => {
    if (!clientId) return;
    const newErrors: { goals?: string; notes?: string } = {};
    if (!goals.trim()) newErrors.goals = "Los objetivos son obligatorios";
    if (!notes.trim()) newErrors.notes = "Las notas son obligatorias";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSavingData(true);
    setErrors({});
    try {
      await dispatch(updateClientData({ clientId, goals, notes })).unwrap();
    } catch (err) {
      console.error(err);
      setErrors({ notes: "Error al guardar los datos" });
    } finally {
      setSavingData(false);
    }
  };

  if (loading || !selectedClient) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-3">
        <SmallLoader />
        <p className="text-[#E0E0E0] text-base">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-3 sm:p-6 w-full mx-2 sm:max-w-3xl sm:mx-auto flex-1">
        <Button
          variant="secondary"
          onClick={() => navigate("/coach")}
          className="mb-6 bg-[#4A4A4A] text-[#E0E0E0] active:bg-[#5A5A5A]/80 rounded-lg px-5 py-3 text-base font-semibold border border-[#4A4A4A] shadow-md transition-colors flex items-center gap-2 min-h-12"
        >
          <ArrowLeftIcon className="w-6 h-6" /> Volver a Clientes
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">Perfil de {selectedClient.username}</h1>

        <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#FFD700] mb-4">Información del Cliente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Nombre</label>
              <p className="text-[#E0E0E0] text-base">{selectedClient.username}</p>
            </div>
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Email</label>
              <p className="text-[#E0E0E0] text-base">{selectedClient.email}</p>
            </div>
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Objetivos</label>
              <Input
                name="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Fuerza, Resistencia, etc."
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
              />
              {errors.goals && <p className="text-red-500 text-sm mt-1">{errors.goals}</p>}
            </div>
            <div>
              <label className="block text-[#E0E0E0] text-base font-medium mb-1">Notas del Cliente</label>
              <Textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Añade notas sobre el cliente..."
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-[#E0E0E0] placeholder-[#CCCCCC] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors h-28 resize-none"
              />
              {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
            </div>
            <Button
              onClick={handleSaveData}
              disabled={savingData}
              className="w-full bg-[#66BB6A] text-black active:bg-[#4CAF50]/80 rounded-lg py-3 px-5 text-base font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/90 disabled:opacity-80 disabled:cursor-not-allowed transition-colors min-h-12"
            >
              {savingData ? <SmallLoader /> : "Guardar Cambios"}
            </Button>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#FFD700] mb-4">Asignar Rutina</h2>
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <select
                value={selectedRoutineId}
                onChange={(e) => setSelectedRoutineId(e.target.value)}
                className="w-full bg-[#333333] border border-[#4A4A4A] text-[#E0E0E0] rounded-lg p-4 text-base focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors appearance-none"
              >
                <option value="">Selecciona una rutina</option>
                {routines.map((routine) => (
                  <option key={routine._id} value={routine._id}>
                    {routine.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#34C759]" />
            </div>
            <Button
              onClick={handleAssignRoutine}
              disabled={assigning || !selectedRoutineId}
              className="w-full bg-[#34C759] text-black active:bg-[#4CAF50]/80 rounded-lg py-3 px-5 text-base font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/90 disabled:opacity-80 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-12"
            >
              {assigning ? <SmallLoader /> : <><PlusIcon className="w-6 h-6" /> Asignar</>}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/routine-form")}
              className="w-full bg-[#42A5F5] text-black active:bg-[#1E88E5]/80 rounded-lg py-3 px-5 text-base font-semibold border border-[#1E88E5] shadow-md transition-colors flex items-center justify-center gap-2 min-h-12"
            >
              <PlusIcon className="w-6 h-6" /> Crear Rutina
            </Button>
          </div>
        </Card>

        <Card className="p-3 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold text-[#FFD700] mb-4">Rutinas Asignadas</h2>
          {clientRoutines && clientRoutines.length === 0 ? (
            <p className="text-[#E0E0E0] text-base">No hay rutinas asignadas.</p>
          ) : (
            <div className="space-y-3">
              {clientRoutines.map((routine, index) => (
                <Card
                  key={routine._id}
                  className={`p-3 bg-${index % 2 === 0 ? "[#252525]" : "[#282828]"} border border-[#4A4A4A] rounded-lg shadow-sm transition-shadow duration-300`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-[#E0E0E0]">{routine.name}</h3>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/routine-edit/${routine._id}`)}
                      className="bg-[#FFD700] text-black active:bg-[#FFC107]/80 rounded-lg px-4 py-2 text-base font-semibold border border-[#FFC107] shadow-md transition-colors min-h-12"
                    >
                      Ver/Editar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}