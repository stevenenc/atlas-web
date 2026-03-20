import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import {
  clampTimelineTime,
  getTimelineBounds,
  isIncidentActiveAtTime,
} from "@/features/atlascope/lib/incident-timeline";
import type { Incident, IncidentType } from "@/features/atlascope/types/atlascope";

const PLAYBACK_DURATION_MS = 18_000;

type ActiveLayers = Record<IncidentType, boolean>;

type UseAtlascopeTimelineOptions = {
  incidents: Incident[];
  initialLayers: ActiveLayers;
};

export function useAtlascopeTimeline({
  incidents,
  initialLayers,
}: UseAtlascopeTimelineOptions) {
  const timelineBounds = useMemo(() => getTimelineBounds(incidents), [incidents]);
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>(() => ({ ...initialLayers }));
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [selectedTimeMs, setSelectedTimeMs] = useState(timelineBounds.startMs);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [isTimelineInteracting, setIsTimelineInteracting] = useState(false);
  const loadingTimerRef = useRef<number | null>(null);
  const playbackFrameRef = useRef<number | null>(null);
  const playbackStartRef = useRef<number | null>(null);
  const playbackOriginTimeRef = useRef(timelineBounds.startMs);
  const selectedTimeRef = useRef(timelineBounds.startMs);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }

      if (playbackFrameRef.current) {
        window.cancelAnimationFrame(playbackFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    selectedTimeRef.current = selectedTimeMs;
  }, [selectedTimeMs]);

  useEffect(() => {
    if (!isTimelinePlaying) {
      if (playbackFrameRef.current) {
        window.cancelAnimationFrame(playbackFrameRef.current);
        playbackFrameRef.current = null;
      }

      playbackStartRef.current = null;
      return;
    }

    const totalRangeMs = Math.max(1, timelineBounds.endMs - timelineBounds.startMs);
    playbackOriginTimeRef.current = selectedTimeRef.current;
    playbackStartRef.current = null;

    const runFrame = (frameTime: number) => {
      if (playbackStartRef.current === null) {
        playbackStartRef.current = frameTime;
      }

      const elapsedMs = frameTime - playbackStartRef.current;
      const nextTime = clampTimelineTime(
        playbackOriginTimeRef.current + (elapsedMs / PLAYBACK_DURATION_MS) * totalRangeMs,
        timelineBounds,
      );

      startTransition(() => {
        setSelectedTimeMs(nextTime);
      });

      if (nextTime >= timelineBounds.endMs) {
        playbackFrameRef.current = null;
        playbackStartRef.current = null;
        setIsTimelinePlaying(false);
        return;
      }

      playbackFrameRef.current = window.requestAnimationFrame(runFrame);
    };

    playbackFrameRef.current = window.requestAnimationFrame(runFrame);

    return () => {
      if (playbackFrameRef.current) {
        window.cancelAnimationFrame(playbackFrameRef.current);
        playbackFrameRef.current = null;
      }
    };
  }, [isTimelinePlaying, timelineBounds]);

  const trackedIncidents = useMemo(
    () => incidents.filter((incident) => activeLayers[incident.type]),
    [activeLayers, incidents],
  );
  const activeIncidents = useMemo(
    () =>
      trackedIncidents.filter((incident) => isIncidentActiveAtTime(incident, selectedTimeMs)),
    [selectedTimeMs, trackedIncidents],
  );
  const activeIncidentIds = useMemo(
    () => new Set(activeIncidents.map((incident) => incident.id)),
    [activeIncidents],
  );
  const visibleSelectedIncident =
    selectedIncident &&
    activeLayers[selectedIncident.type] &&
    activeIncidentIds.has(selectedIncident.id)
      ? selectedIncident
      : null;
  const selectedIncidentId = selectedIncident?.id ?? null;
  const shouldOffsetTimeline = Boolean(visibleSelectedIncident) || isPanelLoading;

  function handleToggleLayer(layer: IncidentType) {
    setActiveLayers((current) => {
      const next = { ...current, [layer]: !current[layer] };

      if (selectedIncident && !next[selectedIncident.type]) {
        setSelectedIncident(null);
        setIsPanelLoading(false);

        if (loadingTimerRef.current) {
          window.clearTimeout(loadingTimerRef.current);
          loadingTimerRef.current = null;
        }
      }

      return next;
    });
  }

  function handleSelectIncident(incident: Incident) {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
    }

    setIsPanelLoading(true);
    loadingTimerRef.current = window.setTimeout(() => {
      setSelectedIncident(incident);
      setIsPanelLoading(false);
      loadingTimerRef.current = null;
    }, 280);
  }

  function handleClosePanel() {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    setIsPanelLoading(false);
    setSelectedIncident(null);
  }

  function handleTimelinePlayPause() {
    setIsTimelinePlaying((current) => {
      if (current) {
        return false;
      }

      if (selectedTimeRef.current >= timelineBounds.endMs) {
        const resetTime = timelineBounds.startMs;
        selectedTimeRef.current = resetTime;
        setSelectedTimeMs(resetTime);
      }

      return true;
    });
  }

  function handleTimelineTimeChange(nextTimeMs: number) {
    setIsTimelinePlaying(false);
    setSelectedTimeMs(clampTimelineTime(nextTimeMs, timelineBounds));
  }

  return {
    activeIncidents,
    activeLayers,
    handleClosePanel,
    handleSelectIncident,
    handleTimelinePlayPause,
    handleTimelineTimeChange,
    handleToggleLayer,
    isPanelLoading,
    isTimelineInteracting,
    isTimelinePlaying,
    selectedIncidentId,
    selectedTimeMs,
    setIsTimelineInteracting,
    shouldOffsetTimeline,
    timelineBounds,
    trackedIncidents,
    visibleSelectedIncident,
  };
}
