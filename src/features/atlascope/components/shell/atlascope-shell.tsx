"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { MapView } from "@/features/atlascope/components/map/map-view";
import { usePanelManager } from "@/features/atlascope/components/overlay/panel/panel-system";
import { IncidentPanel } from "@/features/atlascope/components/panels/incident/incident-panel";
import { TimelineControlBar } from "@/features/atlascope/components/timeline/timeline-control-bar";
import { TimelineInfoBlock } from "@/features/atlascope/components/timeline/timeline-info-block";
import { atlasUi, type ThemeMode } from "@/features/atlascope/config/theme";
import { mockGeofences } from "@/features/atlascope/data/mock-geofences";
import { incidents } from "@/features/atlascope/data/mock-incidents";
import { useAtlascopeGeofences } from "@/features/atlascope/hooks/use-atlascope-geofences";
import { useAtlascopeTimeline } from "@/features/atlascope/hooks/use-atlascope-timeline";
import { formatTimelineLongDate } from "@/features/atlascope/lib/incident-timeline";
import type { IncidentType } from "@/features/atlascope/types/atlascope";

import {
  AtlascopeShellOverlays,
  type OverlayPanelId,
} from "./atlascope-shell-overlays";

const initialLayers: Record<IncidentType, boolean> = {
  earthquake: true,
  wildfire: true,
  air_quality: true,
};

export function AtlascopeShell() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [activeOverlayPanel, setActiveOverlayPanel] = useState<OverlayPanelId | null>(null);
  const overlayControlsRef = useRef<HTMLDivElement | null>(null);
  const openGeofencePanel = useCallback(() => {
    setActiveOverlayPanel("geofences");
  }, []);
  const {
    canFinishDrawingGeofence,
    drawingGeofenceCoordinates,
    editingGeofenceCoordinates,
    editingGeofenceId,
    enteringGeofenceId,
    focusedGeofenceRequest,
    geofenceDraftName,
    geofences,
    handleAddEditingGeofencePoint,
    handleAddEditingGeofencePointAt,
    handleAddGeofence,
    handleAddGeofencePoint,
    handleAddGeofencePointAt,
    handleCancelDrawingGeofence,
    handleCancelEditingGeofence,
    handleDeleteGeofence,
    handleFinishDrawingGeofence,
    handleFocusGeofence,
    handleGeofencePanelDismiss,
    handleRemoveDrawingGeofencePoint,
    handleRemoveEditingGeofencePoint,
    handleRenameGeofence,
    handleSaveEditingGeofence,
    handleStartEditingGeofence,
    handleStartRenamingGeofence,
    handleToggleGeofenceRowActions,
    handleToggleGeofenceVisibility,
    handleUpdateDrawingGeofencePoint,
    handleUpdateEditingGeofencePoint,
    isDrawingGeofence,
    isGeofencePanelPersistent,
    renamingGeofenceId,
    selectedGeofenceId,
    setGeofenceDraftName,
    showGeofenceRowActions,
  } = useAtlascopeGeofences({
    initialGeofences: mockGeofences,
    openGeofencePanel,
  });
  const {
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
  } = useAtlascopeTimeline({
    incidents,
    initialLayers,
  });
  const panelConfigs = useMemo(
    () => ({
      search: { dismissible: true },
      user: { dismissible: true },
      layers: { dismissible: true },
      geofences: { dismissible: !isGeofencePanelPersistent },
    }),
    [isGeofencePanelPersistent],
  );
  const handleActiveOverlayPanelChange = useCallback(
    (nextPanel: OverlayPanelId | null) => {
      if (nextPanel !== "geofences") {
        handleGeofencePanelDismiss();
      }

      setActiveOverlayPanel(nextPanel);
    },
    [handleGeofencePanelDismiss],
  );
  const { isPanelOpen, togglePanel } = usePanelManager<OverlayPanelId>({
    activePanel: activeOverlayPanel,
    onActivePanelChange: handleActiveOverlayPanelChange,
    panelConfigs,
    panelRootRef: overlayControlsRef,
  });

  return (
    <main data-atlascope-theme={theme} className={atlasUi.layout.shell}>
      <MapView
        incidents={incidents}
        geofences={geofences}
        focusedGeofenceId={focusedGeofenceRequest?.geofenceId ?? null}
        focusedGeofenceNonce={focusedGeofenceRequest?.nonce ?? 0}
        drawingCoordinates={drawingGeofenceCoordinates}
        isDrawingGeofence={isDrawingGeofence}
        editingCoordinates={editingGeofenceCoordinates}
        editingGeofenceId={editingGeofenceId}
        isInteractionLocked={isTimelineInteracting}
        activeLayers={activeLayers}
        selectedIncidentId={selectedIncidentId}
        selectedTimeMs={selectedTimeMs}
        onSelectIncident={handleSelectIncident}
        onMapClick={handleAddGeofencePoint}
        onDrawingComplete={handleFinishDrawingGeofence}
        onDrawingCoordinateAddAt={handleAddGeofencePointAt}
        onDrawingCoordinateUpdate={handleUpdateDrawingGeofencePoint}
        onDrawingCoordinateRemove={handleRemoveDrawingGeofencePoint}
        onEditingCoordinateAdd={handleAddEditingGeofencePoint}
        onEditingCoordinateAddAt={handleAddEditingGeofencePointAt}
        onEditingCoordinateUpdate={handleUpdateEditingGeofencePoint}
        onEditingCoordinateRemove={handleRemoveEditingGeofencePoint}
        theme={theme}
      />

      <div className="pointer-events-none absolute inset-0">
        <TimelineInfoBlock
          currentDateLabel={formatTimelineLongDate(selectedTimeMs)}
          trackedIncidentCount={trackedIncidents.length}
          activeIncidentCount={activeIncidents.length}
        />

        <AtlascopeShellOverlays
          activeLayers={activeLayers}
          geofencePanelProps={{
            geofences,
            selectedGeofenceId,
            isDrawingGeofence,
            drawingPointCount: drawingGeofenceCoordinates.length,
            canFinishDrawing: canFinishDrawingGeofence,
            editingGeofenceId,
            renamingGeofenceId,
            draftName: geofenceDraftName,
            enteringGeofenceId,
            showRowActions: showGeofenceRowActions,
            onAddGeofence: handleAddGeofence,
            onCancelDrawing: handleCancelDrawingGeofence,
            onFinishDrawing: handleFinishDrawingGeofence,
            onDraftNameChange: setGeofenceDraftName,
            onFocusGeofence: handleFocusGeofence,
            onStartEditing: handleStartEditingGeofence,
            onStartRenaming: handleStartRenamingGeofence,
            onSaveEditing: handleSaveEditingGeofence,
            onCancelEditing: handleCancelEditingGeofence,
            onToggleRowActions: handleToggleGeofenceRowActions,
            onToggleVisibility: handleToggleGeofenceVisibility,
            onRenameGeofence: handleRenameGeofence,
            onDeleteGeofence: handleDeleteGeofence,
          }}
          isPanelOpen={isPanelOpen}
          onToggleLayer={handleToggleLayer}
          onToggleTheme={() =>
            setTheme((current) => (current === "dark" ? "light" : "dark"))
          }
          panelRootRef={overlayControlsRef}
          theme={theme}
          togglePanel={togglePanel}
        />

        <div className="absolute bottom-6 right-6 top-[420px] flex items-start justify-end">
          <IncidentPanel
            incident={visibleSelectedIncident}
            isLoading={isPanelLoading}
            onClose={handleClosePanel}
          />
        </div>

        <div
          className={`absolute bottom-6 left-4 right-4 z-30 flex justify-center atlas-transition-panel sm:left-6 sm:right-6 ${
            shouldOffsetTimeline ? atlasUi.layout.timelineOffset : ""
          }`}
        >
          <TimelineControlBar
            currentTimeMs={selectedTimeMs}
            minTimeMs={timelineBounds.startMs}
            maxTimeMs={timelineBounds.endMs}
            isPlaying={isTimelinePlaying}
            onPlayPause={handleTimelinePlayPause}
            onTimeChange={handleTimelineTimeChange}
            onInteractionChange={setIsTimelineInteracting}
          />
        </div>
      </div>
    </main>
  );
}
