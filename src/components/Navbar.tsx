import React, { useEffect, useState } from "react";
import Button from "./Button";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import NavbarFeaturedMedal from "./navbar/NavbarFeaturedMedal";
import { navigateToProgressMedals } from "../utils/progressRoutes";
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
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
} from "@heroicons/react/20/solid";

interface NavbarProps {
  onMyRoutine: () => void;
  onNewRoutine: () => void;
  onProgress: () => void;
  onAdmin: () => void;
  onLogout: () => void;
  onGenerateRoutine: () => void;
  onEditRoutine?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onMyRoutine,
  onNewRoutine,
  onProgress,
  onAdmin,
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
    setIsMenuOpen(false);
    if (user?.role === "coach") {
      navigate("/coach");
    } else if (user?.coachId) {
      navigate("/my-coach");
    } else {
      navigate("/my-coach");
    }
  };

  return (
    <div className="relative bg-[#1A1A1A] px-2 py-1.5 sm:p-2 shadow-md border-b border-[#4A4A4A] z-50">
      <div className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          type="button"
          onClick={onMyRoutine}
          className="flex text-[#E0E0E0] items-center text-lg font-semibold shrink-0 min-w-0 touch-manipulation"
          aria-label="Ir a mi rutina"
        >
          <img
            src="/android-chrome-192x192.png"
            alt=""
            width={40}
            height={40}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0"
          />
          <span className="hidden sm:inline truncate ml-2">MyVoice</span>
        </button>
        {user && (
          <>
            <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
              <div className="max-sm:scale-[0.92] max-sm:origin-center">
                <NavbarFeaturedMedal />
              </div>
              <Button
                id="onboarding-navbar-ai"
                variant="secondary"
                onClick={onGenerateRoutine}
                aria-label="Crear rutina con inteligencia artificial"
                title="Genera tu plan de entrenamiento con IA"
                className="!bg-gradient-to-r from-[#5DD4F7] to-[#42A5F5] text-black !hover:from-[#4FC3F7] !hover:to-[#1E88E5] rounded-lg !px-2.5 sm:!px-3.5 !py-1.5 sm:!py-2 text-xs sm:text-sm font-bold border-2 !border-[#1E88E5] shadow-[0_0_14px_rgba(66,165,245,0.45)] ring-1 ring-white/20 transition-all flex items-center gap-1.5 min-h-10 max-w-[9.5rem] sm:max-w-none justify-center shrink"
              >
                <SparklesIcon className="w-5 h-5 shrink-0" aria-hidden />
                <span className="leading-tight text-left">
                  <span className="block sm:hidden">Crear con IA</span>
                  <span className="hidden sm:block">Rutina con IA</span>
                </span>
              </Button>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                className="p-2 bg-[#2D2D2D] rounded-full text-[#E0E0E0] hover:bg-[#4A4A4A] focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-colors touch-manipulation min-h-10 min-w-10 flex items-center justify-center"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            </div>

            {isMenuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-[55] bg-black/40 sm:hidden"
                  aria-label="Cerrar menú"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div
                  className="fixed left-3 right-3 top-[calc(3.25rem+env(safe-area-inset-top,0px))] sm:absolute sm:left-auto sm:right-4 sm:top-full sm:mt-1 sm:w-56 max-h-[min(70vh,24rem)] overflow-y-auto bg-[#2D2D2D] rounded-xl shadow-xl p-2 space-y-0.5 z-[60]"
                >
                <button
                  type="button"
                  onClick={() => {
                    onGenerateRoutine();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm font-semibold text-[#5DD4F7] hover:bg-[#4A4A4A] rounded-lg transition-colors md:hidden touch-manipulation min-h-11"
                >
                  <SparklesIcon className="w-5 h-5 shrink-0" />
                  <span>
                    Crear rutina con IA
                    <span className="block text-[10px] font-normal text-[#888] mt-0.5">
                      Genera un plan con inteligencia artificial
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigateToProgressMedals(navigate);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <ChartBarIcon className="w-4 h-4 shrink-0" /> Mis medallas
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <UserCircleIcon className="w-4 h-4" /> Editar Perfil
                </button>
                <button
                  type="button"
                  onClick={onMyRoutine}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <CalendarIcon className="w-4 h-4" /> Mi Rutina
                </button>
                <button
                  type="button"
                  onClick={onNewRoutine}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <PlusIcon className="w-4 h-4" /> Nueva Rutina
                </button>
                <button
                  type="button"
                  onClick={onProgress}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <ChartBarIcon className="w-4 h-4 shrink-0" /> Progreso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/tu-opinion");
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#5DD4F7] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 shrink-0" />
                  <span>
                    Tu opinión
                    <span className="block text-[10px] font-normal text-[#888] mt-0.5">
                      Ideas y ayuda con la app
                    </span>
                  </span>
                </button>
                {user?.role === "admin" && (
                  <button
                  type="button"
                  onClick={onAdmin}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <ShieldCheckIcon className="w-4 h-4" /> Admin
                </button>
                    
                      
                )}
                {hasSelectedRoutine && onEditRoutine && (
                  <button
                    type="button"
                    onClick={onEditRoutine}
                    className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                  >
                    <PencilIcon className="w-4 h-4" /> Editar Rutina
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCoachNavigation}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#E0E0E0] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <UserIcon className="w-4 h-4" />
                  {user?.role === "coach"
                    ? "Mis clientes"
                    : user?.coachId
                      ? "Mi coach"
                      : "Buscar coach"}
                </button>
                {user?.role === "user" && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/become-coach");
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#5DD4F7] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                  >
                    <AcademicCapIcon className="w-4 h-4 shrink-0" />
                    <span>
                      Ser coach
                      <span className="block text-[10px] font-normal text-[#888] mt-0.5">
                        Solicitud para entrenar a otros
                      </span>
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-sm text-[#EF5350] hover:bg-[#4A4A4A] rounded-lg transition-colors touch-manipulation min-h-11"
                >
                  <ArrowLeftOnRectangleIcon className="w-4 h-4 shrink-0" /> Cerrar Sesión
                </button>
              </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;