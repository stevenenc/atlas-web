import type { GeoFenceDto } from "@/lib/geofences";

type ApiErrorPayload = {
  error?: string;
};

async function parseApiError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;

    if (payload.error) {
      return response.status === 404 ? `404: ${payload.error}` : payload.error;
    }
  } catch {}

  return `Request failed with status ${response.status}.`;
}

export async function getGeoFences(
  userId?: string,
  signal?: AbortSignal,
): Promise<GeoFenceDto[]> {
  const url = new URL("/api/geofences", window.location.origin);

  if (userId) {
    url.searchParams.set("userId", userId);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as GeoFenceDto[];
}

export async function getGeoFenceById(
  id: string,
  signal?: AbortSignal,
): Promise<GeoFenceDto> {
  const response = await fetch(`/api/geofences/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as GeoFenceDto;
}
