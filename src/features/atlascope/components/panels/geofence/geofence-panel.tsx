import { useEffect, useRef, useState } from "react";

import { BasePanel, PanelHeader } from "@/features/atlascope/components/overlay/panel/panel-system";
import { cx } from "@/features/atlascope/config/theme";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

import { GeofenceDrawingCallout } from "./geofence-drawing-callout";
import { GeofenceEmptyState } from "./geofence-empty-state";
import { GeofenceItem } from "./geofence-item";

export type Geofence = AtlascopeGeofence;

type GeofencePanelProps = {
  isOpen: boolean;
  geofences: Geofence[];
  selectedGeofenceId: number | null;
  isDrawingGeofence: boolean;
  drawingPointCount: number;
  canFinishDrawing: boolean;
  editingGeofenceId: number | null;
  renamingGeofenceId: number | null;
  draftName: string;
  enteringGeofenceId: number | null;
  showRowActions: boolean;
  onAddGeofence: () => void;
  onCancelDrawing: () => void;
  onFinishDrawing: () => void;
  onDraftNameChange: (value: string) => void;
  onFocusGeofence: (geofence: Geofence) => void;
  onStartEditing: (geofence: Geofence) => void;
  onStartRenaming: (geofence: Geofence) => void;
  onSaveEditing: (geofence: Geofence) => void;
  onCancelEditing: (geofence: Geofence) => void;
  onToggleRowActions: () => void;
  onToggleVisibility: (id: number) => void;
  onRenameGeofence: (id: number, name: string) => void;
  onDeleteGeofence: (id: number) => void;
};

export function GeofencePanel({
  isOpen,
  geofences,
  selectedGeofenceId,
  isDrawingGeofence,
  drawingPointCount,
  canFinishDrawing,
  editingGeofenceId,
  renamingGeofenceId,
  draftName,
  enteringGeofenceId,
  showRowActions,
  onAddGeofence,
  onCancelDrawing,
  onFinishDrawing,
  onDraftNameChange,
  onFocusGeofence,
  onStartEditing,
  onStartRenaming,
  onSaveEditing,
  onCancelEditing,
  onToggleRowActions,
  onToggleVisibility,
  onRenameGeofence,
  onDeleteGeofence,
}: GeofencePanelProps) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
  const [exitingId, setExitingId] = useState<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const pendingDeleteIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) {
        window.clearTimeout(deleteTimerRef.current);
      }
    };
  }, []);

  function handleStartEditing(geofence: Geofence) {
    if (exitingId === geofence.id) {
      return;
    }

    setConfirmingDeleteId((current) => (current === geofence.id ? null : current));
    onStartEditing(geofence);
  }

  function handleCancelEditing(geofence: Geofence) {
    onCancelEditing(geofence);
  }

  function handleSaveEditing(geofence: Geofence) {
    const nextName = draftName.trim();

    if (!nextName) {
      onCancelEditing(geofence);
      return;
    }

    onRenameGeofence(geofence.id, nextName);
    onSaveEditing(geofence);
  }

  function handleDeleteGeofence(id: number) {
    if (pendingDeleteIdRef.current === id) {
      return;
    }

    pendingDeleteIdRef.current = id;
    setConfirmingDeleteId(null);
    setExitingId(id);

    if (deleteTimerRef.current) {
      window.clearTimeout(deleteTimerRef.current);
    }

    deleteTimerRef.current = window.setTimeout(() => {
      onDeleteGeofence(id);
      setExitingId((current) => (current === id ? null : current));
      pendingDeleteIdRef.current = null;
      deleteTimerRef.current = null;
    }, 180);
  }

  const activeActionGeofenceId =
    confirmingDeleteId ?? renamingGeofenceId ?? editingGeofenceId;

  return (
    <BasePanel isOpen={isOpen} ariaLabel="Geofence panel">
      <PanelHeader
        eyebrow="GeoFences"
        className="items-center"
        actions={
          geofences.length ? (
            <button
              type="button"
              onClick={onToggleRowActions}
              aria-label={showRowActions ? "Hide geofence actions" : "Show geofence actions"}
              className={cx(
                "px-0 py-0 text-[10px] font-semibold tracking-[0.24em] uppercase atlas-transition-surface",
                showRowActions ? "text-atlas-primary" : "text-atlas-eyebrow hover:text-atlas-ink",
              )}
            >
              Edit
            </button>
          ) : null
        }
      />

      {geofences.length ? (
        <>
          <div className="mt-4 space-y-2">
            {geofences.map((geofence) => (
              <GeofenceItem
                key={geofence.id}
                geofence={geofence}
                isEditing={renamingGeofenceId === geofence.id}
                isSelected={selectedGeofenceId === geofence.id}
                isSelectedForEditing={editingGeofenceId === geofence.id}
                draftName={draftName}
                isConfirmingDelete={confirmingDeleteId === geofence.id}
                isEntering={enteringGeofenceId === geofence.id}
                isExiting={exitingId === geofence.id}
                showActions={
                  showRowActions &&
                  (activeActionGeofenceId === null || activeActionGeofenceId === geofence.id)
                }
                onDraftNameChange={onDraftNameChange}
                onFocusGeofence={() => onFocusGeofence(geofence)}
                onToggleVisibility={() => onToggleVisibility(geofence.id)}
                onStartEditing={() => handleStartEditing(geofence)}
                onStartRenaming={() => onStartRenaming(geofence)}
                onSaveEditing={() => handleSaveEditing(geofence)}
                onCancelEditing={() => handleCancelEditing(geofence)}
                onToggleDeleteConfirm={() =>
                  setConfirmingDeleteId((current) =>
                    current === geofence.id ? null : geofence.id,
                  )
                }
                onConfirmDelete={() => handleDeleteGeofence(geofence.id)}
                onCancelDelete={() =>
                  setConfirmingDeleteId((current) =>
                    current === geofence.id ? null : current,
                  )
                }
              />
            ))}
          </div>

          {isDrawingGeofence ? (
            <GeofenceDrawingCallout
              drawingPointCount={drawingPointCount}
              canFinishDrawing={canFinishDrawing}
              onCancelDrawing={onCancelDrawing}
              onFinishDrawing={onFinishDrawing}
            />
          ) : (
            <button
              type="button"
              onClick={onAddGeofence}
              className="atlas-primary-callout-add mt-3 flex min-h-[64px] w-full items-center justify-center gap-2 rounded-atlas-card border px-4 py-3 text-sm font-semibold text-atlas-ink atlas-transition-quick hover:text-atlas-ink"
            >
              <span className="text-base leading-none text-atlas-muted">+</span>
              <span>Add Geofence</span>
            </button>
          )}
        </>
      ) : (
        <GeofenceEmptyState
          isDrawingGeofence={isDrawingGeofence}
          onAddGeofence={onAddGeofence}
        />
      )}
    </BasePanel>
  );
}
