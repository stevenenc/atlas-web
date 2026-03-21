import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";

import { atlasUi, cx } from "@/features/atlascope/config/theme";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

import {
  CheckIcon,
  CloseIcon,
  RenamePenIcon,
  TrashIcon,
  VisibilityIcon,
} from "./geofence-icons";

type GeofenceItemProps = {
  draftName: string;
  geofence: AtlascopeGeofence;
  isConfirmingDelete: boolean;
  isEditing: boolean;
  isEntering: boolean;
  isExiting: boolean;
  isSelected: boolean;
  isSelectedForEditing: boolean;
  showActions: boolean;
  onCancelDelete: () => void;
  onCancelEditing: () => void;
  onConfirmDelete: () => void;
  onDraftNameChange: (value: string) => void;
  onFocusGeofence: () => void;
  onSaveEditing: () => void;
  onStartEditing: () => void;
  onStartRenaming: () => void;
  onToggleDeleteConfirm: () => void;
  onToggleVisibility: () => void;
};

export function GeofenceItem({
  draftName,
  geofence,
  isConfirmingDelete,
  isEditing,
  isEntering,
  isExiting,
  isSelected,
  isSelectedForEditing,
  showActions,
  onCancelDelete,
  onCancelEditing,
  onConfirmDelete,
  onDraftNameChange,
  onFocusGeofence,
  onSaveEditing,
  onStartEditing,
  onStartRenaming,
  onToggleDeleteConfirm,
  onToggleVisibility,
}: GeofenceItemProps) {
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
                aria-label={geofence.isEnabled ? `Hide ${geofence.name}` : `Show ${geofence.name}`}
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
