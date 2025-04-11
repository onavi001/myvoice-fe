import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { setExerciseVideos } from "../../store/routineSlice";
import { IExercise } from "../../models/Exercise";
import Button from "../Button";
import { SmallLoader } from "../Loader";
import { IVideo } from "../../models/Video";

export default function VideoPlayer({
  exercise,
  routineId,
  dayIndex,
  exerciseIndex,
}: {
  exercise: IExercise;
  routineId: string;
  dayIndex: number;
  exerciseIndex: number;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const [areVideosVisible, setAreVideosVisible] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const { loading } = useSelector((state: RootState) => state.routine);

  const handleVideoAction = async (action: "next" | "prev" | "toggle") => {
    if (action === "toggle") {
      setAreVideosVisible(!areVideosVisible);
    } else if (exercise.videos && exercise.videos.length > 1) {
      setIsSwitching(true);
      try {
        const currentIndex = exercise.videos.findIndex((v: Partial<IVideo>) => v.isCurrent) ?? 0;
        const newIndex =
          action === "next"
            ? (currentIndex + 1) % exercise.videos.length
            : (currentIndex - 1 + exercise.videos.length) % exercise.videos.length;
        const updatedVideos = exercise.videos.map((v, idx) => ({
          ...v,
          isCurrent: idx === newIndex,
        }));
        await dispatch(
          setExerciseVideos({
            routineId,
            dayIndex,
            exerciseIndex,
            videos: updatedVideos as IVideo[],
          })
        ).unwrap();
      } finally {
        setIsSwitching(false);
      }
    }
  };

  const currentVideo:Partial<IVideo> = exercise.videos?.find((v:Partial<IVideo>) => v.isCurrent) || exercise.videos?.[0];

  return (
    <div>
      {exercise.videos && exercise.videos.length > 0 ? (
        <>
          {areVideosVisible && currentVideo && (
            <iframe
              src={currentVideo.url}
              title={`Demostración de ${exercise.name}`}
              className="w-full h-32 rounded border border-[#4A4A4A]"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          {exercise.videos.length > 1 && (
            <div className="mt-2 flex justify-around">
              {areVideosVisible && (
                <Button
                  onClick={() => handleVideoAction("prev")}
                  className="w-auto bg-transparent text-white hover:bg-transparent rounded-full py-1 px-2 text-xs font-semibold border border-[#2DBF4E]"
                  disabled={isSwitching}
                >
                  {isSwitching ? <SmallLoader /> : "<< Anterior"}
                </Button>
              )}
              <Button
                onClick={() => handleVideoAction("toggle")}
                className="w-auto bg-transparent text-white hover:bg-transparent rounded-full py-1 px-2 text-xs font-semibold border border-[#2DBF4E]"
              >
                {areVideosVisible ? "Esconder" : "Mostrar videos"}
              </Button>
              {areVideosVisible && (
                <Button
                  onClick={() => handleVideoAction("next")}
                  className="w-auto bg-transparent text-white hover:bg-transparent rounded-full py-1 px-2 text-xs font-semibold border border-[#2DBF4E]"
                  disabled={isSwitching}
                >
                  {isSwitching ? <SmallLoader /> : "Siguiente >>"}
                </Button>
              )}
            </div>
          )}
        </>
      ) : loading ? (
        <div className="text-center">
          <SmallLoader />
          <p className="text-[#B0B0B0] italic">Cargando video...</p>
        </div>
      ) : (
        <p className="text-[#B0B0B0] italic text-center">Video no disponible</p>
      )}
    </div>
  );
}