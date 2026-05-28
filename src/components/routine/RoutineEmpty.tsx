import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import Card from "../Card";
import { motion } from "framer-motion";
import RoutineTemplatesModal from "./RoutineTemplatesModal";
import HappyCoach from "../mascot/HappyCoach";

export default function RoutineEmpty() {
  const navigate = useNavigate();
  const [showTemplates, setShowTemplates] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col p-4 sm:p-6 sm:justify-center">
      <motion.div
        className="max-w-lg w-full mx-auto sm:max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-[#252525] border-2 border-[#4A4A4A] p-4 sm:p-5 rounded-xl shadow-lg">
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-5"
          >
            <div className="w-[min(100%,200px)] sm:w-36 shrink-0">
              <HappyCoach variant="idle" size="fluid" illustrationOnly animated />
            </div>
            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759]">
                Happy
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#34C759] mt-0.5 leading-tight">
                Tu Rutina
              </h2>
              <p className="text-sm text-[#D1D1D1] mt-2 leading-snug">
                Aún no tienes rutina. Creemos una y empezamos con el pie derecho.
              </p>
            </div>
          </motion.div>

          <div className="space-y-2.5">
            <motion.div variants={itemVariants}>
              <Button
                onClick={() => navigate("/routine-AI")}
                className="w-full bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-xl py-3 px-4 text-base font-semibold border border-[#2DAF47]"
              >
                Generar Rutina con IA
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={() => setShowTemplates(true)}
                className="w-full bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-xl py-3 px-4 text-base font-semibold border border-[#1E88E5]"
              >
                Usar plantilla
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={() => navigate("/routine-form")}
                variant="outline"
                className="w-full min-h-11 rounded-xl py-3 px-4 text-base font-semibold"
              >
                Crear rutina manual
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={() => navigate("/")}
                variant="outlineDanger"
                className="w-full min-h-11 rounded-xl py-3 px-4 text-base font-semibold"
              >
                Volver
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
      {showTemplates && <RoutineTemplatesModal onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
