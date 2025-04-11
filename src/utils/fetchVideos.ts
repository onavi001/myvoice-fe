import { IVideo } from "../models/Video";

export async function fetchVideos(exerciseName: string): Promise<IVideo[]> {
  const YOUTUBE_API_KEY = import.meta.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "TU_CLAVE_API_YOUTUBE";
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        `${exerciseName} técnica de ejercicio`
      )}&type=video&maxResults=5&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const videoUrls = data.items.map((item: { id: { videoId: string } }) => `https://www.youtube.com/embed/${item.id.videoId}`);
      return videoUrls.map((url: string, idx: number) => ({
        url,
        isCurrent: idx === 0,
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching YouTube video:", err);
    return [];
  }
}