import type { ComponentProps, RefObject } from "react";

import { type ThemeMode } from "@/features/atlascope/config/theme";
import type { IncidentType } from "@/features/atlascope/types/atlascope";

import {
  GeofenceIcon,
  LayersIcon,
  SearchIcon,
  UserIcon,
} from "./atlascope-icons";
import { GeofencePanel } from "./geofence-panel";
import { LayersPanel } from "./layers-panel";
import { OverlayRailButton } from "./overlay-rail-button";
import { SearchPanel } from "./search-panel";
import { UserPanel } from "./user-panel";

export type OverlayPanelId = "search" | "user" | "layers" | "geofences";

type AtlascopeShellOverlaysProps = {
  activeLayers: Record<IncidentType, boolean>;
  geofencePanelProps: Omit<ComponentProps<typeof GeofencePanel>, "isOpen">;
  isPanelOpen: (panel: OverlayPanelId) => boolean;
  onToggleLayer: (layer: IncidentType) => void;
  onToggleTheme: () => void;
  panelRootRef: RefObject<HTMLDivElement | null>;
  theme: ThemeMode;
  togglePanel: (panel: OverlayPanelId) => void;
};

export function AtlascopeShellOverlays({
  activeLayers,
  geofencePanelProps,
  isPanelOpen,
  onToggleLayer,
  onToggleTheme,
  panelRootRef,
  theme,
  togglePanel,
}: AtlascopeShellOverlaysProps) {
  return (
    <div className="fixed right-6 top-6 z-30 flex items-start justify-end">
      <div ref={panelRootRef} className="pointer-events-auto flex items-start gap-3">
        <div className="relative min-h-[192px] w-[320px]">
          <SearchPanel isOpen={isPanelOpen("search")} />

          <UserPanel
            isOpen={isPanelOpen("user")}
            onToggleTheme={onToggleTheme}
            theme={theme}
          />

          <LayersPanel
            activeLayers={activeLayers}
            isOpen={isPanelOpen("layers")}
            onToggleLayer={onToggleLayer}
          />

          <GeofencePanel isOpen={isPanelOpen("geofences")} {...geofencePanelProps} />
        </div>

        <div className="flex flex-col items-end gap-3">
          <OverlayRailButton
            isPressed={isPanelOpen("search")}
            onClick={() => togglePanel("search")}
            ariaLabel="Open search panel"
          >
            <SearchIcon />
          </OverlayRailButton>

          <OverlayRailButton
            isPressed={isPanelOpen("user")}
            onClick={() => togglePanel("user")}
            ariaLabel="Open user panel"
          >
            <UserIcon />
          </OverlayRailButton>

          <OverlayRailButton
            isPressed={isPanelOpen("layers")}
            onClick={() => togglePanel("layers")}
            ariaLabel="Open hazard layers"
          >
            <LayersIcon />
          </OverlayRailButton>

          <OverlayRailButton
            isPressed={isPanelOpen("geofences")}
            onClick={() => togglePanel("geofences")}
            ariaLabel="Open geofence panel"
          >
            <GeofenceIcon />
          </OverlayRailButton>
        </div>
      </div>
    </div>
  );
}
