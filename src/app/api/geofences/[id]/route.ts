import { NextResponse } from "next/server";

import {
  BackendApiError,
  createSharedApiCacheControlHeader,
  getGeoFenceFromBackend,
} from "@/lib/backend-api";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/geofences/[id]">,
) {
  try {
    const { id } = await context.params;
    const geofence = await getGeoFenceFromBackend(id);

    return NextResponse.json(geofence, {
      headers: {
        "Cache-Control": createSharedApiCacheControlHeader(),
      },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

function createErrorResponse(error: unknown) {
  if (error instanceof BackendApiError) {
    return NextResponse.json(
      { error: error.message },
      {
        status: error.status,
      },
    );
  }

  return NextResponse.json(
    { error: "Failed to load the requested geofence from the backend." },
    {
      status: 500,
    },
  );
}
