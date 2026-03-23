"use client";

import { useEffect, useState } from "react";

import { getGeoFenceById, getGeoFences } from "@/lib/api";
import type { GeoFenceDto } from "@/lib/geofences";

type QueryState<T> = {
  data: T | null;
  errorMessage: string | null;
  isLoading: boolean;
};

const initialQueryState = {
  errorMessage: null,
  isLoading: true,
} as const;

export function useGeoFencesQuery(userId?: string): QueryState<GeoFenceDto[]> {
  const [state, setState] = useState<QueryState<GeoFenceDto[]>>({
    ...initialQueryState,
    data: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    void getGeoFences(userId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data,
          errorMessage: null,
          isLoading: false,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          errorMessage:
            error instanceof Error ? error.message : "Failed to load geofences.",
          isLoading: false,
        });
      });

    return () => {
      controller.abort();
    };
  }, [userId]);

  return state;
}

export function useGeoFenceQuery(id: string): QueryState<GeoFenceDto> {
  const [state, setState] = useState<QueryState<GeoFenceDto>>({
    ...initialQueryState,
    data: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    void getGeoFenceById(id, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data,
          errorMessage: null,
          isLoading: false,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          errorMessage:
            error instanceof Error ? error.message : `Failed to load geofence ${id}.`,
          isLoading: false,
        });
      });

    return () => {
      controller.abort();
    };
  }, [id]);

  return state;
}
