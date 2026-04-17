import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { setExerciseVideos } from "../../store/routineSlice";
import { IExercise } from "../../models/Exercise";
import { IVideo } from "../../models/Video";
import Button from "../Button";
import { SmallLoader } from "../Loader";
import { motion } from "framer-motion";

// Tipos para mayor claridad
interface VideoPlayerProps {
  exercise: IExercise;
  routineId: string;
  dayId: string;
  exerciseId: string;
}

// Variantes para animaciones
const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const iframeVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function VideoPlayer({ exercise, routineId, dayId, exerciseId }: VideoPlayerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [areVideosVisible, setAreVideosVisible] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const { loading } = useSelector((state: RootState) => state.routine);

  // Obtener el video actual
  const getCurrentVideo = (): IVideo | undefined => {
    if (!exercise.videos || exercise.videos.length === 0) return undefined;
    return (
      exercise.videos.find((v): v is IVideo => typeof v === "object" && v !== null && v.isCurrent) ||
      exercise.videos.find((v): v is IVideo => typeof v === "object" && v !== null)
    );
  };

  // Cambiar el video actual (siguiente o anterior)
  const switchVideo = async (direction: "next" | "prev") => {
    if (!exercise.videos || exercise.videos.length <= 1 || isSwitching) return;

    setIsSwitching(true);
    try {
      const currentIndex = exercise.videos
        .filter((v): v is IVideo => typeof v === "object" && v !== null)
        .findIndex((v) => v.isCurrent) ?? 0;
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % exercise.videos.length
          : (currentIndex - 1 + exercise.videos.length) % exercise.videos.length;

      const updatedVideos = exercise.videos
        .filter((v): v is IVideo => typeof v === "object" && v !== null)
        .map((v, idx) => ({
          ...v,
          isCurrent: idx === newIndex,
        }));

      await dispatch(
        setExerciseVideos({
          routineId,
          dayId,
          exerciseId,
          videos: updatedVideos,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error al cambiar video:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  // Alternar visibilidad del video
  const toggleVideosVisibility = () => {
    setAreVideosVisible((prev) => !prev);
  };

  const currentVideo = getCurrentVideo();

  return (
    <motion.div
      className="space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Estado de carga o sin videos */}
      {loading ? (
        <div className="text-center space-y-2">
          <SmallLoader />
          <p className="text-[#B0B0B0] text-sm italic">Cargando video...</p>
        </div>
      ) : !exercise.videos || exercise.videos.length === 0 ? (
        <p className="text-[#B0B0B0] text-sm italic text-center">Video no disponible</p>
      ) : (
        <>
          {/* Reproductor de video */}
          {areVideosVisible && currentVideo && (
            <motion.div variants={iframeVariants}>
              <iframe
                src={currentVideo.url}
                title={`Demostración de ${exercise.name}`}
                className="w-full h-48 rounded-md border border-[#4A4A4A] shadow-sm"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          )}

          {/* Controles */}
          <div className="flex justify-center gap-2">
            {exercise.videos.length > 1 && areVideosVisible && (
              <Button
                onClick={() => switchVideo("prev")}
                disabled={isSwitching}
                className="bg-[#252525] text-white hover:bg-[#4A4A4A] rounded-md py-1 px-3 text-sm font-semibold border border-[#4A4A4A] shadow-sm disabled:opacity-50 flex items-center gap-1"
              >
                {isSwitching ? <SmallLoader /> : "◄ Anterior"}
              </Button>
            )}

            <Button
              onClick={toggleVideosVisibility}
              className="bg-[#252525] text-white hover:bg-[#4A4A4A] rounded-md py-1 px-3 text-sm font-semibold border border-[#4A4A4A] shadow-sm"
            >
              {areVideosVisible ? "Ocultar video" : "Mostrar video"}
            </Button>

            {exercise.videos.length > 1 && areVideosVisible && (
              <Button
                onClick={() => switchVideo("next")}
                disabled={isSwitching}
                className="bg-[#252525] text-white hover:bg-[#4A4A4A] rounded-md py-1 px-3 text-sm font-semibold border border-[#4A4A4A] shadow-sm disabled:opacity-50 flex items-center gap-1"
              >
                {isSwitching ? <SmallLoader /> : "Siguiente ►"}
              </Button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}