import { layerRows } from "@/features/atlascope/config/theme";
import { BasePanel, PanelHeader } from "@/features/atlascope/components/overlay/panel/panel-system";
import type { IncidentType } from "@/features/atlascope/types/atlascope";

import { LayerRow } from "./layer-row";

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
