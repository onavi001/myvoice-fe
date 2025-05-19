import React, { useEffect, useState } from "react";
import Button from "./Button";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  CalendarIcon,
  PlusIcon,
  ChartBarIcon,
  PencilIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";

interface NavbarProps {
  onMyRoutine: () => void;
  onNewRoutine: () => void;
  onProgress: () => void;
  onLogout: () => void;
  onGenerateRoutine: () => void;
  onEditRoutine?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onMyRoutine,
  onNewRoutine,
  onProgress,
  onLogout,
  onGenerateRoutine,
  onEditRoutine,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { selectedRoutineId, routines } = useSelector((state: RootState) => state.routine);
  const { user } = useSelector((state: RootState) => state.user);
  const hasSelectedRoutine = selectedRoutineId !== null && routines.find((r) => r._id === selectedRoutineId);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  const handleCoachNavigation = () => {
    if (user?.role === "coach") {
      navigate("/coach");
    } else {
      navigate("/coaches");
    }
  };

  return (
    <div className="bg-[#1A1A1A] p-2 shadow-md border-b border-[#4A4A4A] z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center space-x-2">
        {/* Logo o título */}
        <div onClick={onMyRoutine} className="flex text-[#E0E0E0] items-center text-lg font-semibold cursor-pointer">
          <img src="/favicon.ico" alt="logo" width={40} height={40} className="w-10 h-10 mr-4" />
          MyVoice
        </div>
        {user && (
          <>
            {/* Botones principales */}
            <div className="flex space-x-2 items-center">
              <Button
                variant="secondary"
                onClick={onGenerateRoutine}
                className="bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-lg px-4 py-2 text-sm font-semibold border border-[#1E88E5] shadow-md transition-colors flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" /> Rutina con IA
              </Button>
              {/* Botón de menú */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-[#2D2D2D] rounded-full text-[#E0E0E0] hover:bg-[#4A4A4A] focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>

            {/* Menú desplegable */}
            {isMenuOpen && (
              <div
                className="absolute top-14 right-4 sm:right-6 w-56 bg-[#2D2D2D] rounded-lg shadow-lg p-3 space-y-1 transition-all duration-200 ease-in-out z-50"
              >
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded transition-colors"
                >
                  <UserCircleIcon className="w-4 h-4" /> Editar Perfil
                </button>
                <button
                  onClick={onMyRoutine}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" /> Mi Rutina
                </button>
                <button
                  onClick={onNewRoutine}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded transition-colors"
                >
                  <PlusIcon className="w-4 h-4" /> Nueva Rutina
                </button>
                <button
                  onClick={onProgress}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded transition-colors"
                >
                  <ChartBarIcon className="w-4 h-4" /> Progreso
                </button>
                {hasSelectedRoutine && onEditRoutine && (
                  <button
                    onClick={onEditRoutine}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" /> Editar Rutina
                  </button>
                )}
                <button
                  onClick={handleCoachNavigation}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> Coach
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-[#EF5350] hover:bg-[#4A4A4A] rounded transition-colors"
                >
                  <ArrowLeftOnRectangleIcon className="w-4 h-4" /> Cerrar Sesión
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;