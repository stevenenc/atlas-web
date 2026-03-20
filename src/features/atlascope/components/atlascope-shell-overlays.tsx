import type { ComponentProps, ReactNode, RefObject } from "react";

import { atlasUi, cx, layerRows, type ThemeMode } from "@/features/atlascope/config/theme";
import type { IncidentType } from "@/features/atlascope/types/atlascope";

import { GeofencePanel } from "./geofence-panel";
import { BasePanel, PanelHeader } from "./panel-system";

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
          <BasePanel
            isOpen={isPanelOpen("search")}
            ariaLabel="Search panel"
            variant="compact"
            widthClassName="w-[272px]"
          >
            <PanelHeader eyebrow="Search" />

            <div className={cx("mt-5 flex w-full items-center gap-3 px-4 py-3", atlasUi.surfaces.card)}>
              <div className="flex size-5 items-center justify-center text-atlas-muted">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search region or hazard"
                className="w-full bg-transparent text-sm text-atlas-ink outline-none placeholder:text-atlas-soft"
              />
            </div>
          </BasePanel>

          <BasePanel isOpen={isPanelOpen("user")} ariaLabel="User panel">
            <Section title="User">
              <ControlRow
                label="Steven Encarnacion"
                detail="Premium account"
                control={<span className={atlasUi.chips.avatar}>SE</span>}
              />
            </Section>

            <Section title="Utilities" className="mt-5">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className={atlasUi.buttons.utility}>
                  <span className={atlasUi.chips.icon}>
                    <ToolIcon />
                  </span>
                  <span className={atlasUi.text.controlLabel}>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={onToggleTheme}
                  className={atlasUi.buttons.utilityStart}
                >
                  <span className={atlasUi.chips.icon}>
                    {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                  </span>
                  <span className={atlasUi.text.controlLabel}>{theme}</span>
                </button>
              </div>
            </Section>
          </BasePanel>

          <BasePanel isOpen={isPanelOpen("layers")} ariaLabel="Layers panel">
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

function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <p className={cx("px-1", atlasUi.text.eyebrow)}>{title}</p>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function ControlRow({
  label,
  detail,
  control,
  onClick,
}: {
  label: string;
  detail: string;
  control: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex min-h-[88px] w-full items-center justify-between gap-4 px-4 py-3 text-left",
        atlasUi.surfaces.interactiveCard,
        atlasUi.surfaces.interactiveCardHover,
      )}
    >
      <div className="min-w-0">
        <p className={atlasUi.text.label}>{label}</p>
        <p className={cx("mt-1", atlasUi.text.meta)}>{detail}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </button>
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
            className="absolute left-0.5 top-0.5 size-5 rounded-full transform-gpu atlas-transition-quick"
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

function OverlayRailButton({
  isPressed,
  onClick,
  ariaLabel,
  children,
}: {
  isPressed: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex size-12 items-center justify-center outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0",
        atlasUi.surfaces.rail,
        isPressed &&
          "border-atlas-rail-active-border bg-atlas-rail-active text-atlas-ink shadow-atlas-rail-active",
      )}
      aria-label={ariaLabel}
      aria-pressed={isPressed}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current">
      <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" strokeWidth="1.9" />
      <path
        d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current">
      <path
        d="m12 5 7 3.5-7 3.5-7-3.5L12 5Zm7 7-7 3.5L5 12m14 4-7 3.5L5 16"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GeofenceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current">
      <path
        d="M12 20.25c-.53 0-1-.24-1.31-.68l-3.74-5.4A7.4 7.4 0 0 1 5.7 10.05C5.7 6.14 8.52 3.3 12 3.3s6.3 2.84 6.3 6.75c0 1.53-.45 2.95-1.25 4.12l-3.74 5.4c-.31.44-.78.68-1.31.68Z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.2" r="2.7" strokeWidth="1.8" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <path
        d="M14.5 6.5a4 4 0 0 0-5.4 4.9L4 16.5V20h3.6l5.1-5.1a4 4 0 0 0 4.9-5.4l-2.7 2.7-2.1-.4-.4-2.1 2.7-2.7Z"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.5A9 9 0 0 1 14.5 3.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current">
      <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
      <path
        d="M12 2.75v2.5m0 13.5v2.5m9.25-9.25h-2.5M5.25 12h-2.5m15.29-6.29-1.77 1.77M7.48 16.52l-1.77 1.77m12.06 0-1.77-1.77M7.48 7.48 5.71 5.71"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
