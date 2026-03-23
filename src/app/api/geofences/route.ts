import { NextResponse } from "next/server";

import {
  BackendApiError,
  createSharedApiCacheControlHeader,
  listGeoFencesFromBackend,
} from "@/lib/backend-api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? undefined;
    const geofences = await listGeoFencesFromBackend(userId);

    return NextResponse.json(geofences, {
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
    { error: "Failed to load geofences from the backend." },
    {
      status: 500,
    },
  );
}
