import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import Card from "../Card";
import Button from "../Button";

export default function ClientList() {
  const navigate = useNavigate();
  const { clients, error } = useSelector((state: RootState) => state.coach);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Mis Clientes</h1>
      <Button
        variant="secondary"
        onClick={() => navigate("/coach/requests")}
        className="mb-4 bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg px-4 py-2 text-sm font-semibold border border-[#1E88E5] shadow-md transition-colors"
      >
        Ver Solicitudes
      </Button>
      {error && <p className="text-red-500 text-sm font-medium text-center mb-4">{error}</p>}
      {clients.length === 0 ? (
        <p className="text-[#D1D1D1] text-sm text-center">No hay clientes asignados.</p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card
              key={client._id}
              className="p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">{client.username}</h2>
                  <p className="text-sm text-[#D1D1D1]">{client.email}</p>
                  {client.goals && client.goals.length > 0 && (
                    <p className="text-sm text-[#B0B0B0] mt-1">Objetivos: {client.goals.join(", ")}</p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/coach/client/${client._id}`)}
                  className="bg-[#34C759] text-black hover:bg-[#4CAF50] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4CAF50] shadow-md transition-colors"
                >
                  Ver Perfil
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}