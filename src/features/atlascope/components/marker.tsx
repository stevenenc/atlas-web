import { themeClasses } from "@/features/atlascope/config/theme";
import type { ThemeMode } from "@/features/atlascope/config/theme";
import type { Incident, IncidentType } from "@/features/atlascope/types/atlascope";

const markerStyles: Record<
  IncidentType,
  { dot: string; ring: string; label: string }
> = {
  earthquake: {
    dot: "bg-[#F97316] shadow-[0_0_30px_rgba(249,115,22,0.45)]",
    ring: "border-[#F97316]/45",
    label: "Earthquake",
  },
  wildfire: {
    dot: "bg-[#EF4444] shadow-[0_0_34px_rgba(239,68,68,0.6)]",
    ring: "border-[#EF4444]/50",
    label: "Wildfire",
  },
  air_quality: {
    dot: "bg-[#EAB308] shadow-[0_0_30px_rgba(234,179,8,0.45)]",
    ring: "border-[#EAB308]/45",
    label: "Air Quality",
  },
};

type MarkerProps = {
  incident: Incident;
  isSelected: boolean;
  onSelect: (incident: Incident) => void;
  theme: ThemeMode;
};

export function Marker({ incident, isSelected, onSelect, theme }: MarkerProps) {
  const style = markerStyles[incident.type];

  return (
    <button
      type="button"
      aria-label={`${style.label} alert at ${incident.locationName}`}
      onClick={() => onSelect(incident)}
      className="group absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:z-20 hover:scale-110 focus-visible:z-20 focus-visible:scale-110 focus-visible:outline-none"
      style={{ left: `${incident.x}%`, top: `${incident.y}%` }}
    >
      <span
        className={`absolute inset-0 rounded-full border ${style.ring} animate-ping ${isSelected ? "opacity-100" : "opacity-70"}`}
      />
      <span
        className={`${themeClasses(theme, {
          dark: "border-white/18 shadow-[0_0_0_3px_rgba(255,255,255,0.06)]",
          light: "border-[#2B251C]/10 shadow-[0_0_0_3px_rgba(255,250,239,0.9)]",
        })} relative block size-4 rounded-full ${style.dot} ${isSelected ? "scale-125" : ""}`}
      />
      <span
        className={themeClasses(theme, {
          dark:
            "pointer-events-none absolute left-1/2 top-full mt-3 w-max -translate-x-1/2 rounded-full border border-white/10 bg-[rgba(51,48,46,0.84)] px-2.5 py-1 text-[10px] font-medium tracking-[0.24em] text-white/78 uppercase opacity-0 backdrop-blur-md transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
          light:
            "pointer-events-none absolute left-1/2 top-full mt-3 w-max -translate-x-1/2 rounded-full border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.9)] px-2.5 py-1 text-[10px] font-medium tracking-[0.24em] text-[#4C4235] uppercase opacity-0 backdrop-blur-md transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
        })}
      >
        {incident.locationName}
      </span>
    </button>
  );
}
