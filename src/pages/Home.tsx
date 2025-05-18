import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import Button from "../components/Button";
import Card from "../components/Card";
import { motion } from "framer-motion";
import { UserIcon } from "@heroicons/react/20/solid";

export default function Home() {
  const { user, token } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  if (!token) {
    navigate("/login");
    return null;
  }

  const handleCoachNavigation = () => {
    if (user?.role === "coach") {
      navigate("/coach");
    } else {
      navigate("/coaches");
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.2, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center p-6">
      {/* Header */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-[#34C759] mt-12 mb-4 text-center"
        variants={titleVariants}
        initial="hidden"
        animate="visible"
      >
        ¡Bienvenido, {user?.username || "Usuario"}!
      </motion.h1>
      <motion.p
        className="text-lg md:text-xl text-[#E0E0E0] mb-10 text-center max-w-3xl"
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        Explora tus rutinas, sigue tu progreso y alcanza tus metas con My Voice.
      </motion.p>

      {/* Opciones principales */}
      <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[#252525] border-2 border-[#4A4A4A] p-8 rounded-md text-center hover:shadow-lg hover:bg-[#2D2D2D] hover:ring-2 hover:ring-[#34C759] transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#34C759] mb-3">Mis Rutinas</h2>
            <p className="text-[#CCCCCC] mb-6 text-sm">
              Gestiona y sigue tus planes de entrenamiento personalizados.
            </p>
            <Button
              onClick={() => navigate("/routine")}
              className="bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-2 px-6 text-sm font-semibold border border-[#2DAF47] shadow-md focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
            >
              Ir a Rutinas
            </Button>
          </Card>
        </motion.div>

        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[#252525] border-2 border-[#4A4A4A] p-8 rounded-md text-center hover:shadow-lg hover:bg-[#2D2D2D] hover:ring-2 hover:ring-[#34C759] transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#34C759] mb-3">Progreso</h2>
            <p className="text-[#CCCCCC] mb-6 text-sm">
              Revisa tus avances, estadísticas y logros.
            </p>
            <Button
              onClick={() => navigate("/progress")}
              className="bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-2 px-6 text-sm font-semibold border border-[#2DAF47] shadow-md focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
            >
              Ver Progreso
            </Button>
          </Card>
        </motion.div>

        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[#252525] border-2 border-[#4A4A4A] p-8 rounded-md text-center hover:shadow-lg hover:bg-[#2D2D2D] hover:ring-2 hover:ring-[#34C759] transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#34C759] mb-3">Crear Rutina</h2>
            <p className="text-[#CCCCCC] mb-6 text-sm">
              Diseña un nuevo plan adaptado a tus objetivos.
            </p>
            <Button
              onClick={() => navigate("/routine-form")}
              className="bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-2 px-6 text-sm font-semibold border border-[#2DAF47] shadow-md focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200"
            >
              Nueva Rutina
            </Button>
          </Card>
        </motion.div>

        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[#252525] border-2 border-[#4A4A4A] p-8 rounded-md text-center hover:shadow-lg hover:bg-[#2D2D2D] hover:ring-2 hover:ring-[#34C759] transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[#34C759] mb-3">
              {user?.role === "coach" ? "Mis Clientes" : "Mi Entrenador"}
            </h2>
            <p className="text-[#CCCCCC] mb-6 text-sm">
              {user?.role === "coach"
                ? "Gestiona tus clientes y sus rutinas."
                : "Encuentra o conecta con tu entrenador personal."}
            </p>
            <Button
              onClick={handleCoachNavigation}
              className="bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-2 px-6 text-sm font-semibold border border-[#2DAF47] shadow-md focus:ring-2 focus:ring-[#34C759] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserIcon className="w-5 h-5" /> {user?.role === "coach" ? "Ver Clientes" : "Ver Entrenadores"}
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}