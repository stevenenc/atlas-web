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
          "pointer-events-auto w-[342px] rounded-[30px] border border-white/10 bg-[rgba(60,60,56,0.92)] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.36)] backdrop-blur-md transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
        light:
          "pointer-events-auto w-[342px] rounded-[30px] border border-[#8B7A5E]/14 bg-[rgba(255,249,238,0.78)] p-6 text-[#2B251C] shadow-[0_24px_80px_rgba(120,97,59,0.12)] backdrop-blur-xl transition-[background-color,border-color,color,box-shadow] duration-500 ease-out",
      })}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p
            className={themeClasses(theme, {
              dark: "text-xs font-medium tracking-[0.32em] text-white/42 uppercase transition-colors duration-500 ease-out",
              light:
                "text-xs font-medium tracking-[0.32em] text-[#8B7A5E] uppercase transition-colors duration-500 ease-out",
            })}
          >
            Overlays
          </p>
          <h2 className="mt-1 text-xl font-semibold">Layers</h2>
        </div>
        <div
          className={themeClasses(theme, {
            dark: "rounded-full border border-white/12 bg-[rgba(255,255,255,0.03)] px-4 py-1.5 text-xs text-white/48 transition-[background-color,border-color,color] duration-500 ease-out",
            
            light:
              "rounded-full border border-[#8B7A5E]/14 bg-white/60 px-4 py-1.5 text-xs text-[#7A6951] transition-[background-color,border-color,color] duration-500 ease-out",
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
                  "flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-5 py-4 text-left transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-[rgba(255,255,255,0.07)]",
                light:
                  "flex w-full items-center justify-between rounded-[22px] border border-[#8B7A5E]/10 bg-white/52 px-5 py-4 text-left transition-[background-color,border-color,color,box-shadow] duration-500 ease-out hover:bg-white/76",
              })}
            >
              <div className="flex items-center gap-3">
                <span className={`size-2.5 rounded-full ${layer.color}`} />
                <div>
                  <p
                    className={themeClasses(theme, {
                      dark: "text-sm font-medium text-white transition-colors duration-500 ease-out",
                      light: "text-sm font-medium text-[#2B251C] transition-colors duration-500 ease-out",
                    })}
                  >
                    {layer.label}
                  </p>
                  <p
                  className={themeClasses(theme, {
                      dark: "text-xs text-white/46 transition-colors duration-500 ease-out",
                      light: "text-xs text-[#8B7A5E] transition-colors duration-500 ease-out",
                    })}
                  >
                    {enabled ? "Visible on map" : "Hidden from map"}
                  </p>
                </div>
              </div>

              <span
                className={`relative inline-flex h-7 w-12 rounded-full border transition-[background-color,border-color] duration-500 ease-out ${
                  enabled
                    ? theme === "dark"
                      ? "border-white/14 bg-[rgba(255,255,255,0.08)]"
                      
                      : "border-[#8B7A5E]/20 bg-[#E9D9B7]"
                    : theme === "dark"
                      ? "border-white/10 bg-[rgba(0,0,0,0.16)]"
                      : "border-[#8B7A5E]/12 bg-[#F3E7CE]"
                }`}
              >
                <span
                  className={`absolute top-1 size-5 rounded-full transition-[left,background-color,box-shadow] duration-500 ease-out ${
                    enabled
                      ? theme === "dark"
                        ? "left-6 bg-[#F0F3F8] shadow-[0_0_18px_rgba(155,191,224,0.26)]"
                        : "left-6 bg-[#2B251C] shadow-[0_0_18px_rgba(74,59,34,0.18)]"
                      : theme === "dark"
                        ? "left-1 bg-white/34"
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
