import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { fetchCoaches, requestCoach } from "../store/coachSlice";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { SmallLoader } from "../components/Loader";

export default function CoachesDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { coaches, loading: coachLoading, error } = useSelector((state: RootState) => state.coach);
  const [requesting, setRequesting] = useState<string | null>(null);
  const {role} = user || {};
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (user && user.role && role !== "user") {
      navigate("/");
    } else {
      dispatch(fetchCoaches());
    }
  }, [token, role, dispatch, navigate]);

  const handleRequestCoach = async (coachId: string) => {
    setRequesting(coachId);
    try {
      await dispatch(requestCoach(coachId)).unwrap();
      alert("Solicitud enviada. Espera la aprobación del coach.");
    } catch (err) {
      console.error(err);
    } finally {
      setRequesting(null);
    }
  };

  if (userLoading || coachLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center">
        <Loader />
        <p className="text-[#D1D1D1] text-sm mt-4">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Coaches Disponibles</h1>
      {error && <p className="text-red-500 text-sm font-medium text-center mb-4">{error}</p>}
      {coaches.length === 0 ? (
        <p className="text-[#D1D1D1] text-sm text-center">No hay coaches disponibles.</p>
      ) : (
        <div className="space-y-4">
          {coaches.map((coach) => (
            <Card
              key={coach._id}
              className="p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">{coach.username}</h2>
                  <p className="text-sm text-[#D1D1D1]">{coach.email}</p>
                  {coach.specialties && coach.specialties.length > 0 && (
                    <p className="text-sm text-[#B0B0B0] mt-1">
                      Especialidades: {coach.specialties.join(", ")}
                    </p>
                  )}
                  {coach.bio && <p className="text-sm text-[#B0B0B0] mt-1">{coach.bio}</p>}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRequestCoach(coach._id)}
                  disabled={requesting === coach._id}
                  className="bg-[#34C759] text-black hover:bg-[#4CAF50] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/50 disabled:cursor-not-allowed transition-colors"
                >
                  {requesting === coach._id ? <SmallLoader /> : "Solicitar Coach"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}