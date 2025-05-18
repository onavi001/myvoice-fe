import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import Card from "../Card";
import Button from "../Button";
import { SmallLoader } from "../Loader";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/20/solid";

export default function ClientList() {
  const navigate = useNavigate();
  const { clients, error, loading } = useSelector((state: RootState) => state.coach);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-4">
        <SmallLoader />
        <p className="text-[#E0E0E0] text-sm">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Mis Clientes</h1>
        <Button
          variant="secondary"
          onClick={() => navigate("/coach/requests")}
          className="mb-8 bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg px-4 py-2 text-sm font-semibold border border-[#1E88E5] shadow-md transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Ver Solicitudes
        </Button>
        {error && (
          <Card className="p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-8">
            <p className="text-red-500 text-xs font-medium text-center">{error}</p>
          </Card>
        )}
        {clients.length === 0 ? (
          <p className="text-[#E0E0E0] text-sm text-center">No hay clientes asignados.</p>
        ) : (
          <div className="space-y-6 divide-y divide-[#4A4A4A]">
            {clients.map((client, index) => (
              <Card
                key={client._id}
                className={`p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md hover:shadow-lg hover:ring-2 hover:ring-[#34C759] transition-all duration-300 ${index === 0 ? "pt-6" : "pt-6 mt-6"}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#E0E0E0]">{client.username}</h2>
                    <p className="text-sm text-[#E0E0E0]">{client.email}</p>
                    {client.goals && client.goals.length > 0 && (
                      <p className="text-sm text-[#CCCCCC] mt-1">Objetivos: {client.goals.join(", ")}</p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/coach/client/${client._id}`)}
                    className="w-full sm:w-auto bg-[#34C759] text-black hover:bg-[#4CAF50] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4CAF50] shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    Ver Perfil <ArrowRightIcon className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}