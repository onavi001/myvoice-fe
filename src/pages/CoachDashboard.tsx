import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { fetchClients, fetchCoachRequests, clearClientData } from "../store/coachSlice";
import ClientList from "../components/CoachDashboard/ClientList";
import CoachRequests from "../components/CoachDashboard/CoachRequests";
import Loader from "../components/Loader";

export default function CoachDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { loading: coachLoading } = useSelector((state: RootState) => state.coach);
  const { role } = user || {};
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (role !== "coach") {
      navigate("/coaches");
    } else {
      dispatch(fetchClients());
      dispatch(fetchCoachRequests());
    }
    console.log("useEffect");
    return () => {
      dispatch(clearClientData());
    };
    
  }, [token, role, dispatch, navigate]);
  
  if (userLoading || coachLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center">
        <Loader />
        <p className="text-[#D1D1D1] text-sm mt-4">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <Routes>
        <Route path="/" element={<ClientList />} />
        <Route path="/requests" element={<CoachRequests />} />
      </Routes>
    </div>
  );
}