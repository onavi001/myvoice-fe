import { apiClient } from "../utils/apiClient";
import type { CreateFeedbackPayload, FeedbackItem } from "../types/feedback";

export async function submitFeedback(payload: CreateFeedbackPayload): Promise<{
  id: string;
  createdAt: string;
}> {
  return apiClient("/api/feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchMyFeedback(): Promise<FeedbackItem[]> {
  return apiClient<FeedbackItem[]>("/api/feedback/mine");
}
