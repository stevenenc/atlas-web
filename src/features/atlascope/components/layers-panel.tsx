import { atlasUi, cx, layerRows } from "@/features/atlascope/config/theme";
import type { IncidentType } from "@/features/atlascope/types/atlascope";

import { BasePanel, PanelHeader } from "./panel-system";

type LayersPanelProps = {
  activeLayers: Record<IncidentType, boolean>;
  isOpen: boolean;
  onToggleLayer: (layer: IncidentType) => void;
};

export function LayersPanel({
  activeLayers,
  isOpen,
  onToggleLayer,
}: LayersPanelProps) {
  return (
    <BasePanel isOpen={isOpen} ariaLabel="Layers panel">
      <PanelHeader eyebrow="Hazard Layers" />

      <div className="mt-5 space-y-2">
        {layerRows.map((layer) => (
          <LayerRow
            key={layer.id}
            label={layer.label}
            color={layer.color}
            active={activeLayers[layer.id]}
            onClick={() => onToggleLayer(layer.id)}
          />
        ))}
      </div>
    </BasePanel>
  );
}

function LayerRow({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "grid w-full grid-cols-[minmax(0,1fr)_76px] items-center gap-4 px-4 py-2.5 text-left outline-none active:scale-[0.995]",
        atlasUi.surfaces.interactiveCard,
        atlasUi.surfaces.interactiveCardHover,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="size-3 rounded-full"
          style={{
            backgroundColor: color,
            boxShadow: active ? `0 0 14px ${color}55` : "none",
            opacity: active ? 1 : 0.35,
          }}
        />
        <span className={atlasUi.text.label}>{label}</span>
      </div>
      <div className="flex h-full min-h-[52px] w-[76px] items-center justify-center">
        <span
          className="relative inline-flex h-7 w-12 items-center rounded-full border px-0.5 atlas-transition-quick"
          style={{
            borderColor: active ? `${color}88` : "var(--atlas-color-card-border)",
            backgroundColor: active ? `${color}24` : "var(--atlas-color-timeline-play)",
          }}
        >
          <span
            className="absolute left-0.5 top-0.5 size-5 transform-gpu rounded-full atlas-transition-quick"
            style={{
              transform: `translateX(${active ? "20px" : "0px"})`,
              backgroundColor: active ? color : "var(--atlas-color-muted)",
              boxShadow: active ? `0 0 12px ${color}44` : "none",
            }}
          />
        </span>
      </div>
    </button>
  );
}
