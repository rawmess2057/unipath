import type { ApiResponse } from '@unipath/shared';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface CvUploadInput {
  file: File;
  targetIndustry: string;
  fieldOfStudy: string;
}

let authHeaders: Record<string, string> = {};

export function setAuthHeaders(headers: Record<string, string>) {
  authHeaders = headers;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...options?.headers },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(res.status, json.error ?? 'Request failed');
  }

  return json.data as T;
}

function mergeHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...authHeaders, ...extra };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  upload: async <T>(path: string, file: File, extraFields?: Record<string, string>): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);
    if (extraFields) {
      for (const [key, value] of Object.entries(extraFields)) {
        formData.append(key, value);
      }
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      body: formData,
      headers: authHeaders,
    });

    const json: ApiResponse<T> = await res.json();

    if (!res.ok || !json.success) {
      throw new ApiError(res.status, json.error ?? 'Upload failed');
    }

    return json.data as T;
  },
};
