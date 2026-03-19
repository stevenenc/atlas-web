import { themeClasses } from "@/features/atlascope/config/theme";
import type { ThemeMode } from "@/features/atlascope/config/theme";
import type { Incident } from "@/features/atlascope/types/atlascope";

type IncidentPanelProps = {
  incident: Incident | null;
  isLoading: boolean;
  onClose: () => void;
  theme: ThemeMode;
};

const severityStyles: Record<
  Incident["severity"],
  {
    dark: string;
    light: string;
    accent: string;
  }
> = {
  Critical: {
    dark: "border-[#EF4444]/26 bg-[#EF4444]/12 text-[#FFB1B1]",
    light: "border-[#DC2626]/16 bg-[#DC2626]/8 text-[#991B1B]",
    accent: "#EF4444",
  },
  High: {
    dark: "border-[#F97316]/26 bg-[#F97316]/12 text-[#FDBA74]",
    light: "border-[#EA580C]/16 bg-[#EA580C]/8 text-[#9A3412]",
    accent: "#F97316",
  },
  Moderate: {
    dark: "border-[#D8B11E]/24 bg-[#D8B11E]/10 text-[#F4DA79]",
    light: "border-[#A16207]/14 bg-[#CA8A04]/8 text-[#854D0E]",
    accent: "#D8B11E",
  },
};

export function IncidentPanel({
  incident,
  isLoading,
  onClose,
  theme,
}: IncidentPanelProps) {
  return (
    <aside
      className={`${themeClasses(theme, {
        dark:
          "w-[376px] rounded-sm border border-white/10 bg-[rgba(12,17,20,0.86)] p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-md transition-[transform,opacity] duration-300 ease-out",
        light:
          "w-[376px] rounded-sm border border-[#3D464C]/12 bg-[rgba(241,244,245,0.92)] p-5 text-[#1F2A30] shadow-[0_20px_50px_rgba(68,79,88,0.16)] backdrop-blur-md transition-[transform,opacity] duration-300 ease-out",
      })} ${
        isLoading || incident
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      {isLoading ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
          <div
            className={themeClasses(theme, {
              dark: "size-11 animate-spin rounded-full border-2 border-white/10 border-t-white/78",
              light: "size-11 animate-spin rounded-full border-2 border-[#3D464C]/12 border-t-[#1F2A30]",
            })}
          />
          <div>
            <p
              className={themeClasses(theme, {
                dark: "text-sm font-semibold text-white/84",
                light: "text-sm font-semibold text-[#1F2A30]",
              })}
            >
              Pulling incident context
            </p>
            <p
              className={themeClasses(theme, {
                dark: "mt-1 text-xs text-white/44",
                light: "mt-1 text-xs text-[#627078]",
              })}
            >
              Rebuilding the mock event picture for review
            </p>
          </div>
        </div>
      ) : incident ? (
        <SelectedIncidentView incident={incident} onClose={onClose} theme={theme} />
      ) : null}
    </aside>
  );
}

function SelectedIncidentView({
  incident,
  onClose,
  theme,
}: {
  incident: Incident;
  onClose: () => void;
  theme: ThemeMode;
}) {
  const severityStyle = severityStyles[incident.severity];

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={themeClasses(theme, {
              dark: "text-[10px] font-semibold tracking-[0.34em] text-white/38 uppercase",
              light: "text-[10px] font-semibold tracking-[0.34em] text-[#607078] uppercase",
            })}
          >
            Incident Workspace
          </p>
          <h2
            className={themeClasses(theme, {
              dark: "mt-2 text-2xl font-semibold leading-tight text-white/90",
              light: "mt-2 text-2xl font-semibold leading-tight text-[#1F2A30]",
            })}
          >
            {getIncidentHeading(incident)}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={themeClasses(theme, {
            dark:
              "rounded-sm border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-white/66 uppercase transition-colors duration-300 hover:bg-white/[0.08] hover:text-white",
            light:
              "rounded-sm border border-[#3D464C]/10 bg-white/55 px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-[#536068] uppercase transition-colors duration-300 hover:bg-white/90 hover:text-[#1F2A30]",
          })}
        >
          Clear
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span
          className={`${theme === "dark" ? severityStyle.dark : severityStyle.light} rounded-sm border px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase`}
        >
          {incident.severity}
        </span>
        <span
          className={themeClasses(theme, {
            dark: "text-sm text-white/50",
            light: "text-sm text-[#627078]",
          })}
        >
          {incident.timestamp}
        </span>
      </div>

      <div
        className={themeClasses(theme, {
          dark: "mt-5 rounded-sm border border-white/8 bg-white/[0.03] p-4",
          light: "mt-5 rounded-sm border border-[#3D464C]/10 bg-white/40 p-4",
        })}
      >
        <p
          className={themeClasses(theme, {
            dark: "text-[10px] font-semibold tracking-[0.24em] text-white/36 uppercase",
            light: "text-[10px] font-semibold tracking-[0.24em] text-[#607078] uppercase",
          })}
        >
          Operational Summary
        </p>
        <p
          className={themeClasses(theme, {
            dark: "mt-3 text-sm leading-6 text-white/78",
            light: "mt-3 text-sm leading-6 text-[#4F5D65]",
          })}
        >
          {incident.whyThisAlert}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PanelMetric label="Hazard" value={getIncidentLabel(incident)} theme={theme} />
        <PanelMetric label="Location" value={incident.locationName} theme={theme} />
      </div>

      <div
        className={themeClasses(theme, {
          dark: "mt-4 rounded-sm border border-white/8 bg-[#0A0F12] p-4",
          light: "mt-4 rounded-sm border border-[#3D464C]/10 bg-[#E8EDF0] p-4",
        })}
      >
        <div className="flex items-center justify-between gap-3">
          <p
            className={themeClasses(theme, {
              dark: "text-[10px] font-semibold tracking-[0.24em] text-white/36 uppercase",
              light: "text-[10px] font-semibold tracking-[0.24em] text-[#607078] uppercase",
            })}
          >
            Detection Notes
          </p>
          <span
            className="inline-flex h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: severityStyle.accent,
              boxShadow: `0 0 14px ${severityStyle.accent}66`,
            }}
          />
        </div>
        <p
          className={themeClasses(theme, {
            dark: "mt-3 text-sm leading-6 text-white/60",
            light: "mt-3 text-sm leading-6 text-[#5E6C74]",
          })}
        >
          AtlaScope ranks this event from hazard intensity, local exposure, and near-term escalation indicators in the surrounding area.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          className={themeClasses(theme, {
            dark:
              "rounded-sm bg-[#E8EDF0] px-4 py-3 text-sm font-semibold text-[#11191E] transition-colors duration-300 hover:bg-white",
            light:
              "rounded-sm bg-[#1A252D] px-4 py-3 text-sm font-semibold text-[#F3F6F8] transition-colors duration-300 hover:bg-[#10181E]",
          })}
        >
          Acknowledge Alert
        </button>
        <button
          type="button"
          className={themeClasses(theme, {
            dark:
              "rounded-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/84 transition-colors duration-300 hover:bg-white/[0.08]",
            light:
              "rounded-sm border border-[#3D464C]/10 bg-white/55 px-4 py-3 text-sm font-semibold text-[#1F2A30] transition-colors duration-300 hover:bg-white/90",
          })}
        >
          Open Timeline
        </button>
      </div>
    </>
  );
}

function PanelMetric({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ThemeMode;
}) {
  return (
    <div
      className={themeClasses(theme, {
        dark: "rounded-sm border border-white/8 bg-white/[0.03] px-3 py-3",
        light: "rounded-sm border border-[#3D464C]/10 bg-white/40 px-3 py-3",
      })}
    >
      <p
        className={themeClasses(theme, {
          dark: "text-[10px] font-semibold tracking-[0.22em] text-white/36 uppercase",
          light: "text-[10px] font-semibold tracking-[0.22em] text-[#607078] uppercase",
        })}
      >
        {label}
      </p>
      <p
        className={themeClasses(theme, {
          dark: "mt-2 text-lg font-semibold text-white/88",
          light: "mt-2 text-lg font-semibold text-[#1F2A30]",
        })}
      >
        {value}
      </p>
    </div>
  );
}

function getIncidentHeading(incident: Incident) {
  if (incident.type === "air_quality") {
    return `Air Quality Alert in ${incident.locationName}`;
  }

  return incident.type === "earthquake"
    ? `Earthquake Alert in ${incident.locationName}`
    : `Wildfire Alert in ${incident.locationName}`;
}

function getIncidentLabel(incident: Incident) {
  if (incident.type === "air_quality") {
    return "Air Quality";
  }

  return incident.type === "earthquake" ? "Earthquake" : "Wildfire";
}
