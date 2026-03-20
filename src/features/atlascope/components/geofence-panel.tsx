import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { BasePanel, PanelHeader } from "@/features/atlascope/components/panel-system";
import { atlasUi, cx } from "@/features/atlascope/config/theme";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

export type Geofence = AtlascopeGeofence;

type GeofencePanelProps = {
  isOpen: boolean;
  geofences: Geofence[];
  selectedGeofenceId: number | null;
  isDrawingGeofence: boolean;
  drawingPointCount: number;
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
            <div
              className="atlas-primary-callout mt-3 flex min-h-[64px] w-full items-center justify-between rounded-atlas-card border px-4 py-3 text-sm text-atlas-ink"
            >
              <div className="min-w-0 text-left">
                <p className={atlasUi.text.primaryDetail}>Geofence Drawing</p>
                <p className="mt-1 text-xs font-semibold text-atlas-muted">
                  {drawingPointCount} point{drawingPointCount === 1 ? "" : "s"} placed
                </p>
              </div>
              <div className="ml-3 flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={onCancelDrawing}
                  aria-label="Cancel geofence drawing"
                  className="flex size-7 items-center justify-center text-atlas-muted atlas-transition-surface hover:text-atlas-ink"
                >
                  <CloseIcon />
                </button>
                <button
                  type="button"
                  onClick={onFinishDrawing}
                  disabled={drawingPointCount < 3}
                  aria-label="Finish geofence drawing"
                  className="flex size-7 items-center justify-center text-atlas-ink atlas-transition-surface hover:text-atlas-ink disabled:cursor-not-allowed disabled:text-atlas-disabled"
                >
                  <CheckIcon />
                </button>
              </div>
            </div>
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
        <div
          className={cx("mt-4 px-4 py-7 text-center", atlasUi.surfaces.card, "border-dashed")}
        >
          <p className={atlasUi.text.label}>No geofences yet</p>
          <button
            type="button"
            onClick={onAddGeofence}
            className={cx("mt-4", atlasUi.buttons.pagePrimary)}
          >
            <span className="text-base leading-none">+</span>
            <span>{isDrawingGeofence ? "Drawing Geofence" : "Create Geofence"}</span>
          </button>
        </div>
      )}
    </BasePanel>
  );
}

function GeofenceItem({
  geofence,
  isEditing,
  isSelected,
  isSelectedForEditing,
  draftName,
  isConfirmingDelete,
  isEntering,
  isExiting,
  showActions,
  onDraftNameChange,
  onFocusGeofence,
  onToggleVisibility,
  onStartEditing,
  onStartRenaming,
  onSaveEditing,
  onCancelEditing,
  onToggleDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: {
  geofence: Geofence;
  isEditing: boolean;
  isSelected: boolean;
  isSelectedForEditing: boolean;
  draftName: string;
  isConfirmingDelete: boolean;
  isEntering: boolean;
  isExiting: boolean;
  showActions: boolean;
  onDraftNameChange: (value: string) => void;
  onFocusGeofence: () => void;
  onToggleVisibility: () => void;
  onStartEditing: () => void;
  onStartRenaming: () => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onToggleDeleteConfirm: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iconButtonClass = "flex size-7 items-center justify-center atlas-transition-surface";
  const primaryIconClass = "text-atlas-primary hover:text-atlas-primary";
  const mutedIconClass = "text-atlas-muted hover:text-atlas-ink";
  const strongIconClass = "text-atlas-ink hover:text-atlas-ink";

  function handleItemClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (target instanceof Element && target.closest("button, input")) {
      return;
    }

    onFocusGeofence();
  }

  function handleActionClick(
    event: MouseEvent<HTMLButtonElement | HTMLInputElement>,
    action: () => void,
  ) {
    event.stopPropagation();
    action();
  }

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  useEffect(() => {
    if (!isConfirmingDelete) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirmDelete();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onCancelDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfirmingDelete, onCancelDelete, onConfirmDelete]);

  const isSaveCancelMode = isEditing || isConfirmingDelete || isSelectedForEditing;

  return (
    <div
      data-geofence-item-id={geofence.id}
      onClick={handleItemClick}
      className={`${cx(
        "cursor-pointer overflow-hidden rounded-atlas-card border px-4 py-3 atlas-transition-quick",
        isSelected || isSelectedForEditing
          ? "border-atlas-primary bg-atlas-primary-soft"
          : "border-atlas-card-border bg-atlas-card",
      )} ${
        isEntering ? "atlascope-panel-item-enter" : ""
      } ${isExiting ? "atlascope-panel-item-exit pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              value={draftName}
              onClick={(event) => {
                event.stopPropagation();
              }}
              onChange={(event) => {
                onDraftNameChange(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSaveEditing();
                }

                if (event.key === "Escape") {
                  event.preventDefault();
                  onCancelEditing();
                }
              }}
              className={cx(
                "h-10 w-full px-3 text-sm font-semibold outline-none",
                atlasUi.surfaces.input,
              )}
            />
          ) : showActions ? (
            <button
              type="button"
              onClick={(event) => handleActionClick(event, onStartRenaming)}
              aria-label={`Rename ${geofence.name}`}
              className="flex min-h-10 w-full cursor-text select-text items-center px-1 text-left"
            >
              <span className="truncate text-sm font-semibold text-atlas-ink atlas-transition-quick hover:text-atlas-ink">
                {geofence.name}
              </span>
            </button>
          ) : (
            <div className="flex min-h-10 w-full items-center px-1 text-left">
              <span className="truncate text-sm font-semibold text-atlas-ink">{geofence.name}</span>
            </div>
          )}
        </div>

        <div
          className={`atlas-action-strip origin-right overflow-hidden flex shrink-0 items-center gap-0.5 ${
            isSaveCancelMode || showActions
              ? "max-w-[112px] translate-x-0 scale-100 opacity-100"
              : "pointer-events-none max-w-0 translate-x-0 scale-90 opacity-0"
          }`}
        >
          {isSaveCancelMode ? (
            <>
              <button
                type="button"
                onClick={(event) =>
                  handleActionClick(event, isConfirmingDelete ? onConfirmDelete : onSaveEditing)
                }
                aria-label={
                  isConfirmingDelete
                    ? `Confirm delete ${geofence.name}`
                    : isSelectedForEditing && !isEditing
                      ? `Save ${geofence.name} edits`
                      : `Save ${geofence.name}`
                }
                className={cx(iconButtonClass, strongIconClass)}
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                onClick={(event) =>
                  handleActionClick(event, isConfirmingDelete ? onCancelDelete : onCancelEditing)
                }
                aria-label={
                  isConfirmingDelete
                    ? `Cancel delete ${geofence.name}`
                    : isSelectedForEditing && !isEditing
                      ? `Cancel ${geofence.name} edits`
                      : `Cancel editing ${geofence.name}`
                }
                className={cx(iconButtonClass, mutedIconClass)}
              >
                <CloseIcon />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={(event) => handleActionClick(event, onToggleVisibility)}
                aria-label={
                  geofence.isEnabled
                    ? `Hide ${geofence.name}`
                    : `Show ${geofence.name}`
                }
                className={cx(
                  iconButtonClass,
                  geofence.isEnabled ? primaryIconClass : mutedIconClass,
                )}
              >
                <VisibilityIcon />
              </button>
              <button
                type="button"
                onClick={(event) => handleActionClick(event, onStartEditing)}
                aria-label={`${isSelectedForEditing ? "Stop editing" : "Edit"} ${geofence.name}`}
                className={cx(
                  iconButtonClass,
                  isSelectedForEditing ? primaryIconClass : mutedIconClass,
                )}
              >
                <RenamePenIcon />
              </button>
              <button
                type="button"
                onClick={(event) => handleActionClick(event, onToggleDeleteConfirm)}
                aria-label={`Delete ${geofence.name}`}
                className={cx(iconButtonClass, mutedIconClass)}
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M4.5 4.5 11.5 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11.5 4.5 4.5 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RenamePenIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M10.899 2.601a1.5 1.5 0 0 1 2.122 0l.378.378a1.5 1.5 0 0 1 0 2.122l-6.53 6.53-2.873.352.351-2.873 6.552-6.509Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 4l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M2.75 4.25h10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6.25 2.75h3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M4.25 4.25v7.25c0 .69.56 1.25 1.25 1.25h5c.69 0 1.25-.56 1.25-1.25V4.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 6.5v3.5M9.5 6.5v3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VisibilityIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M1.75 8s2.3-3.5 6.25-3.5S14.25 8 14.25 8 11.95 11.5 8 11.5 1.75 8 1.75 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9.9A1.9 1.9 0 1 0 8 6a1.9 1.9 0 0 0 0 3.9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
