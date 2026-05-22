import type { ApiError } from "./apiClient";

const AI_TIMEOUT_MESSAGE =
  "La operación con IA tardó demasiado. Prueba con menos fotos, un PDF más corto o de nuevo en unos minutos.";

export function normalizeApiErrorMessage(
  error: unknown,
  fallback: string,
  options?: { aiLongRunning?: boolean }
): string {
  const err = error as ApiError & { name?: string };
  const status = err?.status;
  const raw = typeof err?.message === "string" ? err.message.trim() : "";

  if (
    status === 504 ||
    status === 408 ||
    err?.name === "AbortError" ||
    raw.toLowerCase().includes("gateway timeout") ||
    raw.toLowerCase().includes("timed out")
  ) {
    return options?.aiLongRunning ? AI_TIMEOUT_MESSAGE : "El servidor tardó demasiado. Intenta de nuevo en un momento.";
  }

  if (status === 429 || raw.includes("RATE_LIMIT") || raw.includes("Demasiadas solicitudes")) {
    return "Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.";
  }

  if (status === 401) {
    return raw || "Sesión expirada. Inicia sesión de nuevo.";
  }

  if (
    raw === "Failed to fetch" ||
    raw.includes("NetworkError") ||
    raw.includes("Load failed") ||
    raw.includes("network")
  ) {
    return options?.aiLongRunning
      ? "No se pudo completar la solicitud. Comprueba tu conexión e inténtalo de nuevo."
      : "No hay conexión con el servidor. Comprueba tu internet.";
  }

  if (raw && raw !== "Request failed") {
    return raw;
  }

  return fallback;
}

export function toThunkError(
  error: unknown,
  fallback: string,
  options?: { aiLongRunning?: boolean }
): { message: string; status?: number } {
  const apiError = error as ApiError;
  return {
    message: normalizeApiErrorMessage(error, fallback, options),
    status: apiError?.status,
  };
}
