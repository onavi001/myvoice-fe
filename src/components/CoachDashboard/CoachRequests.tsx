import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { acceptCoachRequest, rejectCoachRequest } from "../../store/coachSlice";
import Card from "../Card";
import Button from "../Button";
import { SmallLoader } from "../Loader";

export default function CoachRequests() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { requests, error } = useSelector((state: RootState) => state.coach);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const handleAcceptRequest = async (userId: string) => {
    setAccepting(userId);
    try {
      console.log(userId);
      await dispatch(acceptCoachRequest(userId)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setAccepting(null);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    setRejecting(userId);
    try {
      await dispatch(rejectCoachRequest(userId)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setRejecting(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
      <Button
        variant="secondary"
        onClick={() => navigate("/coach")}
        className="mb-6 bg-[#4A4A4A] text-white hover:bg-[#5A5A5A] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4A4A4A] shadow-md transition-colors"
      >
        ← Volver a Clientes
      </Button>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Solicitudes Pendientes</h1>
      {error && <p className="text-red-500 text-sm font-medium text-center mb-4">{error}</p>}
      {requests.length === 0 ? (
        <p className="text-[#D1D1D1] text-sm text-center">No hay solicitudes pendientes.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card
              key={request._id}
              className="p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">{request.userId.username}</h2>
                  <p className="text-sm text-[#D1D1D1]">{request.userId.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleAcceptRequest(request.userId._id)}
                    disabled={accepting === request.userId._id || rejecting === request.userId._id}
                    className="bg-[#34C759] text-black hover:bg-[#4CAF50] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/50 disabled:cursor-not-allowed transition-colors"
                  >
                    {accepting === request.userId._id ? <SmallLoader /> : "Aceptar"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleRejectRequest(request.userId._id)}
                    disabled={accepting === request.userId._id || rejecting === request.userId._id}
                    className="bg-[#EF5350] text-white hover:bg-[#D32F2F] rounded-lg px-4 py-2 text-sm font-semibold border border-[#D32F2F] shadow-md disabled:bg-[#D32F2F]/50 disabled:cursor-not-allowed transition-colors"
                  >
                    {rejecting === request.userId._id ? <SmallLoader /> : "Rechazar"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}