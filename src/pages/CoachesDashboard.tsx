import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { fetchCoaches, requestCoach } from "../store/coachSlice";
import Card from "../components/Card";
import Button from "../components/Button";
import { SmallLoader } from "../components/Loader";
import { UserPlusIcon } from "@heroicons/react/20/solid";

export default function CoachesDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { coaches, loading: coachLoading, error } = useSelector((state: RootState) => state.coach);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const { role } = user || {};

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (user && user.role && role !== "user") {
      navigate("/");
    } else {
      dispatch(fetchCoaches());
    }
  }, [token, role, dispatch, navigate]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRequestCoach = async (coachId: string) => {
    setRequesting(coachId);
    setActionError(null);
    try {
      await dispatch(requestCoach(coachId)).unwrap();
      setNotification({ message: "Solicitud enviada. Espera la aprobación del coach.", type: "success" });
    } catch (err) {
      console.error(err);
      setActionError("Error al enviar la solicitud");
      setNotification({ message: "Error al enviar la solicitud", type: "error" });
    } finally {
      setRequesting(null);
    }
  };

  if (userLoading || coachLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center space-y-4">
        <SmallLoader />
        <p className="text-[#E0E0E0] text-sm">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">Coaches Disponibles</h1>
        {(error || actionError) && (
          <Card className="p-4 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md mb-8">
            <p className="text-red-500 text-xs font-medium text-center">{error || actionError}</p>
          </Card>
        )}
        {notification && (
          <Card
            className={`p-4 mb-8 rounded-lg shadow-md border-2 ${
              notification.type === "success"
                ? "bg-[#34C759]/10 border-[#34C759]"
                : "bg-[#EF5350]/10 border-[#EF5350]"
            }`}
          >
            <p
              className={`text-xs font-medium text-center ${
                notification.type === "success" ? "text-[#34C759]" : "text-[#EF5350]"
              }`}
            >
              {notification.message}
            </p>
          </Card>
        )}
        {coaches.length === 0 ? (
          <p className="text-[#E0E0E0] text-sm text-center">No hay coaches disponibles.</p>
        ) : (
          <div className="space-y-6 divide-y divide-[#4A4A4A]">
            {coaches.map((coach, index) => (
              <Card
                key={coach._id}
                className={`p-6 bg-[#252525] border-2 border-[#4A4A4A] rounded-lg shadow-md hover:shadow-lg hover:ring-2 hover:ring-[#34C759] transition-all duration-300 ${
                  index === 0 ? "pt-6" : "pt-6 mt-6"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#E0E0E0]">{coach.username}</h2>
                    <p className="text-sm text-[#E0E0E0]">{coach.email}</p>
                    {coach.specialties && coach.specialties.length > 0 && (
                      <p className="text-sm text-[#CCCCCC] mt-1">
                        Especialidades: {coach.specialties.join(", ")}
                      </p>
                    )}
                    {coach.bio && <p className="text-sm text-[#CCCCCC] mt-1">{coach.bio}</p>}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleRequestCoach(coach._id)}
                    disabled={requesting === coach._id}
                    className="w-full sm:w-auto bg-[#34C759] text-black hover:bg-[#4CAF50] rounded-lg px-4 py-2 text-sm font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50]/80 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {requesting === coach._id ? (
                      <SmallLoader />
                    ) : (
                      <>
                        <UserPlusIcon className="w-5 h-5" /> Solicitar Coach
                      </>
                    )}
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