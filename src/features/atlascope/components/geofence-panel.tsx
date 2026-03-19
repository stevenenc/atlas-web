import { useEffect, useRef, useState } from "react";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

export type Geofence = AtlascopeGeofence;

type GeofencePanelProps = {
  theme: ThemeMode;
  geofences: Geofence[];
  isDrawingGeofence: boolean;
  drawingPointCount: number;
  editingGeofenceId: number | null;
  draftName: string;
  enteringGeofenceId: number | null;
  showRowActions: boolean;
  onAddGeofence: () => void;
  onCancelDrawing: () => void;
  onFinishDrawing: () => void;
  onDraftNameChange: (value: string) => void;
  onStartEditing: (geofence: Geofence) => void;
  onSaveEditing: (geofence: Geofence) => void;
  onCancelEditing: (geofence: Geofence) => void;
  onToggleRowActions: () => void;
  onToggleEnabled: (id: number) => void;
  onRenameGeofence: (id: number, name: string) => void;
  onDeleteGeofence: (id: number) => void;
};

export function GeofencePanel({
  theme,
  geofences,
  isDrawingGeofence,
  drawingPointCount,
  editingGeofenceId,
  draftName,
  enteringGeofenceId,
  showRowActions,
  onAddGeofence,
  onCancelDrawing,
  onFinishDrawing,
  onDraftNameChange,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onToggleRowActions,
  onToggleEnabled,
  onRenameGeofence,
  onDeleteGeofence,
}: GeofencePanelProps) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
  const [exitingId, setExitingId] = useState<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

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
    setConfirmingDeleteId(null);
    setExitingId(id);

    if (deleteTimerRef.current) {
      window.clearTimeout(deleteTimerRef.current);
    }

    deleteTimerRef.current = window.setTimeout(() => {
      onDeleteGeofence(id);
      setExitingId((current) => (current === id ? null : current));
      deleteTimerRef.current = null;
    }, 180);
  }

  return (
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
            Manage monitored regions
          </p>
          <p
            className={themeClasses(theme, {
              dark: "mt-2 text-lg font-semibold text-white/86",
              light: "mt-2 text-lg font-semibold text-[#1F2A30]",
            })}
          >
            GeoFences
          </p>
        </div>
        {geofences.length ? (
          <button
            type="button"
            onClick={onToggleRowActions}
            aria-label={showRowActions ? "Hide geofence actions" : "Show geofence actions"}
            className={`mt-7 ${themeClasses(theme, {
              dark:
                showRowActions
                  ? "rounded-lg bg-white/[0.08] px-2 py-1 text-[11px] font-semibold tracking-[0.14em] text-white uppercase"
                  : "px-2 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/58 uppercase transition-colors duration-300 hover:text-white",
              light:
                showRowActions
                  ? "rounded-lg bg-[#1F2A30]/[0.08] px-2 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#1F2A30] uppercase"
                  : "px-2 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#536068] uppercase transition-colors duration-300 hover:text-[#1F2A30]",
            })}`}
          >
            Edit
          </button>
        ) : null}
      </div>

      {geofences.length ? (
        <>
          <div className="mt-4 space-y-2">
            {geofences.map((geofence) => (
              <GeofenceItem
                key={geofence.id}
                theme={theme}
                geofence={geofence}
                isEditing={editingGeofenceId === geofence.id}
                draftName={draftName}
                isConfirmingDelete={confirmingDeleteId === geofence.id}
                isEntering={enteringGeofenceId === geofence.id}
                isExiting={exitingId === geofence.id}
                showActions={showRowActions}
                onDraftNameChange={onDraftNameChange}
                onToggleEnabled={() => onToggleEnabled(geofence.id)}
                onStartEditing={() => handleStartEditing(geofence)}
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
              className={themeClasses(theme, {
                dark:
                  "mt-3 flex min-h-[88px] w-full items-center justify-between rounded-2xl border border-[#5BD3F5]/34 bg-[linear-gradient(180deg,rgba(91,211,245,0.22),rgba(91,211,245,0.14))] px-4 py-3 text-sm text-white/84 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                light:
                  "mt-3 flex min-h-[88px] w-full items-center justify-between rounded-2xl border border-[#1E63D5]/24 bg-[linear-gradient(180deg,rgba(30,99,213,0.16),rgba(30,99,213,0.09))] px-4 py-3 text-sm text-[#1F2A30] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
              })}
            >
              <div className="min-w-0 text-left">
                <p
                  className={themeClasses(theme, {
                    dark: "text-[11px] font-semibold tracking-[0.22em] text-[#9BEAFF] uppercase",
                    light: "text-[11px] font-semibold tracking-[0.22em] text-[#1E63D5] uppercase",
                  })}
                >
                  Geofence Drawing
                </p>
                <p
                  className={themeClasses(theme, {
                    dark: "mt-1 text-xs font-semibold text-white/56",
                    light: "mt-1 text-xs font-semibold text-[#5A6972]",
                  })}
                >
                  {drawingPointCount} point{drawingPointCount === 1 ? "" : "s"} placed
                </p>
              </div>
              <div className="ml-3 flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={onCancelDrawing}
                  aria-label="Cancel geofence drawing"
                  className={themeClasses(theme, {
                    dark:
                      "flex size-7 items-center justify-center text-white/52 transition-colors duration-300 hover:text-white",
                    light:
                      "flex size-7 items-center justify-center text-[#536068] transition-colors duration-300 hover:text-[#1F2A30]",
                  })}
                >
                  <CloseIcon />
                </button>
                <button
                  type="button"
                  onClick={onFinishDrawing}
                  disabled={drawingPointCount < 3}
                  aria-label="Finish geofence drawing"
                  className={themeClasses(theme, {
                    dark:
                      "flex size-7 items-center justify-center text-white/82 transition-colors duration-300 hover:text-white disabled:cursor-not-allowed disabled:text-white/24",
                    light:
                      "flex size-7 items-center justify-center text-[#1F2A30] transition-colors duration-300 hover:text-[#11191E] disabled:cursor-not-allowed disabled:text-[#7A8790]",
                  })}
                >
                  <CheckIcon />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAddGeofence}
              className={themeClasses(theme, {
                dark:
                  "mt-3 flex min-h-[88px] w-full items-center justify-center gap-2 rounded-2xl border border-[#5BD3F5]/14 bg-[linear-gradient(180deg,rgba(91,211,245,0.08),rgba(91,211,245,0.03))] px-4 py-3 text-sm font-semibold text-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-[#5BD3F5]/22 hover:bg-[linear-gradient(180deg,rgba(91,211,245,0.12),rgba(91,211,245,0.06))] hover:text-white",
                light:
                  "mt-3 flex min-h-[88px] w-full items-center justify-center gap-2 rounded-2xl border border-[#1E63D5]/12 bg-[linear-gradient(180deg,rgba(30,99,213,0.06),rgba(30,99,213,0.025))] px-4 py-3 text-sm font-semibold text-[#1F2A30] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] transition-all duration-300 hover:border-[#1E63D5]/18 hover:bg-[linear-gradient(180deg,rgba(30,99,213,0.08),rgba(30,99,213,0.04))]",
              })}
            >
              <span
                className={themeClasses(theme, {
                  dark: "text-base leading-none text-white/64",
                  light: "text-base leading-none text-[#536068]",
                })}
              >
                +
              </span>
              <span>Add Geofence</span>
            </button>
          )}
        </>
      ) : (
        <div
          className={themeClasses(theme, {
            dark: "mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-7 text-center",
            light: "mt-4 rounded-2xl border border-dashed border-[#3D464C]/10 bg-white/44 px-4 py-7 text-center",
          })}
        >
          <p
            className={themeClasses(theme, {
              dark: "text-sm font-semibold text-white/84",
              light: "text-sm font-semibold text-[#1F2A30]",
            })}
          >
            No geofences yet
          </p>
          <button
            type="button"
            onClick={onAddGeofence}
            className={themeClasses(theme, {
              dark:
                "mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E8EDF0] px-4 py-3 text-sm font-semibold text-[#11191E] transition-colors duration-300 hover:bg-white",
              light:
                "mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1A252D] px-4 py-3 text-sm font-semibold text-[#F3F6F8] transition-colors duration-300 hover:bg-[#10181E]",
            })}
          >
            <span className="text-base leading-none">+</span>
            <span>{isDrawingGeofence ? "Drawing Geofence" : "Create Geofence"}</span>
          </button>
        </div>
      )}
    </aside>
  );
}

function GeofenceItem({
  theme,
  geofence,
  isEditing,
  draftName,
  isConfirmingDelete,
  isEntering,
  isExiting,
  showActions,
  onDraftNameChange,
  onToggleEnabled,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onToggleDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
}: {
  theme: ThemeMode;
  geofence: Geofence;
  isEditing: boolean;
  draftName: string;
  isConfirmingDelete: boolean;
  isEntering: boolean;
  isExiting: boolean;
  showActions: boolean;
  onDraftNameChange: (value: string) => void;
  onToggleEnabled: () => void;
  onStartEditing: () => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onToggleDeleteConfirm: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <div
      className={`${themeClasses(theme, {
        dark:
          "overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-[background-color,border-color,transform,opacity] duration-200 ease-out",
        light:
          "overflow-hidden rounded-2xl border border-[#3D464C]/10 bg-white/44 px-4 py-3 transition-[background-color,border-color,transform,opacity] duration-200 ease-out",
      })} ${
        isEntering ? "atlascope-panel-item-enter" : ""
      } ${isExiting ? "atlascope-panel-item-exit pointer-events-none" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              value={draftName}
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
              className={themeClasses(theme, {
                dark:
                  "h-10 w-full rounded-xl border border-white/12 bg-[#0D1418] px-3 text-sm font-semibold text-white/88 outline-none placeholder:text-white/38",
                light:
                  "h-10 w-full rounded-xl border border-[#3D464C]/12 bg-white/85 px-3 text-sm font-semibold text-[#1F2A30] outline-none placeholder:text-[#7A8790]",
              })}
            />
          ) : (
            <div className="flex min-h-10 w-full items-center px-1 text-left">
              <span
                className={themeClasses(theme, {
                  dark: "truncate text-sm font-semibold text-white/86",
                  light: "truncate text-sm font-semibold text-[#1F2A30]",
                })}
              >
                {geofence.name}
              </span>
            </div>
          )}
        </div>

        <div
          className={`origin-right overflow-hidden flex shrink-0 items-center gap-0.5 transition-[opacity,transform,max-width] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isEditing || isConfirmingDelete || showActions
              ? "max-w-[112px] translate-x-0 scale-100 opacity-100"
              : "pointer-events-none max-w-0 translate-x-0 scale-90 opacity-0"
          }`}
        >
          {isEditing || isConfirmingDelete ? (
            <>
              <button
                type="button"
                onClick={isConfirmingDelete ? onConfirmDelete : onSaveEditing}
                aria-label={
                  isConfirmingDelete
                    ? `Confirm delete ${geofence.name}`
                    : `Save ${geofence.name}`
                }
                className={themeClasses(theme, {
                  dark:
                    "flex size-7 items-center justify-center text-white/82 transition-colors duration-300 hover:text-white",
                  light:
                    "flex size-7 items-center justify-center text-[#1F2A30] transition-colors duration-300 hover:text-[#11191E]",
                })}
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                onClick={isConfirmingDelete ? onCancelDelete : onCancelEditing}
                aria-label={
                  isConfirmingDelete
                    ? `Cancel delete ${geofence.name}`
                    : `Cancel editing ${geofence.name}`
                }
                className={themeClasses(theme, {
                  dark:
                    "flex size-7 items-center justify-center text-white/52 transition-colors duration-300 hover:text-white",
                  light:
                    "flex size-7 items-center justify-center text-[#536068] transition-colors duration-300 hover:text-[#1F2A30]",
                })}
              >
                <CloseIcon />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onToggleEnabled}
                aria-label={
                  geofence.isEnabled
                    ? `Disable geofencing for ${geofence.name}`
                    : `Enable geofencing for ${geofence.name}`
                }
                className={themeClasses(theme, {
                  dark: geofence.isEnabled
                    ? "flex size-7 items-center justify-center text-[#5BD3F5] transition-colors duration-300 hover:text-[#83E0FA]"
                    : "flex size-7 items-center justify-center text-white/52 transition-colors duration-300 hover:text-white",
                  light: geofence.isEnabled
                    ? "flex size-7 items-center justify-center text-[#1E63D5] transition-colors duration-300 hover:text-[#2E75EB]"
                    : "flex size-7 items-center justify-center text-[#536068] transition-colors duration-300 hover:text-[#1F2A30]",
                })}
              >
                <LocationIcon />
              </button>
              <button
                type="button"
                onClick={onStartEditing}
                aria-label={`Rename ${geofence.name}`}
                className={themeClasses(theme, {
                  dark:
                    "flex size-7 items-center justify-center text-white/52 transition-colors duration-300 hover:text-white",
                  light:
                    "flex size-7 items-center justify-center text-[#536068] transition-colors duration-300 hover:text-[#1F2A30]",
                })}
              >
                <RenamePenIcon />
              </button>
              <button
                type="button"
                onClick={onToggleDeleteConfirm}
                aria-label={`Delete ${geofence.name}`}
                className={themeClasses(theme, {
                  dark:
                    "flex size-7 items-center justify-center text-white/52 transition-colors duration-300 hover:text-white",
                  light:
                    "flex size-7 items-center justify-center text-[#536068] transition-colors duration-300 hover:text-[#1F2A30]",
                })}
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

function LocationIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M8 13.3c-.35 0-.66-.16-.86-.45L4.68 9.3A4.84 4.84 0 0 1 3.85 6.6C3.85 4.05 5.7 2.2 8 2.2s4.15 1.85 4.15 4.4c0 1-.3 1.93-.83 2.7l-2.46 3.55c-.2.29-.51.45-.86.45Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 5.2a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
