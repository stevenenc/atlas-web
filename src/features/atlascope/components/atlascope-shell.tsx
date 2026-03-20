"use client";

import type { ReactNode } from "react";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BasePanel,
  PanelHeader,
  usePanelManager,
} from "@/features/atlascope/components/panel-system";
import {
  atlasUi,
  cx,
  layerRows,
  type ThemeMode,
} from "@/features/atlascope/config/theme";
import { TimelineControlBar } from "@/features/atlascope/components/timeline-control-bar";
import { mockGeofences } from "@/features/atlascope/data/mock-geofences";
import { incidents } from "@/features/atlascope/data/mock-incidents";
import {
  clampTimelineTime,
  formatTimelineDate,
  getTimelineBounds,
  isIncidentActiveAtTime,
} from "@/features/atlascope/lib/incident-timeline";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";
import type { Incident, IncidentType } from "@/features/atlascope/types/atlascope";
import type { MapCoordinates } from "@/features/atlascope/map/map-types";

import { GeofencePanel, type Geofence } from "./geofence-panel";
import { IncidentPanel } from "./incident-panel";
import { MapView } from "./map-view";

const initialLayers: Record<IncidentType, boolean> = {
  earthquake: true,
  wildfire: true,
  air_quality: true,
};

type OverlayPanelId = "search" | "user" | "layers" | "geofences";
const PLAYBACK_DURATION_MS = 18_000;

export function AtlascopeShell() {
  const timelineBounds = useMemo(() => getTimelineBounds(incidents), []);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [activeLayers, setActiveLayers] = useState(initialLayers);
  const [geofences, setGeofences] = useState<AtlascopeGeofence[]>(mockGeofences);
  const [drawingGeofenceCoordinates, setDrawingGeofenceCoordinates] = useState<
    MapCoordinates[]
  >([]);
  const [isDrawingGeofence, setIsDrawingGeofence] = useState(false);
  const [editingGeofenceId, setEditingGeofenceId] = useState<number | null>(null);
  const [renamingGeofenceId, setRenamingGeofenceId] = useState<number | null>(null);
  const [editingGeofenceSnapshot, setEditingGeofenceSnapshot] = useState<MapCoordinates[] | null>(
    null,
  );
  const [geofenceDraftName, setGeofenceDraftName] = useState("");
  const [enteringGeofenceId, setEnteringGeofenceId] = useState<number | null>(null);
  const [showGeofenceRowActions, setShowGeofenceRowActions] = useState(false);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<number | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [selectedTimeMs, setSelectedTimeMs] = useState(timelineBounds.startMs);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [isTimelineInteracting, setIsTimelineInteracting] = useState(false);
  const [activeOverlayPanel, setActiveOverlayPanel] = useState<OverlayPanelId | null>(null);
  const [focusedGeofenceRequest, setFocusedGeofenceRequest] = useState<{
    geofenceId: number;
    nonce: number;
  } | null>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const geofenceEnterTimerRef = useRef<number | null>(null);
  const playbackFrameRef = useRef<number | null>(null);
  const playbackStartRef = useRef<number | null>(null);
  const playbackOriginTimeRef = useRef(timelineBounds.startMs);
  const selectedGeofencePreviewRef = useRef<{
    geofenceId: number;
    previousVisibility: boolean;
  } | null>(null);
  const selectedTimeRef = useRef(timelineBounds.startMs);
  const overlayControlsRef = useRef<HTMLDivElement | null>(null);
  const isGeofencePanelPersistent = isDrawingGeofence || editingGeofenceId !== null;
  const restoreSelectedGeofencePreview = useCallback(() => {
    const preview = selectedGeofencePreviewRef.current;

    if (!preview) {
      return;
    }

    selectedGeofencePreviewRef.current = null;
    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === preview.geofenceId
          ? { ...geofence, isEnabled: preview.previousVisibility }
          : geofence,
      ),
    );
  }, []);
  const panelConfigs = useMemo(
    () => ({
      search: { dismissible: true },
      user: { dismissible: true },
      layers: { dismissible: true },
      geofences: { dismissible: !isGeofencePanelPersistent },
    }),
    [isGeofencePanelPersistent],
  );
  const handleActiveOverlayPanelChange = useCallback((nextPanel: OverlayPanelId | null) => {
    if (nextPanel !== "geofences") {
      restoreSelectedGeofencePreview();
      setSelectedGeofenceId(null);
      setShowGeofenceRowActions(false);
      setEditingGeofenceId(null);
      setRenamingGeofenceId(null);
      setEditingGeofenceSnapshot(null);
    }

    setActiveOverlayPanel(nextPanel);
  }, [restoreSelectedGeofencePreview]);
  const { openPanel, togglePanel, isPanelOpen } = usePanelManager<OverlayPanelId>({
    activePanel: activeOverlayPanel,
    onActivePanelChange: handleActiveOverlayPanelChange,
    panelConfigs,
    panelRootRef: overlayControlsRef,
  });
  const trackedIncidents = useMemo(
    () => incidents.filter((incident) => activeLayers[incident.type]),
    [activeLayers],
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
  const shouldOffsetTimeline = Boolean(visibleSelectedIncident) || isPanelLoading;

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current);
      }

      if (geofenceEnterTimerRef.current) {
        window.clearTimeout(geofenceEnterTimerRef.current);
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
    if (selectedGeofenceId === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(`[data-geofence-item-id="${selectedGeofenceId}"]`)) {
        return;
      }

      restoreSelectedGeofencePreview();
      setSelectedGeofenceId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [restoreSelectedGeofencePreview, selectedGeofenceId]);

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

  const handleCancelEditingGeofence = useCallback((geofence: Geofence) => {
    if (editingGeofenceSnapshot) {
      setGeofences((current) =>
        current.map((item) =>
          item.id === geofence.id
            ? {
                ...item,
                coordinates: editingGeofenceSnapshot.map((point) => ({ ...point })),
              }
            : item,
        ),
      );
    }

    setEditingGeofenceSnapshot(null);
    setEditingGeofenceId((current) => (current === geofence.id ? null : current));
    setRenamingGeofenceId((current) => (current === geofence.id ? null : current));
    setGeofenceDraftName(geofence.name);
  }, [editingGeofenceSnapshot]);

  useEffect(() => {
    if (editingGeofenceId === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const geofence = geofences.find((item) => item.id === editingGeofenceId);

      if (!geofence) {
        return;
      }

      event.preventDefault();
      handleCancelEditingGeofence(geofence);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingGeofenceId, geofences, handleCancelEditingGeofence]);

  function handleToggleLayer(layer: IncidentType) {
    setActiveLayers((current) => {
      const next = { ...current, [layer]: !current[layer] };

      if (selectedIncident && !next[selectedIncident.type]) {
        setSelectedIncident(null);
        setIsPanelLoading(false);
        if (loadingTimerRef.current) {
          window.clearTimeout(loadingTimerRef.current);
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

  function handleAddGeofence() {
    setShowGeofenceRowActions(false);
    setEditingGeofenceId(null);
    setRenamingGeofenceId(null);
    setEditingGeofenceSnapshot(null);
    setGeofenceDraftName("New Geofence");
    setDrawingGeofenceCoordinates([]);
    setIsDrawingGeofence(true);
    openPanel("geofences");
  }

  function handleAddGeofencePoint(coordinates: MapCoordinates) {
    if (!isDrawingGeofence) {
      return;
    }

    setDrawingGeofenceCoordinates((current) => [...current, coordinates]);
  }

  function handleUpdateDrawingGeofencePoint(index: number, coordinates: MapCoordinates) {
    if (!isDrawingGeofence) {
      return;
    }

    setDrawingGeofenceCoordinates((current) =>
      current.map((point, pointIndex) =>
        pointIndex === index ? coordinates : point,
      ),
    );
  }

  function handleRemoveDrawingGeofencePoint(index: number) {
    if (!isDrawingGeofence) {
      return;
    }

    setDrawingGeofenceCoordinates((current) =>
      current.filter((_, pointIndex) => pointIndex !== index),
    );
  }

  function handleAddEditingGeofencePoint(coordinates: MapCoordinates) {
    if (isDrawingGeofence || editingGeofenceId === null) {
      return;
    }

    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === editingGeofenceId
          ? { ...geofence, coordinates: [...geofence.coordinates, coordinates] }
          : geofence,
      ),
    );
  }

  function handleUpdateEditingGeofencePoint(index: number, coordinates: MapCoordinates) {
    if (isDrawingGeofence || editingGeofenceId === null) {
      return;
    }

    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === editingGeofenceId
          ? {
              ...geofence,
              coordinates: geofence.coordinates.map((point, pointIndex) =>
                pointIndex === index ? coordinates : point,
              ),
            }
          : geofence,
      ),
    );
  }

  function handleRemoveEditingGeofencePoint(index: number) {
    if (isDrawingGeofence || editingGeofenceId === null) {
      return;
    }

    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === editingGeofenceId
          ? {
              ...geofence,
              coordinates: geofence.coordinates.filter((_, pointIndex) => pointIndex !== index),
            }
          : geofence,
      ),
    );
  }

  function handleCancelDrawingGeofence() {
    setIsDrawingGeofence(false);
    setDrawingGeofenceCoordinates([]);
  }

  const handleFinishDrawingGeofence = useCallback(() => {
    if (drawingGeofenceCoordinates.length < 3) {
      return;
    }

    const id = Date.now();

    setGeofences((current) => [
      ...current,
      {
        id,
        name: "New Geofence",
        isEnabled: true,
        coordinates: drawingGeofenceCoordinates,
      },
    ]);
    setEditingGeofenceId(id);
    setRenamingGeofenceId(id);
    setEditingGeofenceSnapshot(null);
    setGeofenceDraftName("New Geofence");
    setEnteringGeofenceId(id);
    setIsDrawingGeofence(false);
    setDrawingGeofenceCoordinates([]);
    openPanel("geofences");

    if (geofenceEnterTimerRef.current) {
      window.clearTimeout(geofenceEnterTimerRef.current);
    }

    geofenceEnterTimerRef.current = window.setTimeout(() => {
      setEnteringGeofenceId((current) => (current === id ? null : current));
      geofenceEnterTimerRef.current = null;
    }, 220);
  }, [drawingGeofenceCoordinates, openPanel]);

  function handleRenameGeofence(id: number, name: string) {
    setGeofences((current) =>
      current.map((geofence) => (geofence.id === id ? { ...geofence, name } : geofence)),
    );
  }

  function handleToggleGeofenceVisibility(id: number) {
    setGeofences((current) =>
      current.map((geofence) =>
        geofence.id === id
          ? { ...geofence, isEnabled: !geofence.isEnabled }
          : geofence,
      ),
    );
  }

  function handleStartEditingGeofence(geofence: Geofence) {
    setEditingGeofenceId((current) => {
      const nextId = current === geofence.id ? null : geofence.id;

      setEditingGeofenceSnapshot(
        nextId === geofence.id ? geofence.coordinates.map((point) => ({ ...point })) : null,
      );

      return nextId;
    });
    setRenamingGeofenceId(null);
    openPanel("geofences");
  }

  function handleStartRenamingGeofence(geofence: Geofence) {
    setEditingGeofenceId(null);
    setEditingGeofenceSnapshot(null);
    setRenamingGeofenceId(geofence.id);
    setGeofenceDraftName(geofence.name);
    handleFocusGeofence(geofence);
    openPanel("geofences");
  }

  function handleSaveEditingGeofence() {
    setEditingGeofenceSnapshot(null);
    setEditingGeofenceId(null);
    setRenamingGeofenceId(null);
  }

  function handleDeleteGeofence(id: number) {
    if (selectedGeofencePreviewRef.current?.geofenceId === id) {
      selectedGeofencePreviewRef.current = null;
    }

    setGeofences((current) => current.filter((geofence) => geofence.id !== id));
    setEditingGeofenceId((current) => (current === id ? null : current));
    setRenamingGeofenceId((current) => (current === id ? null : current));
    setEditingGeofenceSnapshot((current) => (editingGeofenceId === id ? null : current));
    setEnteringGeofenceId((current) => (current === id ? null : current));
    setSelectedGeofenceId((current) => (current === id ? null : current));
  }

  function handleFocusGeofence(geofence: Geofence) {
    if (selectedGeofenceId !== geofence.id) {
      restoreSelectedGeofencePreview();
      selectedGeofencePreviewRef.current = {
        geofenceId: geofence.id,
        previousVisibility: geofence.isEnabled,
      };

      if (!geofence.isEnabled) {
        setGeofences((current) =>
          current.map((item) =>
            item.id === geofence.id ? { ...item, isEnabled: true } : item,
          ),
        );
      }
    }

    setSelectedGeofenceId(geofence.id);
    setFocusedGeofenceRequest({
      geofenceId: geofence.id,
      nonce: Date.now(),
    });
  }

  useEffect(() => {
    if (!isDrawingGeofence && editingGeofenceId === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        if (isDrawingGeofence) {
          handleCancelDrawingGeofence();
          return;
        }

        const geofence = geofences.find((item) => item.id === editingGeofenceId);

        if (geofence) {
          handleCancelEditingGeofence(geofence);
        }

        return;
      }

      if (event.key !== "Enter") {
        return;
      }

      if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      event.preventDefault();

      if (isDrawingGeofence) {
        if (drawingGeofenceCoordinates.length >= 3) {
          handleFinishDrawingGeofence();
        }

        return;
      }

      if (editingGeofenceId !== null) {
        handleSaveEditingGeofence();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    drawingGeofenceCoordinates.length,
    editingGeofenceId,
    geofences,
    handleCancelEditingGeofence,
    handleFinishDrawingGeofence,
    isDrawingGeofence,
  ]);

  return (
    <main
      data-atlascope-theme={theme}
      className={atlasUi.layout.shell}
    >
      <MapView
        incidents={incidents}
        geofences={geofences}
        focusedGeofenceId={focusedGeofenceRequest?.geofenceId ?? null}
        focusedGeofenceNonce={focusedGeofenceRequest?.nonce ?? 0}
        drawingCoordinates={drawingGeofenceCoordinates}
        isDrawingGeofence={isDrawingGeofence}
        editingGeofenceId={editingGeofenceId}
        isInteractionLocked={isTimelineInteracting}
        activeLayers={activeLayers}
        selectedIncidentId={selectedIncident?.id ?? null}
        selectedTimeMs={selectedTimeMs}
        onSelectIncident={handleSelectIncident}
        onMapClick={handleAddGeofencePoint}
        onDrawingCoordinateUpdate={handleUpdateDrawingGeofencePoint}
        onDrawingCoordinateRemove={handleRemoveDrawingGeofencePoint}
        onEditingCoordinateAdd={handleAddEditingGeofencePoint}
        onEditingCoordinateUpdate={handleUpdateEditingGeofencePoint}
        onEditingCoordinateRemove={handleRemoveEditingGeofencePoint}
        theme={theme}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="fixed right-6 top-6 z-30 flex items-start justify-end">
          <div
            ref={overlayControlsRef}
            className="pointer-events-auto flex items-start gap-3"
          >
            <div className="relative min-h-[192px] w-[320px]">
              <BasePanel
                isOpen={isPanelOpen("search")}
                ariaLabel="Search panel"
                variant="compact"
                widthClassName="w-[272px]"
              >
                <PanelHeader eyebrow="Search" />

                <div className={cx("mt-5 flex w-full items-center gap-3 px-4 py-3", atlasUi.surfaces.card)}>
                  <div className="flex size-5 items-center justify-center text-atlas-muted">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search region or hazard"
                    className="w-full bg-transparent text-sm text-atlas-ink outline-none placeholder:text-atlas-soft"
                  />
                </div>
              </BasePanel>

              <BasePanel isOpen={isPanelOpen("user")} ariaLabel="User panel">
                <Section title="User">
                  <ControlRow
                    label="Steven Encarnacion"
                    detail="Premium account"
                    control={<span className={atlasUi.chips.avatar}>SE</span>}
                  />
                </Section>

                <Section title="Utilities" className="mt-5">
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" className={atlasUi.buttons.utility}>
                      <span className={atlasUi.chips.icon}>
                        <ToolIcon />
                      </span>
                      <span className={atlasUi.text.controlLabel}>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                      className={atlasUi.buttons.utilityStart}
                    >
                      <span className={atlasUi.chips.icon}>
                        {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                      </span>
                      <span className={atlasUi.text.controlLabel}>{theme}</span>
                    </button>
                  </div>
                </Section>
              </BasePanel>

              <BasePanel isOpen={isPanelOpen("layers")} ariaLabel="Layers panel">
                <PanelHeader eyebrow="Hazard Layers" />

                <div className="mt-5 space-y-2">
                  {layerRows.map((layer) => (
                    <LayerRow
                      key={layer.id}
                      label={layer.label}
                      color={layer.color}
                      active={activeLayers[layer.id]}
                      onClick={() => handleToggleLayer(layer.id)}
                    />
                  ))}
                </div>
              </BasePanel>

              <GeofencePanel
                isOpen={isPanelOpen("geofences")}
                geofences={geofences}
                selectedGeofenceId={selectedGeofenceId}
                isDrawingGeofence={isDrawingGeofence}
                drawingPointCount={drawingGeofenceCoordinates.length}
                editingGeofenceId={editingGeofenceId}
                renamingGeofenceId={renamingGeofenceId}
                draftName={geofenceDraftName}
                enteringGeofenceId={enteringGeofenceId}
                showRowActions={showGeofenceRowActions}
                onAddGeofence={handleAddGeofence}
                onCancelDrawing={handleCancelDrawingGeofence}
                onFinishDrawing={handleFinishDrawingGeofence}
                onDraftNameChange={setGeofenceDraftName}
                onFocusGeofence={handleFocusGeofence}
                onStartEditing={handleStartEditingGeofence}
                onStartRenaming={handleStartRenamingGeofence}
                onSaveEditing={handleSaveEditingGeofence}
                onCancelEditing={handleCancelEditingGeofence}
                onToggleRowActions={() =>
                  setShowGeofenceRowActions((current) => {
                    const next = !current;

                    if (!next) {
                      setEditingGeofenceId(null);
                      setRenamingGeofenceId(null);
                      setEditingGeofenceSnapshot(null);
                    }

                    return next;
                  })
                }
                onToggleVisibility={handleToggleGeofenceVisibility}
                onRenameGeofence={handleRenameGeofence}
                onDeleteGeofence={handleDeleteGeofence}
              />
            </div>

            <div className="flex flex-col items-end gap-3">
              <OverlayRailButton
                isPressed={isPanelOpen("search")}
                onClick={() => togglePanel("search")}
                ariaLabel="Open search panel"
              >
                <SearchIcon />
              </OverlayRailButton>

              <OverlayRailButton
                isPressed={isPanelOpen("user")}
                onClick={() => togglePanel("user")}
                ariaLabel="Open user panel"
              >
                <UserIcon />
              </OverlayRailButton>

              <OverlayRailButton
                isPressed={isPanelOpen("layers")}
                onClick={() => togglePanel("layers")}
                ariaLabel="Open hazard layers"
              >
                <LayersIcon />
              </OverlayRailButton>

              <OverlayRailButton
                isPressed={isPanelOpen("geofences")}
                onClick={() => togglePanel("geofences")}
                ariaLabel="Open geofence panel"
              >
                <GeofenceIcon />
              </OverlayRailButton>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 top-[420px] flex items-start justify-end">
          <IncidentPanel
            incident={visibleSelectedIncident}
            isLoading={isPanelLoading}
            onClose={handleClosePanel}
          />
        </div>

        <div
          className={`absolute bottom-6 left-6 right-6 z-30 flex justify-center atlas-transition-panel ${
            shouldOffsetTimeline ? atlasUi.layout.timelineOffset : ""
          }`}
        >
          <TimelineControlBar
            currentTimeMs={selectedTimeMs}
            minTimeMs={timelineBounds.startMs}
            maxTimeMs={timelineBounds.endMs}
            isPlaying={isTimelinePlaying}
            activeIncidentCount={activeIncidents.length}
            trackedIncidentCount={trackedIncidents.length}
            currentDateLabel={formatTimelineDate(selectedTimeMs)}
            onPlayPause={handleTimelinePlayPause}
            onTimeChange={handleTimelineTimeChange}
            onInteractionChange={setIsTimelineInteracting}
          />
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <p className={cx("px-1", atlasUi.text.eyebrow)}>{title}</p>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function ControlRow({
  label,
  detail,
  control,
  onClick,
}: {
  label: string;
  detail: string;
  control: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex min-h-[88px] w-full items-center justify-between gap-4 px-4 py-3 text-left",
        atlasUi.surfaces.interactiveCard,
        atlasUi.surfaces.interactiveCardHover,
      )}
    >
      <div className="min-w-0">
        <p className={atlasUi.text.label}>{label}</p>
        <p className={cx("mt-1", atlasUi.text.meta)}>{detail}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </button>
  );
}

function LayerRow({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "grid w-full grid-cols-[minmax(0,1fr)_76px] items-center gap-4 px-4 py-2.5 text-left outline-none active:scale-[0.995]",
        atlasUi.surfaces.interactiveCard,
        atlasUi.surfaces.interactiveCardHover,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="size-3 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: active ? `0 0 14px ${color}55` : "none",
            opacity: active ? 1 : 0.35,
          }}
        />
        <span className={atlasUi.text.label}>{label}</span>
      </div>
      <div className="flex h-full min-h-[52px] w-[76px] items-center justify-center">
        <span
          className="relative inline-flex h-7 w-12 items-center rounded-full border px-0.5 atlas-transition-quick"
          style={{
            borderColor: active
              ? `${color}88`
              : "var(--atlas-color-card-border)",
            backgroundColor: active
              ? `${color}24`
              : "var(--atlas-color-timeline-play)",
          }}
        >
          <span
            className="absolute left-0.5 top-0.5 size-5 rounded-full transform-gpu atlas-transition-quick"
            style={{
              transform: `translateX(${active ? "20px" : "0px"})`,
              backgroundColor: active ? color : "var(--atlas-color-muted)",
              boxShadow: active ? `0 0 12px ${color}44` : "none",
            }}
          />
        </span>
      </div>
    </button>
  );
}

function OverlayRailButton({
  isPressed,
  onClick,
  ariaLabel,
  children,
}: {
  isPressed: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex size-12 items-center justify-center outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
        atlasUi.surfaces.rail,
        isPressed &&
          "border-atlas-rail-active-border bg-atlas-rail-active text-atlas-ink shadow-atlas-rail-active",
      )}
      aria-label={ariaLabel}
      aria-pressed={isPressed}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current">
      <path
        d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
        strokeWidth="1.9"
      />
      <path
        d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current">
      <path
        d="m12 5 7 3.5-7 3.5-7-3.5L12 5Zm7 7-7 3.5L5 12m14 4-7 3.5L5 16"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GeofenceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current">
      <path
        d="M12 20.25c-.53 0-1-.24-1.31-.68l-3.74-5.4A7.4 7.4 0 0 1 5.7 10.05C5.7 6.14 8.52 3.3 12 3.3s6.3 2.84 6.3 6.75c0 1.53-.45 2.95-1.25 4.12l-3.74 5.4c-.31.44-.78.68-1.31.68Z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.2" r="2.7" strokeWidth="1.8" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <path
        d="M14.5 6.5a4 4 0 0 0-5.4 4.9L4 16.5V20h3.6l5.1-5.1a4 4 0 0 0 4.9-5.4l-2.7 2.7-2.1-.4-.4-2.1 2.7-2.7Z"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.5A9 9 0 0 1 14.5 3.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
      <path
        d="M12 2.75v2.5m0 13.5v2.5m9.25-9.25h-2.5M5.25 12h-2.5m15.29-6.29-1.77 1.77M7.48 16.52l-1.77 1.77m12.06 0-1.77-1.77M7.48 7.48 5.71 5.71"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
