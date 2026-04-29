import { IVideo } from "../models/Video";
import { apiClient } from "./apiClient";
export async function fetchVideos(exerciseName: string): Promise<IVideo[]> {
  try {
    const videos = await apiClient<IVideo[]>(`/api/videos?exerciseName=${encodeURIComponent(exerciseName)}`, {
      method: "GET",
      auth: true,
    });
    return videos;
  } catch (error) {
    console.error("Error fetching YouTube video:", error);
    return [];
  }
}