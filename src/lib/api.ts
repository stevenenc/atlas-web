const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5199";

export type GeoFenceDto = {
  id: string;
  userId: string;
  name: string;
  geometryJson: string;
  updatedAtUtc: string;
};

export async function getGeoFences(userId?: string): Promise<GeoFenceDto[]> {
  const url = new URL(`${API_BASE_URL}/api/geofences`);

  if (userId) {
    url.searchParams.set("userId", userId);
  }

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch geofences: ${response.status}`);
  }

  return response.json();
}

export async function getGeoFenceById(id: string): Promise<GeoFenceDto> {
  const response = await fetch(`${API_BASE_URL}/api/geofences/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch geofence ${id}: ${response.status}`);
  }

  return response.json();
}