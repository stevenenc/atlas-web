"use client";

import type { ReactNode } from "react";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";
import { TimelineControlBar } from "@/features/atlascope/components/timeline-control-bar";
import { mockGeofences } from "@/features/atlascope/data/mock-geofences";
import { incidents } from "@/features/atlascope/data/mock-incidents";
import {
  clampTimelineTime,
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

const layerRows: Array<{
  id: IncidentType;
  label: string;
  color: string;
}> = [
  { id: "earthquake", label: "Earthquake", color: "#F97316" },
  { id: "wildfire", label: "Wildfire", color: "#EF4444" },
  { id: "air_quality", label: "Air Quality", color: "#D8B11E" },
];

type OverlayPanelId = "system" | "layers" | "geofences" | null;
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
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [selectedTimeMs, setSelectedTimeMs] = useState(timelineBounds.startMs);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState(false);
  const [activeOverlayPanel, setActiveOverlayPanel] = useState<OverlayPanelId>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const geofenceEnterTimerRef = useRef<number | null>(null);
  const playbackFrameRef = useRef<number | null>(null);
  const playbackStartRef = useRef<number | null>(null);
  const playbackOriginTimeRef = useRef(timelineBounds.startMs);
  const selectedTimeRef = useRef(timelineBounds.startMs);
  const overlayControlsRef = useRef<HTMLDivElement | null>(null);
  const activeIncidents = useMemo(
    () => incidents.filter((incident) => isIncidentActiveAtTime(incident, selectedTimeMs)),
    [selectedTimeMs],
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

  function handleToggleOverlayPanel(panel: Exclude<OverlayPanelId, null>) {
    if (panel !== "geofences" && (isDrawingGeofence || editingGeofenceId !== null)) {
      return;
    }

    if (
      panel === "geofences" &&
      activeOverlayPanel === "geofences" &&
      (isDrawingGeofence || editingGeofenceId !== null)
    ) {
      return;
    }

    setShowGeofenceRowActions(
      panel === "geofences" && activeOverlayPanel === "geofences" ? (current) => current : false,
    );
    if (panel !== "geofences") {
      setEditingGeofenceId(null);
      setRenamingGeofenceId(null);
      setEditingGeofenceSnapshot(null);
    }
    setActiveOverlayPanel((current) => (current === panel ? null : panel));
  }

  useEffect(() => {
    if (!activeOverlayPanel) {
      return;
    }

    const activeOverlayElement = overlayControlsRef.current;

    if (!activeOverlayElement) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!activeOverlayElement.contains(target)) {
        if (isDrawingGeofence || editingGeofenceId !== null) {
          return;
        }

        setShowGeofenceRowActions(false);
        setActiveOverlayPanel(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activeOverlayPanel, editingGeofenceId, isDrawingGeofence]);

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
    setActiveOverlayPanel("geofences");
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

  function handleFinishDrawingGeofence() {
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

    if (geofenceEnterTimerRef.current) {
      window.clearTimeout(geofenceEnterTimerRef.current);
    }

    geofenceEnterTimerRef.current = window.setTimeout(() => {
      setEnteringGeofenceId((current) => (current === id ? null : current));
      geofenceEnterTimerRef.current = null;
    }, 220);
  }

  function handleRenameGeofence(id: number, name: string) {
    setGeofences((current) =>
      current.map((geofence) => (geofence.id === id ? { ...geofence, name } : geofence)),
    );
  }

  function handleToggleGeofenceEnabled(id: number) {
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
    setActiveOverlayPanel("geofences");
  }

  function handleStartRenamingGeofence(geofence: Geofence) {
    setEditingGeofenceId(geofence.id);
    setEditingGeofenceSnapshot(geofence.coordinates.map((point) => ({ ...point })));
    setRenamingGeofenceId(geofence.id);
    setGeofenceDraftName(geofence.name);
    setActiveOverlayPanel("geofences");
  }

  function handleSaveEditingGeofence() {
    setEditingGeofenceSnapshot(null);
    setEditingGeofenceId(null);
    setRenamingGeofenceId(null);
  }

  function handleDeleteGeofence(id: number) {
    setGeofences((current) => current.filter((geofence) => geofence.id !== id));
    setEditingGeofenceId((current) => (current === id ? null : current));
    setRenamingGeofenceId((current) => (current === id ? null : current));
    setEditingGeofenceSnapshot((current) => (editingGeofenceId === id ? null : current));
    setEnteringGeofenceId((current) => (current === id ? null : current));
  }

  return (
    <main
      className={themeClasses(theme, {
        dark:
          "relative min-h-screen overflow-hidden bg-[#12171A] text-white transition-colors duration-500 ease-out",
        light:
          "relative min-h-screen overflow-hidden bg-[#D9DEE0] text-[#1F2A30] transition-colors duration-500 ease-out",
      })}
    >
      <MapView
        incidents={incidents}
        geofences={geofences}
        drawingCoordinates={drawingGeofenceCoordinates}
        isDrawingGeofence={isDrawingGeofence}
        editingGeofenceId={editingGeofenceId}
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
            <div className="relative min-h-[72px] w-[320px]">
              <div
                className={`absolute right-0 top-0 origin-top-right transition-[opacity,transform] ease-out ${
                  activeOverlayPanel === "system"
                    ? "scale-100 opacity-100 duration-250"
                    : "pointer-events-none scale-[0.985] opacity-0 duration-120"
                }`}
              >
                <aside
                  className={themeClasses(theme, {
                    dark:
                      "w-[320px] rounded-3xl border border-white/10 bg-[rgba(11,16,19,0.84)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-md",
                    light:
                      "w-[320px] rounded-3xl border border-[#3D464C]/12 bg-[rgba(243,245,246,0.9)] p-4 shadow-[0_18px_40px_rgba(68,79,88,0.14)] backdrop-blur-md",
                  })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={themeClasses(theme, {
                          dark: "text-[30px] font-semibold tracking-[-0.02em] text-white/88",
                          light: "text-[30px] font-semibold tracking-[-0.02em] text-[#36424A]",
                        })}
                      >
                        AtlaScope
                      </p>
                    </div>
                  </div>

                  <Section title="System" theme={theme} className="mt-4">
                    <SearchRow theme={theme} />

                    <ControlRow
                      theme={theme}
                      label="Steven Encarnacion"
                      detail="Premium account"
                      control={
                        <span
                          className={themeClasses(theme, {
                            dark:
                              "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2F3C47] to-[#121A20] text-sm font-semibold text-white",
                            light:
                              "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#36454F] to-[#11181D] text-sm font-semibold text-white",
                          })}
                        >
                          SE
                        </span>
                      }
                    />
                  </Section>

                  <Section title="Utilities" theme={theme} className="mt-5">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={themeClasses(theme, {
                          dark:
                            "flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-white/78 transition-colors duration-300 hover:bg-white/[0.08] hover:text-white",
                          light:
                            "flex items-center justify-center gap-2 rounded-2xl border border-[#3D464C]/10 bg-white/70 px-3 py-3 text-[#536068] transition-colors duration-300 hover:bg-white hover:text-[#1F2A30]",
                        })}
                      >
                        <span
                          className={themeClasses(theme, {
                            dark:
                              "flex size-8 items-center justify-center rounded-xl bg-[#E7ECF0] text-[#152026]",
                            light:
                              "flex size-8 items-center justify-center rounded-xl bg-[#1D2830] text-[#F2F5F7]",
                          })}
                        >
                          <ToolIcon />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                          Settings
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                        className={themeClasses(theme, {
                          dark:
                            "flex items-center justify-start gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-white/78 transition-colors duration-300 hover:bg-white/[0.08] hover:text-white",
                          light:
                            "flex items-center justify-start gap-2 rounded-2xl border border-[#3D464C]/10 bg-white/70 px-5 py-3 text-[#536068] transition-colors duration-300 hover:bg-white hover:text-[#1F2A30]",
                        })}
                      >
                        <span
                          className={themeClasses(theme, {
                            dark:
                              "flex size-8 items-center justify-center rounded-xl bg-[#E7ECF0] text-[#152026]",
                            light:
                              "flex size-8 items-center justify-center rounded-xl bg-[#1D2830] text-[#F2F5F7]",
                          })}
                        >
                          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                          {theme}
                        </span>
                      </button>
                    </div>
                  </Section>
                </aside>
              </div>

              <div
                className={`absolute right-0 top-0 origin-top-right transition-[opacity,transform] ease-out ${
                  activeOverlayPanel === "layers"
                    ? "scale-100 opacity-100 duration-250"
                    : "pointer-events-none scale-[0.985] opacity-0 duration-120"
                }`}
              >
                <aside
                  className={themeClasses(theme, {
                    dark:
                      "w-[320px] rounded-3xl border border-white/10 bg-[rgba(11,16,19,0.84)] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-md",
                    light:
                      "w-[320px] rounded-3xl border border-[#3D464C]/12 bg-[rgba(243,245,246,0.9)] p-4 shadow-[0_18px_40px_rgba(68,79,88,0.14)] backdrop-blur-md",
                  })}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={themeClasses(theme, {
                          dark: "text-[10px] font-semibold tracking-[0.24em] text-white/30 uppercase",
                          light: "text-[10px] font-semibold tracking-[0.24em] text-[#607078] uppercase",
                        })}
                      >
                        Hazard Layers
                      </p>
                      <p
                        className={themeClasses(theme, {
                          dark: "mt-2 text-lg font-semibold text-white/86",
                          light: "mt-2 text-lg font-semibold text-[#1F2A30]",
                        })}
                      >
                        Visibility Controls
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {layerRows.map((layer) => (
                      <LayerRow
                        key={layer.id}
                        theme={theme}
                        label={layer.label}
                        color={layer.color}
                        active={activeLayers[layer.id]}
                        onClick={() => handleToggleLayer(layer.id)}
                      />
                    ))}
                  </div>
                </aside>
              </div>

              <div
                className={`absolute right-0 top-0 origin-top-right transition-[opacity,transform] ease-out ${
                  activeOverlayPanel === "geofences"
                    ? "scale-100 opacity-100 duration-250"
                    : "pointer-events-none scale-[0.985] opacity-0 duration-120"
                }`}
              >
                <GeofencePanel
                  theme={theme}
                  geofences={geofences}
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
                  onToggleEnabled={handleToggleGeofenceEnabled}
                  onRenameGeofence={handleRenameGeofence}
                  onDeleteGeofence={handleDeleteGeofence}
                />
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <OverlayRailButton
                theme={theme}
                isPressed={activeOverlayPanel === "system"}
                onClick={() => handleToggleOverlayPanel("system")}
                ariaLabel="Open control panel"
              >
                <MenuIcon />
              </OverlayRailButton>

              <OverlayRailButton
                theme={theme}
                isPressed={activeOverlayPanel === "layers"}
                onClick={() => handleToggleOverlayPanel("layers")}
                ariaLabel="Open hazard layers"
              >
                <LayersIcon />
              </OverlayRailButton>

              <GeofenceButton
                theme={theme}
                isPressed={activeOverlayPanel === "geofences"}
                onClick={() => handleToggleOverlayPanel("geofences")}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 top-[420px] flex items-start justify-end">
          <IncidentPanel
            incident={visibleSelectedIncident}
            isLoading={isPanelLoading}
            onClose={handleClosePanel}
            theme={theme}
          />
        </div>

        <div
          className={`absolute bottom-6 left-6 right-6 z-30 flex justify-center transition-[padding] duration-300 ease-out ${
            shouldOffsetTimeline ? "lg:pr-[25rem]" : ""
          }`}
        >
          <TimelineControlBar
            currentTimeMs={selectedTimeMs}
            minTimeMs={timelineBounds.startMs}
            maxTimeMs={timelineBounds.endMs}
            isPlaying={isTimelinePlaying}
            activeIncidentCount={activeIncidents.length}
            onPlayPause={handleTimelinePlayPause}
            onTimeChange={handleTimelineTimeChange}
            theme={theme}
          />
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  theme,
  className,
  children,
}: {
  title: string;
  theme: ThemeMode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <p
        className={themeClasses(theme, {
          dark: "px-1 text-[10px] font-semibold tracking-[0.24em] text-white/30 uppercase",
          light: "px-1 text-[10px] font-semibold tracking-[0.24em] text-[#607078] uppercase",
        })}
      >
        {title}
      </p>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function SearchRow({ theme }: { theme: ThemeMode }) {
  return (
    <div
      className={themeClasses(theme, {
        dark:
          "flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3",
        light:
          "flex w-full items-center gap-3 rounded-2xl border border-[#3D464C]/10 bg-white/44 px-4 py-3",
      })}
    >
      <div
        className={themeClasses(theme, {
          dark: "flex size-5 items-center justify-center text-white/56",
          light: "flex size-5 items-center justify-center text-[#607078]",
        })}
      >
        <SearchIcon />
      </div>
      <div className="min-w-0 flex-1">
        <input
          type="text"
          placeholder="Search region or hazard"
          className={themeClasses(theme, {
            dark:
              "w-full bg-transparent text-sm text-white/78 outline-none placeholder:text-white/42",
            light:
              "w-full bg-transparent text-sm text-[#536068] outline-none placeholder:text-[#7A8790]",
          })}
        />
      </div>
    </div>
  );
}

function ControlRow({
  theme,
  label,
  detail,
  control,
  onClick,
}: {
  theme: ThemeMode;
  label: string;
  detail: string;
  control: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={themeClasses(theme, {
        dark:
          "flex min-h-[88px] w-full items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition-colors duration-300 hover:bg-white/[0.05]",
        light:
          "flex min-h-[88px] w-full items-center justify-between gap-4 rounded-2xl border border-[#3D464C]/10 bg-white/44 px-4 py-3 text-left transition-colors duration-300 hover:bg-white/72",
      })}
    >
      <div className="min-w-0">
        <p
          className={themeClasses(theme, {
            dark: "text-sm font-semibold text-white/86",
            light: "text-sm font-semibold text-[#1F2A30]",
          })}
        >
          {label}
        </p>
        <p
          className={themeClasses(theme, {
            dark: "mt-1 text-xs leading-5 text-white/46",
            light: "mt-1 text-xs leading-5 text-[#607078]",
          })}
        >
          {detail}
        </p>
      </div>
      <div className="shrink-0">{control}</div>
    </button>
  );
}

function LayerRow({
  theme,
  label,
  color,
  active,
  onClick,
}: {
  theme: ThemeMode;
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={themeClasses(theme, {
        dark:
          "grid w-full grid-cols-[minmax(0,1fr)_76px] items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-left outline-none transition-[background-color,border-color,transform,box-shadow] duration-300 ease-out hover:bg-white/[0.05] active:scale-[0.995]",
        light:
          "grid w-full grid-cols-[minmax(0,1fr)_76px] items-center gap-4 rounded-2xl border border-[#3D464C]/10 bg-white/44 px-4 py-2.5 text-left outline-none transition-[background-color,border-color,transform,box-shadow] duration-300 ease-out hover:bg-white/72 active:scale-[0.995]",
      })}
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
        <span
          className={themeClasses(theme, {
            dark: "text-sm font-semibold text-white/86",
            light: "text-sm font-semibold text-[#1F2A30]",
          })}
        >
          {label}
        </span>
      </div>
      <div className="flex h-full min-h-[52px] w-[76px] items-center justify-center">
        <span
          className="relative inline-flex h-7 w-12 items-center rounded-full border px-0.5 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            borderColor: active
              ? `${color}88`
              : theme === "dark"
                ? "rgba(255,255,255,0.08)"
                : "rgba(61,70,76,0.16)",
            backgroundColor: active
              ? `${color}24`
              : theme === "dark"
                ? "rgba(255,255,255,0.04)"
                : "rgba(214,221,226,0.9)",
          }}
        >
          <span
            className="absolute left-0.5 top-0.5 size-5 rounded-full transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu"
            style={{
              transform: `translateX(${active ? "20px" : "0px"})`,
              backgroundColor: active ? color : theme === "dark" ? "#8F9AA1" : "#75818A",
              boxShadow: active ? `0 0 12px ${color}44` : "none",
            }}
          />
        </span>
      </div>
    </button>
  );
}

function OverlayRailButton({
  theme,
  isPressed,
  onClick,
  ariaLabel,
  children,
}: {
  theme: ThemeMode;
  isPressed: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${themeClasses(theme, {
        dark:
          "flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-[rgba(11,16,19,0.82)] text-white/78 shadow-[0_20px_50px_rgba(0,0,0,0.24)] backdrop-blur-md outline-none ring-0 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
        light:
          "flex size-12 items-center justify-center rounded-2xl border border-[#3D464C]/12 bg-[rgba(243,245,246,0.9)] text-[#536068] shadow-[0_18px_40px_rgba(68,79,88,0.14)] backdrop-blur-md outline-none ring-0 transition-colors duration-200 hover:bg-white hover:text-[#1F2A30] focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
      })} ${
        isPressed
          ? theme === "dark"
            ? "border-white/18 bg-white/[0.12] text-white shadow-[0_16px_36px_rgba(0,0,0,0.28)]"
            : "border-[#3D464C]/18 bg-white text-[#1F2A30] shadow-[0_14px_28px_rgba(68,79,88,0.18)]"
          : ""
      }`}
      aria-label={ariaLabel}
      aria-pressed={isPressed}
    >
      {children}
    </button>
  );
}

function GeofenceButton({
  theme,
  isPressed,
  onClick,
}: {
  theme: ThemeMode;
  isPressed: boolean;
  onClick: () => void;
}) {
  return (
    <OverlayRailButton
      theme={theme}
      isPressed={isPressed}
      onClick={onClick}
      ariaLabel="Open geofence panel"
    >
      <GeofenceIcon />
    </OverlayRailButton>
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current">
      <path d="M5 7h14M5 12h14M5 17h14" strokeWidth="2.2" strokeLinecap="round" />
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
        d="M7 3.5 18.2 12l-5 1.1 2.8 6-1.9.9-2.8-6L7 17.7V3.5Z"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
