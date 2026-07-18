import axios, { AxiosError } from "axios";
import type { ApiErrorPayload, BoundingBox, FiresResponse, Filters } from "./types";

const api = axios.create({
  baseURL: "/api",
  timeout: 25000,
});

function formatApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const axiosError = error as AxiosError<ApiErrorPayload>;
    const payload = axiosError.response?.data;

    if (typeof payload?.error === "string") {
      return payload.error;
    }

    const fieldErrors = payload?.error && "fieldErrors" in payload.error ? payload.error.fieldErrors : undefined;
    if (fieldErrors) {
      return Object.entries(fieldErrors)
        .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
        .join(" | ");
    }

    if (axiosError.response?.status) {
      return `Erreur API ${axiosError.response.status}. Verifiez le backend ou la cle NASA FIRMS.`;
    }
  }

  return "Impossible de contacter l'API SatFire.";
}

export async function fetchFiresByArea(bbox: BoundingBox, filters: Filters): Promise<FiresResponse> {
  try {
    const params = {
      bbox: `${bbox.west.toFixed(4)},${bbox.south.toFixed(4)},${bbox.east.toFixed(4)},${bbox.north.toFixed(4)}`,
      source: filters.source,
      days: filters.days,
    };

    const response = await api.get<FiresResponse>("/fires/area", { params });
    return response.data;
  } catch (error) {
    throw new Error(formatApiError(error));
  }
}
