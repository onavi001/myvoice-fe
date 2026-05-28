import Cookies from "js-cookie";

export interface ApiError {
  message: string;
  status?: number;
}

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
  error?: unknown;
};

type RequestOptions = RequestInit & {
  auth?: boolean;
  /** Aborta la petición tras N ms (útil para IA / importación). */
  timeoutMs?: number;
};

const readToken = () => Cookies.get("token") || localStorage.getItem("token") || "";
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";
const DEFAULT_API_BASE_URL = "https://myvoice-be.vercel.app";
const API_BASE_URL = (RAW_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

const resolveApiUrl = (url: string) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (API_BASE_URL) {
    return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  }

  return url;
};

export async function apiClient<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, timeoutMs, ...rest } = options;
  const token = readToken();

  const finalHeaders = new Headers(headers || {});
  if (!finalHeaders.has("Content-Type") && rest.body) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const controller = timeoutMs != null ? new AbortController() : undefined;
  const timeoutId =
    timeoutMs != null
      ? window.setTimeout(() => controller?.abort(), timeoutMs)
      : undefined;

  let response: Response;
  try {
    response = await fetch(resolveApiUrl(url), {
      ...rest,
      headers: finalHeaders,
      signal: controller?.signal ?? rest.signal,
    });
  } catch (fetchError) {
    if (timeoutId != null) window.clearTimeout(timeoutId);
    const isAbort = fetchError instanceof DOMException && fetchError.name === "AbortError";
    throw {
      message: isAbort ? "La solicitud tardó demasiado tiempo" : "Failed to fetch",
      status: isAbort ? 408 : undefined,
    } as ApiError;
  } finally {
    if (timeoutId != null) window.clearTimeout(timeoutId);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && payload && "message" in payload && String(payload.message)) ||
      (typeof payload === "object" && payload && "error" in payload && String(payload.error)) ||
      response.statusText ||
      "Request failed";
    throw { message, status: response.status } as ApiError;
  }

  if (typeof payload === "object" && payload !== null && "data" in (payload as ApiEnvelope<T>)) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
}

