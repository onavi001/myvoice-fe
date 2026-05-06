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
};

const readToken = () => Cookies.get("token") || localStorage.getItem("token") || "";
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

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
  const { auth = true, headers, ...rest } = options;
  const token = readToken();

  const finalHeaders = new Headers(headers || {});
  if (!finalHeaders.has("Content-Type") && rest.body) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth && token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveApiUrl(url), {
    ...rest,
    headers: finalHeaders,
  });

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

