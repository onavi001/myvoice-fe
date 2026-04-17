import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { acceptCoachRequest, rejectCoachRequest } from "../../store/coachSlice";
import Card from "../Card";
import Button from "../Button";
import { SmallLoader } from "../Loader";
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

export default function CoachRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { requests, error, loading } = useSelector((state: RootState) => state.coach);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAcceptRequest = async (userId: string) => {
    setAccepting(userId);
    setActionError(null);
    try {
      await dispatch(acceptCoachRequest(userId)).unwrap();
    } catch (err) {
      console.error(err);
      setActionError("Error al aceptar la solicitud");
    } finally {
      setAccepting(null);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    setRejecting(userId);
    setActionError(null);
    try {
      await dispatch(rejectCoachRequest(userId)).unwrap();
    } catch (err) {
      console.error(err);
      setActionError("Error al rechazar la solicitud");
    } finally {
      setRejecting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-4">
        <SmallLoader />
        <p className="text-[#E0E0E0] text-sm">Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
        <Button
          variant="secondary"
          onClick={() => navigate("/coach")}
          className="mb-8 bg-[#4A4A4A] text-[#E0E0E0] hover:bg-[#5A5A5A] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4A4A4A] shadow-md transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" /> Volver a Clientes
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Solicitudes Pendientes</h1>
        {(error || actionError) && (
          <Card className="p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-8">
            <p className="text-red-500 text-xs font-medium text-center">{error || actionError}</p>
          </Card>
        )}
        {requests.length === 0 ? (
          <p className="text-[#E0E0E0] text-sm text-center">No hay solicitudes pendientes.</p>
        ) : (
          <div className="space-y-6 divide-y divide-[#4A4A4A]">
            {requests.map((request, index) => (
              <Card
                key={request._id}
                className={`p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md hover:shadow-lg hover:ring-2 hover:ring-[#34C759] transition-all duration-300 ${index === 0 ? "pt-6" : "pt-6 mt-6"}`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#E0E0E0]">{request.userId.username}</h2>
                    <p className="text-sm text-[#E0E0E0]">{request.userId.email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      onClick={() => handleAcceptRequest(request.userId._id)}
                      disabled={accepting === request.userId._id || rejecting === request.userId._id}
                      className="w-full sm:w-auto bg-[#34C759] text-black hover:bg-[#4CAF50] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {accepting === request.userId._id ? <SmallLoader /> : <><CheckIcon className="w-5 h-5" /> Aceptar</>}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleRejectRequest(request.userId._id)}
                      disabled={accepting === request.userId._id || rejecting === request.userId._id}
                      className="w-full sm:w-auto bg-[#EF5350] text-[#E0E0E0] hover:bg-[#D32F2F] rounded-lg px-4 py-2 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {rejecting === request.userId._id ? <SmallLoader /> : <><XMarkIcon className="w-5 h-5" /> Rechazar</>}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}