import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { ThunkError, updateExercise } from "../store/routineSlice";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import Loader from "../components/Loader";
import { IVideo } from "../models/Video";

export default function ExerciseVideosPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { routineId, dayIndex, exerciseIndex } = useParams<{
    routineId: string;
    dayIndex: string;
    exerciseIndex: string;
  }>();
  const { routines, loading: reduxLoading } = useSelector((state: RootState) => state.routine);
  const { token, loading: userLoading } = useSelector((state: RootState) => state.user);

  const [videos, setVideos] = useState<IVideo[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Cargar videos iniciales desde la rutina
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (routineId && dayIndex !== undefined && exerciseIndex !== undefined && routines.length > 0) {
      const routine = routines.find((r) => r._id === routineId);
      if (routine) {
        const day = routine.days[Number(dayIndex)];
        if (day) {
          const exercise = day.exercises[Number(exerciseIndex)];
          if (exercise) {
            setVideos(exercise.videos || []);
            const currentVideo = exercise.videos?.find((v) => v.isCurrent);
            if (currentVideo) setSelectedVideo(currentVideo.url);
          }
        }
      }
    }
  }, [routines, routineId, dayIndex, exerciseIndex, token, navigate]);

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : url;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return isYouTubeUrl(url) || url.match(/\.(mp4|webm|ogg)$/i) !== null;
    } catch {
      return false;
    }
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) {
      setError("La URL del video no puede estar vacía");
      return;
    }
    if (!isValidUrl(newVideoUrl)) {
      setError("Ingresa una URL válida (YouTube o .mp4, .webm, .ogg)");
      return;
    }
    const videoUrl = isYouTubeUrl(newVideoUrl) ? getYouTubeEmbedUrl(newVideoUrl) : newVideoUrl;
    setVideos([
      ...videos,
      { _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, url: videoUrl, isCurrent: false },
    ]);
    setNewVideoUrl("");
    setError(null);
    setSelectedVideo(videoUrl);
  };

  const handleRemoveVideo = (videoId: string) => {
    const removedVideo = videos.find((v) => v._id === videoId);
    setVideos(videos.filter((video) => video._id !== videoId));
    if (selectedVideo === removedVideo?.url) {
      setSelectedVideo(videos.length > 1 ? videos[0].url : null);
    }
  };

  const handleSetCurrent = (videoId: string) => {
    const updatedVideos = videos.map((video) => ({
      ...video,
      isCurrent: video._id === videoId,
    }));
    setVideos(updatedVideos);
    const currentVideo = updatedVideos.find((v) => v._id === videoId);
    if (currentVideo) setSelectedVideo(currentVideo.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const routine = routines.find((r) => r._id === routineId);
      if (!routine || dayIndex === undefined || exerciseIndex === undefined) {
        throw new Error("Datos inválidos");
      }

      const day = routine.days[Number(dayIndex)];
      const exercise = day.exercises[Number(exerciseIndex)];

      const cleanedVideos = videos.map((video) => {
        const { _id, ...rest } = video;
        if (_id.startsWith("temp-")) {
          return rest;
        }
        return video as IVideo;
      }) as IVideo[];

      await dispatch(
        updateExercise({
          routineId: routineId!,
          dayId: day._id,
          exerciseId: exercise._id,
          exerciseData: {
            ...exercise,
            videos: cleanedVideos,
          },
        })
      ).unwrap();

      navigate(`/routine-edit/${routineId}`);
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) {
        navigate("/login");
      } else {
        setError("Error al actualizar los videos");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || reduxLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!routineId || dayIndex === undefined || exerciseIndex === undefined) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
        Datos inválidos
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col">
      <div className="p-4 max-w-md mx-auto flex-1 mt-10">
        <h1 className="text-lg font-bold mb-3 text-white">Editar Videos del Ejercicio</h1>

        {/* Previsualización del video seleccionado */}
        {selectedVideo && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[#34C759] mb-2">Previsualización</h2>
            {isYouTubeUrl(selectedVideo) ? (
              <iframe
                src={selectedVideo}
                title="YouTube Video Preview"
                className="w-full h-64 rounded-md border border-[#4A4A4A] bg-[#2D2D2D]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                controls
                src={selectedVideo}
                className="w-full rounded-md border border-[#4A4A4A] bg-[#2D2D2D]"
                onError={() => setError("Error al cargar el video seleccionado")}
              >
                Tu navegador no soporta el elemento de video.
              </video>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lista de videos */}
          <Card className="p-2 bg-[#252525] border-2 border-[#4A4A4A] rounded-md mb-2">
            <div className="py-1 bg-[#2D2D2D] px-2 rounded-t-md">
              <h2 className="text-sm font-bold text-[#34C759]">Videos</h2>
            </div>
            <div className="mt-1 space-y-2">
              {videos.length === 0 ? (
                <p className="text-[#D1D1D1] text-xs">No hay videos aún</p>
              ) : (
                videos.map((video, videoIndex) => (
                  <div
                    key={video._id}
                    className="space-y-1 border-t border-[#3A3A3A] pt-2"
                  >
                    <label className="block text-[#D1D1D1] text-xs font-semibold">
                      Video {videoIndex + 1} {video.isCurrent ? "(Actual)" : ""}
                    </label>
                    <Input
                      name={`videoUrl-${video._id}`}
                      type="text"
                      value={video.url}
                      onChange={() => {}}
                      disabled
                      className="bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-xs w-full disabled:opacity-70"
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setSelectedVideo(video.url)}
                        className="w-1/3 bg-[#FFD700] text-black hover:bg-[#FFC107] rounded-md py-1 px-2 text-xs font-semibold border border-[#FFC107] shadow-md"
                      >
                        Ver
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => handleSetCurrent(video._id)}
                        disabled={video.isCurrent}
                        className="w-1/3 bg-[#42A5F5] text-black hover:bg-[#1E88E5] rounded-md py-1 px-2 text-xs font-semibold border border-[#1E88E5] shadow-md disabled:bg-[#1E88E5] disabled:opacity-50"
                      >
                        Hacer Actual
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleRemoveVideo(video._id)}
                        className="w-1/3 bg-[#EF5350] text-white hover:bg-[#D32F2F] rounded-md py-1 px-2 text-xs font-semibold border border-[#D32F2F] shadow-md"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Agregar nuevo video */}
          <div>
            <label className="block text-[#D1D1D1] text-xs font-medium mb-1">Nuevo Video (URL)</label>
            <Input
              name="newVideoUrl"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... o https://ejemplo.com/video.mp4"
              className="bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-2 text-xs w-full focus:ring-1 focus:ring-[#34C759] focus:border-transparent"
            />
            <Button
              variant="secondary"
              type="button"
              onClick={handleAddVideo}
              className="mt-2 w-full bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-md py-1 px-2 text-xs font-semibold border border-[#4CAF50] shadow-md"
            >
              + Agregar Video
            </Button>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-1/2 bg-[#66BB6A] text-black hover:bg-[#4CAF50] rounded-md py-1 px-2 text-xs font-semibold border border-[#4CAF50] shadow-md disabled:bg-[#4CAF50] disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/routine-edit/${routineId}`)}
              className="w-1/2 bg-[#EF5350] text-white hover:bg-[#D32F2F] rounded-md py-1 px-2 text-xs font-semibold border border-[#D32F2F] shadow-md"
            >
              Cancelar
            </Button>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
}