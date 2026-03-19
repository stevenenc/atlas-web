import { themeClasses } from "@/features/atlascope/config/theme";
import type { ThemeMode } from "@/features/atlascope/config/theme";
import type { IncidentType } from "@/features/atlascope/types/atlascope";

type LayerPanelProps = {
  activeLayers: Record<IncidentType, boolean>;
  onToggle: (layer: IncidentType) => void;
  theme: ThemeMode;
};

const layerConfig: Array<{
  id: IncidentType;
  label: string;
  color: string;
}> = [
  { id: "earthquake", label: "Earthquakes", color: "bg-[#F97316]" },
  { id: "wildfire", label: "Wildfires", color: "bg-[#EF4444]" },
  { id: "air_quality", label: "Air Quality", color: "bg-[#EAB308]" },
];

export function LayerPanel({ activeLayers, onToggle, theme }: LayerPanelProps) {
  return (
    <aside
      className={themeClasses(theme, {
        dark:
          "pointer-events-auto w-[280px] rounded-[28px] border border-white/8 bg-[rgba(51,48,46,0.74)] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl",
        light:
          "pointer-events-auto w-[280px] rounded-[28px] border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.78)] p-5 text-[#2B251C] shadow-[0_24px_80px_rgba(120,97,59,0.12)] backdrop-blur-xl",
      })}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p
            className={themeClasses(theme, {
              dark: "text-xs font-medium tracking-[0.32em] text-white/45 uppercase",
              light: "text-xs font-medium tracking-[0.32em] text-[#8B7A5E] uppercase",
            })}
          >
            Overlays
          </p>
          <h2 className="mt-1 text-xl font-semibold">Layers</h2>
        </div>
        <div
          className={themeClasses(theme, {
            dark: "rounded-full border border-white/10 px-3 py-1 text-xs text-white/50",
            
            light:
              "rounded-full border border-[#8B7A5E]/14 bg-white/60 px-3 py-1 text-xs text-[#7A6951]",
          })}
        >
          Live
        </div>
      </div>

      <div className="space-y-3">
        {layerConfig.map((layer) => {
          const enabled = activeLayers[layer.id];

          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onToggle(layer.id)}
              className={themeClasses(theme, {
                dark:
                  "flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-left transition duration-200 hover:bg-white/10",
                light:
                  "flex w-full items-center justify-between rounded-2xl border border-[#8B7A5E]/10 bg-white/52 px-4 py-3 text-left transition duration-200 hover:bg-white/76",
              })}
            >
              <div className="flex items-center gap-3">
                <span className={`size-2.5 rounded-full ${layer.color}`} />
                <div>
                  <p
                    className={themeClasses(theme, {
                      dark: "text-sm font-medium text-white",
                      light: "text-sm font-medium text-[#2B251C]",
                    })}
                  >
                    {layer.label}
                  </p>
                  <p
                    className={themeClasses(theme, {
                      dark: "text-xs text-white/45",
                      light: "text-xs text-[#8B7A5E]",
                    })}
                  >
                    {enabled ? "Visible on map" : "Hidden from map"}
                  </p>
                </div>
              </div>

              <span
                className={`relative inline-flex h-7 w-12 rounded-full border transition duration-200 ${
                  enabled
                    ? theme === "dark"
                      ? "border-white/20 bg-white/14"
                      
                      : "border-[#8B7A5E]/20 bg-[#E9D9B7]"
                    : theme === "dark"
                      ? "border-white/10 bg-black/18"
                      : "border-[#8B7A5E]/12 bg-[#F3E7CE]"
                }`}
              >
                <span
                  className={`absolute top-1 size-5 rounded-full transition duration-200 ${
                    enabled
                      ? theme === "dark"
                        ? "left-6 bg-white shadow-[0_0_18px_rgba(255,255,255,0.22)]"
                        : "left-6 bg-[#2B251C] shadow-[0_0_18px_rgba(74,59,34,0.18)]"
                      : theme === "dark"
                        ? "left-1 bg-white/38"
                        : "left-1 bg-[#BCA98A]"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
