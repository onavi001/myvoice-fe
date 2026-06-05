import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeftIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { RootState } from "../store";
import BecomeCoachApplication from "../components/coach/BecomeCoachApplication";

export default function BecomeCoach() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!token) navigate("/login");
    else if (user?.role === "coach") navigate("/coach");
    else if (user?.role === "admin") navigate("/admin");
  }, [token, user?.role, navigate]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0]">
      <div className="p-4 max-w-lg mx-auto pb-10">
        <button
          type="button"
          onClick={() => navigate(user?.coachId ? "/my-coach" : "/home")}
          className="mb-4 flex items-center gap-1.5 text-sm text-[#B0B0B0] touch-manipulation min-h-10"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Volver
        </button>

        <header className="mb-6 flex gap-3 items-start">
          <span className="w-12 h-12 rounded-xl bg-[#5DD4F7]/15 border border-[#5DD4F7]/30 flex items-center justify-center shrink-0">
            <AcademicCapIcon className="w-7 h-7 text-[#5DD4F7]" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5DD4F7]">
              Programa coach
            </p>
            <h1 className="text-xl font-bold mt-0.5">Solicitar ser coach</h1>
            <p className="text-xs text-[#888] mt-1">
              Entrena a otros desde My Voice en el móvil.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-[#3A3A3A] bg-[#252525] p-4">
          <BecomeCoachApplication />
        </div>

        <ul className="mt-6 space-y-2 text-xs text-[#888]">
          <li>· Revisión manual por un administrador.</li>
          <li>· Si te aprueban, tu cuenta pasa a rol coach al volver a abrir la app.</li>
          <li>· Podrás crear plantillas y asignarlas a clientes.</li>
        </ul>
      </div>
    </div>
  );
}
