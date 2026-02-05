import { getAuthToken } from "@/lib/api/auth-token";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

export type ApiError = Error & {
  status: number;
  data?: unknown;
};

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  withAuth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type ApiRequestConfig = AxiosRequestConfig & {
  withAuth?: boolean;
  token?: string | null;
};

const apiClient = axios.create({
  baseURL: "",
});

async function resolveToken(options?: ApiFetchOptions) {
  if (!options?.withAuth) return null;
  if (options.token !== undefined) return options.token;
  return getAuthToken();
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = await resolveToken(options);
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const config: ApiRequestConfig = {
    url: path,
    method: options.method ?? "GET",
    headers,
    data: isFormData ? options.body : options.body ?? undefined,
    signal: options.signal,
  };

  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (err) {
    const error = new Error("Request failed") as ApiError;
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      error.message = axiosError.message;
      error.status = axiosError.response?.status ?? 0;
      error.data = axiosError.response?.data;
      throw error;
    }
    error.status = 0;
    throw error;
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<ApiFetchOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
