import { useEffect, useRef, useState } from "react";

import { themeClasses, type ThemeMode } from "@/features/atlascope/config/theme";
import type { AtlascopeGeofence } from "@/features/atlascope/types/geofence";

export type Geofence = AtlascopeGeofence;

type GeofencePanelProps = {
  theme: ThemeMode;
  geofences: Geofence[];
  editingGeofenceId: number | null;
  draftName: string;
  enteringGeofenceId: number | null;
  showRowActions: boolean;
  onAddGeofence: () => void;
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
  editingGeofenceId,
  draftName,
  enteringGeofenceId,
  showRowActions,
  onAddGeofence,
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
                  ? "flex size-7 items-center justify-center rounded-xl bg-white/[0.08] text-white"
                  : "flex size-7 items-center justify-center text-white/58 transition-colors duration-300 hover:text-white",
              light:
                showRowActions
                  ? "flex size-7 items-center justify-center rounded-xl bg-[#1F2A30]/[0.08] text-[#1F2A30]"
                  : "flex size-7 items-center justify-center text-[#536068] transition-colors duration-300 hover:text-[#1F2A30]",
            })}`}
          >
            <HeaderPenIcon />
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

          <button
            type="button"
            onClick={onAddGeofence}
            className={themeClasses(theme, {
              dark:
                "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/84 transition-colors duration-300 hover:bg-white/[0.08] hover:text-white",
              light:
                "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#3D464C]/10 bg-white/55 px-4 py-3 text-sm font-semibold text-[#1F2A30] transition-colors duration-300 hover:bg-white/90",
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
            <span>Create Geofence</span>
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
          "rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-[background-color,border-color,transform,opacity] duration-200 ease-out",
        light:
          "rounded-2xl border border-[#3D464C]/10 bg-white/44 px-4 py-3 transition-[background-color,border-color,transform,opacity] duration-200 ease-out",
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

        {isEditing || isConfirmingDelete || showActions ? (
          <div className="flex shrink-0 items-center gap-1.5">
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
                  <HighlightLetterIcon />
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
        ) : null}
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

function HeaderPenIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-5">
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

function HighlightLetterIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
      <path
        d="M4.9 3.4H4.1A1.6 1.6 0 0 0 2.5 5v6a1.6 1.6 0 0 0 1.6 1.6h.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.3 3.4h.8A1.6 1.6 0 0 1 12.7 5v6a1.6 1.6 0 0 1-1.6 1.6h-.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.85 2.4v11.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.35 2.4h3M9.35 13.6h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5.35 10.7 6.9 5.3h.2l1.55 5.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.9 8.9h2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
