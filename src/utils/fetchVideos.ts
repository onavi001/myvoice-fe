import { IVideo } from "../models/Video";
export async function fetchVideos(exerciseName: string, token: string): Promise<IVideo[]> {
  try {
    const response = await fetch("/api/videos?exerciseName="+exerciseName, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Error al obtener videos");
    const videos = await response.json();
    return videos;
  } catch (error) {
    console.error("Error fetching YouTube video:", error);
    return [];
  }
}