import "server-only";

import type { GeoFenceDto } from "@/lib/geofences";

const DEFAULT_DEVELOPMENT_API_BASE_URL = "http://localhost:5199";
const DEFAULT_API_TIMEOUT_MS = 8_000;
const DEFAULT_GEOFENCE_REVALIDATE_SECONDS = 60;
const DEFAULT_STALE_WHILE_REVALIDATE_SECONDS = 300;
const GEOFENCE_LIST_TAG = "geofences";

export class BackendApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
  }
}

export async function listGeoFencesFromBackend(userId?: string): Promise<GeoFenceDto[]> {
  const url = new URL("/api/geofences", `${getAtlasApiBaseUrl()}/`);

  if (userId) {
    url.searchParams.set("userId", userId);
  }

  return fetchBackendJson<GeoFenceDto[]>(url, {
    tags: [GEOFENCE_LIST_TAG],
  });
}

export async function getGeoFenceFromBackend(id: string): Promise<GeoFenceDto> {
  const url = new URL(
    `/api/geofences/${encodeURIComponent(id)}`,
    `${getAtlasApiBaseUrl()}/`,
  );

  return fetchBackendJson<GeoFenceDto>(url, {
    tags: [GEOFENCE_LIST_TAG, getGeoFenceTag(id)],
  });
}

export function createSharedApiCacheControlHeader() {
  const revalidate = getGeoFenceRevalidateSeconds();
  const staleWhileRevalidate = Math.max(
    revalidate * 5,
    DEFAULT_STALE_WHILE_REVALIDATE_SECONDS,
  );

  return `public, max-age=0, s-maxage=${revalidate}, stale-while-revalidate=${staleWhileRevalidate}`;
}

function getGeoFenceTag(id: string) {
  return `geofence:${id}`;
}

async function fetchBackendJson<T>(
  url: URL,
  options: {
    tags: string[];
  },
): Promise<T> {
  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: getGeoFenceRevalidateSeconds(),
      tags: options.tags,
    },
    signal: AbortSignal.timeout(getApiTimeoutMs()),
  });

  if (!response.ok) {
    let message = `Upstream request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as {
        error?: string;
        message?: string;
      };

      message = payload.error ?? payload.message ?? message;
    } catch {}

    throw new BackendApiError(message, response.status);
  }

  return (await response.json()) as T;
}

function getAtlasApiBaseUrl() {
  const configuredValue = process.env.ATLAS_API_BASE_URL;

  if (configuredValue) {
    return configuredValue.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEVELOPMENT_API_BASE_URL;
  }

  throw new BackendApiError(
    "ATLAS_API_BASE_URL must be configured in production before the frontend can reach the backend API.",
    500,
  );
}

function getApiTimeoutMs() {
  return getPositiveIntegerEnv("ATLAS_API_TIMEOUT_MS", DEFAULT_API_TIMEOUT_MS);
}

function getGeoFenceRevalidateSeconds() {
  return getPositiveIntegerEnv(
    "ATLAS_GEOFENCE_REVALIDATE_SECONDS",
    DEFAULT_GEOFENCE_REVALIDATE_SECONDS,
  );
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}
