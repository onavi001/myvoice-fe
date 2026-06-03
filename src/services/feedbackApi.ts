import { apiClient } from "../utils/apiClient";
import type {
  AdminFeedbackItem,
  CreateFeedbackPayload,
  FeedbackItem,
} from "../types/feedback";

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

export async function fetchAdminFeedback(): Promise<AdminFeedbackItem[]> {
  return apiClient<AdminFeedbackItem[]>("/api/feedback/admin");
}
