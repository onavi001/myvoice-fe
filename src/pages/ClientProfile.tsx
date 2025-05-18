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

export default function ClientProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  console.log(clientId)
  const { selectedClient, clientRoutines, loading, error } = useSelector((state: RootState) => state.coach);
  const { routines } = useSelector((state: RootState) => state.routine);
  const [notes, setNotes] = useState("");
  const [goals, setGoals] = useState("");
  const [selectedRoutineId, setSelectedRoutineId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [savingData, setSavingData] = useState(false);
  
  useEffect(() => {
    if (!clientId) return;

    dispatch(fetchClientProfile(clientId));
    dispatch(fetchClientRoutines(clientId));
    dispatch(fetchRoutines());

  }, []);

  useEffect(() => {
    if (selectedClient) {
      console.log("Updating local state from selectedClient");
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
    } finally {
      setAssigning(false);
    }
  };

  const handleSaveData = async () => {
    if (!clientId) return;
    setSavingData(true);
    try {
      const goalsArray = goals ? goals.split(",").map((g) => g.trim()) : [];
      await dispatch(updateClientData({ clientId, goals: goalsArray, notes })).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingData(false);
    }
  };

  if (loading || !selectedClient) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center">
        <SmallLoader />
        <p className="text-[#D1D1D1] text-sm mt-4">Cargando perfil...</p>
      </div>
    );
  }
  console.log("Selected clientRoutines:", clientRoutines);
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
      <Button
        variant="secondary"
        onClick={() => navigate("/coach")}
        className="mb-6 bg-[#4A4A4A] text-white hover:bg-[#5A5A5A] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4A4A4A] shadow-md transition-colors"
      >
        ← Volver a Clientes
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Perfil de {selectedClient.username}</h1>
      {error && <p className="text-red-500 text-sm font-medium text-center mb-4">{error}</p>}

      <Card className="p-4 sm:p-6 bg-[#303030] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-[#FFD700] mb-4">Información del Cliente</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[#D1D1D1] text-sm font-medium">Nombre</label>
            <p className="text-white">{selectedClient.username}</p>
          </div>
          <div>
            <label className="block text-[#D1D1D1] text-sm font-medium">Email</label>
            <p className="text-white">{selectedClient.email}</p>
          </div>
          <div>
            <label className="block text-[#D1D1D1] text-sm font-medium mb-2">Objetivos</label>
            <Input
              name="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Fuerza, Resistencia, etc."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-[#D1D1D1] text-sm font-medium mb-2">Notas del Coach</label>
            <Textarea
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade notas sobre el cliente..."
              className="w-full"
            />
          </div>
          <Button
            onClick={handleSaveData}
            disabled={savingData || (goals === (selectedClient.goals?.join(", ") || "") && notes === (selectedClient.notes || ""))}
            className="bg-[#66BB6A] text-black hover:bg-[#4CAF50] disabled:bg-[#4CAF50]/50"
          >
            {savingData ? <SmallLoader /> : "Guardar Cambios"}
          </Button>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-[#FFD700] mb-4">Asignar Rutina</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedRoutineId}
            onChange={(e) => setSelectedRoutineId(e.target.value)}
            className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:border-transparent transition-colors"
          >
            <option value="">Selecciona una rutina</option>
            {routines.map((routine) => (
              <option key={routine._id} value={routine._id}>
                {routine.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleAssignRoutine}
            disabled={assigning || !selectedRoutineId}
            className="bg-[#34C759] text-black hover:bg-[#4CAF50] disabled:bg-[#4CAF50]/50"
          >
            {assigning ? <SmallLoader /> : "Asignar"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/routine-form")}
            className="bg-[#42A5F5] text-black hover:bg-[#1E88E5] border-[#1E88E5]"
          >
            Crear Nueva Rutina
          </Button>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-[#FFD700] mb-4">Rutinas Asignadas</h2>
        {clientRoutines && clientRoutines.length === 0 ? (
          <p className="text-[#D1D1D1] text-sm">No hay rutinas asignadas.</p>
        ) : (
          <div className="space-y-4">
            {clientRoutines.map((routine, index) => (
              <Card
                key={routine._id}
                className={`p-4 bg-${index % 2 === 0 ? "[#252525]" : "[#282828]"} border border-[#4A4A4A] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white">{routine.name}</h3>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/routine-edit/${routine._id}`)}
                    className="bg-[#FFD700] text-black hover:bg-[#FFC107] border-[#FFC107]"
                  >
                    {routine._id}
                    Ver/Editar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}