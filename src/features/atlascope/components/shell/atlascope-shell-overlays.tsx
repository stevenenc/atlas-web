import type { ComponentProps, RefObject } from "react";

import {
  BellIcon,
  GeofenceIcon,
  LayersIcon,
  SearchIcon,
  ToolIcon,
  UserIcon,
} from "@/features/atlascope/components/icons/atlascope-icons";
import { OverlayRailButton } from "@/features/atlascope/components/overlay/rail/overlay-rail-button";
import { GeofencePanel } from "@/features/atlascope/components/panels/geofence/geofence-panel";
import { LayersPanel } from "@/features/atlascope/components/panels/layers/layers-panel";
import { NotificationPanel } from "@/features/atlascope/components/panels/notification/notification-panel";
import { SearchPanel } from "@/features/atlascope/components/panels/search/search-panel";
import { SettingsPanel } from "@/features/atlascope/components/panels/settings/settings-panel";
import { UserPanel } from "@/features/atlascope/components/panels/user/user-panel";
import { type ThemeMode } from "@/features/atlascope/config/theme";
import type { IncidentType } from "@/features/atlascope/types/atlascope";

export type OverlayPanelId =
  | "search"
  | "user"
  | "notifications"
  | "settings"
  | "layers"
  | "geofences";

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

          <UserPanel isOpen={isPanelOpen("user")} />

          <LayersPanel
            activeLayers={activeLayers}
            isOpen={isPanelOpen("layers")}
            onToggleLayer={onToggleLayer}
          />

          <GeofencePanel isOpen={isPanelOpen("geofences")} {...geofencePanelProps} />

          <NotificationPanel isOpen={isPanelOpen("notifications")} />

          <SettingsPanel
            isOpen={isPanelOpen("settings")}
            onToggleTheme={onToggleTheme}
            theme={theme}
          />
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

          <OverlayRailButton
            isPressed={isPanelOpen("notifications")}
            onClick={() => togglePanel("notifications")}
            ariaLabel="Open notifications panel"
          >
            <BellIcon />
          </OverlayRailButton>

          <OverlayRailButton
            isPressed={isPanelOpen("settings")}
            onClick={() => togglePanel("settings")}
            ariaLabel="Open settings panel"
          >
            <ToolIcon />
          </OverlayRailButton>
        </div>
      </div>
    </div>
  );
}
