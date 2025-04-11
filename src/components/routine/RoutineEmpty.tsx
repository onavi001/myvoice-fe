import { useNavigate } from "react-router-dom";
import Button from "../Button";
import Card from "../Card";
import { motion } from "framer-motion";

export default function RoutineEmpty() {
  const navigate = useNavigate();

  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-6">
      <motion.div
        className="max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-[#252525] border-2 border-[#4A4A4A] p-8 rounded-md shadow-lg text-center">
          <motion.h2
            className="text-3xl font-bold text-[#34C759] mb-4"
            variants={itemVariants}
          >
            Tu Rutina
          </motion.h2>
          <motion.p
            className="text-[#D1D1D1] text-lg mb-8"
            variants={itemVariants}
          >
            Aún no tienes rutinas generadas. ¡Empieza ahora creando una personalizada o usa nuestra IA!
          </motion.p>

          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => navigate("/routine-AI")}
                className="w-full bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-3 px-6 text-base font-semibold border border-[#2DAF47] shadow-md transition-all duration-200"
              >
                Generar Rutina con IA
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={() => navigate("/routine-form")}
                className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-md py-3 px-6 text-base font-semibold border border-[#1E88E5] shadow-md transition-all duration-200"
              >
                Agregar Rutina Manual
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-[#EF5350] text-white hover:bg-[#D32F2F] rounded-md py-3 px-6 text-base font-semibold border border-[#D32F2F] shadow-md transition-all duration-200"
              >
                Volver
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}