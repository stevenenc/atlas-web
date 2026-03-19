import { themeClasses } from "@/features/atlascope/config/theme";
import type { ThemeMode } from "@/features/atlascope/config/theme";
import type { Incident } from "@/features/atlascope/types/atlascope";

type IncidentPanelProps = {
  incident: Incident | null;
  isLoading: boolean;
  onClose: () => void;
  theme: ThemeMode;
};

const severityStyles: Record<Incident["severity"], string> = {
  Critical: "bg-[#EF4444]/16 text-[#FF8C8C] border-[#EF4444]/25",
  High: "bg-[#F97316]/16 text-[#FDBA74] border-[#F97316]/25",
  Moderate: "bg-[#EAB308]/16 text-[#FDE68A] border-[#EAB308]/25",
};

export function IncidentPanel({
  incident,
  isLoading,
  onClose,
  theme,
}: IncidentPanelProps) {
  const isOpen = Boolean(incident) || isLoading;

  return (
    <aside
      className={`${themeClasses(theme, {
        dark:
          "w-[340px] rounded-[30px] border border-white/8 bg-[rgba(51,48,46,0.74)] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300",
        light:
          "w-[340px] rounded-[30px] border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.82)] p-5 text-[#2B251C] shadow-[0_24px_80px_rgba(120,97,59,0.14)] backdrop-blur-xl transition-all duration-300",
      })} ${
        isOpen
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      {isLoading ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
          <div className="size-10 animate-spin rounded-full border-2 border-white/10 border-t-white/80" />
          <div>
            <p
              className={themeClasses(theme, {
                dark: "text-sm font-medium text-white/85",
                light: "text-sm font-medium text-[#2B251C]",
              })}
            >
              Loading incident details
            </p>
            <p
              className={themeClasses(theme, {
                dark: "mt-1 text-xs text-white/45",
                light: "mt-1 text-xs text-[#8B7A5E]",
              })}
            >
              Syncing mock event context
            </p>
          </div>
        </div>
      ) : incident ? (
        <>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p
                className={themeClasses(theme, {
                  dark: "text-xs font-medium tracking-[0.32em] text-white/45 uppercase",
                  light: "text-xs font-medium tracking-[0.32em] text-[#8B7A5E] uppercase",
                })}
              >
                Incident Details
              </p>
              <h2
                className={themeClasses(theme, {
                  dark: "mt-2 text-2xl font-semibold leading-tight text-white",
                  light: "mt-2 text-2xl font-semibold leading-tight text-[#2B251C]",
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
                  "rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/62 transition hover:bg-white/10 hover:text-white",
                light:
                  "rounded-full border border-[#8B7A5E]/14 bg-white/60 px-3 py-1.5 text-xs text-[#7A6951] transition hover:bg-white/90 hover:text-[#2B251C]",
              })}
            >
              Close
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityStyles[incident.severity]}`}
            >
              {incident.severity} Severity
            </span>
            <span
              className={themeClasses(theme, {
              dark: "text-sm text-white/45",
              
              light: "text-sm text-[#8B7A5E]",
            })}
            >
              {incident.timestamp}
            </span>
          </div>

          <div
            className={themeClasses(theme, {
              dark: "mt-6 rounded-3xl border border-white/8 bg-white/6 p-4",
              light:
                "mt-6 rounded-3xl border border-[#8B7A5E]/10 bg-white/56 p-4",
            })}
          >
            <p
              className={themeClasses(theme, {
                dark: "text-xs font-medium tracking-[0.28em] text-white/45 uppercase",
                light: "text-xs font-medium tracking-[0.28em] text-[#8B7A5E] uppercase",
              })}
            >
              Why this alert
            </p>
            <p
              className={themeClasses(theme, {
                dark: "mt-3 text-sm leading-6 text-white/78",
                light: "mt-3 text-sm leading-6 text-[#43392B]",
              })}
            >
              {incident.whyThisAlert}
            </p>
          </div>

          <div
            className={themeClasses(theme, {
              dark: "mt-4 rounded-3xl border border-white/8 bg-black/10 p-4",
              light:
                "mt-4 rounded-3xl border border-[#8B7A5E]/10 bg-[#F1E4C7]/66 p-4",
            })}
          >
            <p
              className={themeClasses(theme, {
                dark: "text-xs font-medium tracking-[0.28em] text-white/45 uppercase",
                light: "text-xs font-medium tracking-[0.28em] text-[#8B7A5E] uppercase",
              })}
            >
              Detection Notes
            </p>
            <p
              className={themeClasses(theme, {
                dark: "mt-3 text-sm leading-6 text-white/62",
                light: "mt-3 text-sm leading-6 text-[#5E503B]",
              })}
            >
              AtlaScope scored this event using hazard intensity, local
              exposure, and short-term escalation risk from nearby conditions.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className={themeClasses(theme, {
                dark:
                  "flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#2B2928] transition hover:scale-[1.01] hover:bg-white/92",
                light:
                  "flex-1 rounded-2xl bg-[#2B251C] px-4 py-3 text-sm font-semibold text-[#FFF7E7] transition hover:scale-[1.01] hover:bg-[#1F1A14]",
              })}
            >
              Acknowledge
            </button>
            <button
              type="button"
              className={themeClasses(theme, {
                dark:
                  "flex-1 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-white/12",
                light:
                  "flex-1 rounded-2xl border border-[#8B7A5E]/14 bg-white/60 px-4 py-3 text-sm font-semibold text-[#2B251C] transition hover:scale-[1.01] hover:bg-white/90",
              })}
            >
              View Timeline
            </button>
          </div>
        </>
      ) : null}
    </aside>
  );
}

function getIncidentHeading(incident: Incident) {
  if (incident.type === "air_quality") {
    return `Air Quality Alert in ${incident.locationName}`;
  }

  const label =
    incident.type === "earthquake" ? "Earthquake Alert" : "Wildfire Alert";

  return `${label} in ${incident.locationName}`;
}
