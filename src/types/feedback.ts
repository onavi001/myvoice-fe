export type FeedbackCategory = "idea" | "bug" | "help" | "praise" | "other";

export type FeedbackItem = {
  id: string;
  category: FeedbackCategory;
  message: string;
  rating?: number;
  status: string;
  createdAt: string;
};

export type CreateFeedbackPayload = {
  category: FeedbackCategory;
  message: string;
  rating?: number;
  platform?: string;
  appVersion?: string;
};

export const FEEDBACK_CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  hint: string;
}[] = [
  { id: "idea", label: "Idea", hint: "Algo que te gustaría ver en la app" },
  { id: "praise", label: "Me gusta", hint: "Lo que ya te funciona bien" },
  { id: "help", label: "Ayuda", hint: "Duda o algo que no entiendes" },
  { id: "bug", label: "Problema", hint: "Algo que falla o se ve mal" },
  { id: "other", label: "Otro", hint: "Cualquier cosa que quieras contarnos" },
];
