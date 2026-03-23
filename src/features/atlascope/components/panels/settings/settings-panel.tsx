"use client";

import { useState } from "react";

import {
  MoonIcon,
  SunIcon,
} from "@/features/atlascope/components/icons/atlascope-icons";
import { BasePanel, PanelHeader } from "@/features/atlascope/components/overlay/panel/panel-system";
import { PanelSection } from "@/features/atlascope/components/primitives/panel-section";
import { atlasUi, cx, type ThemeMode } from "@/features/atlascope/config/theme";

import {
  SegmentedSetting,
  type SegmentedSettingOption,
} from "./segmented-setting";

type MapStyleOption = "light" | "dark" | "satellite";
type DetailLevelOption = "low" | "balanced" | "high";
type LabelDensityOption = "minimal" | "standard" | "dense";
type AnimationSpeedOption = "slow" | "normal" | "fast";

type MockMapSettings = {
  animationSpeed: AnimationSpeedOption;
  detailLevel: DetailLevelOption;
  labelDensity: LabelDensityOption;
  mapStyle: MapStyleOption;
};

const MAP_STYLE_OPTIONS = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Satellite", value: "satellite" },
] as const satisfies readonly SegmentedSettingOption<MapStyleOption>[];

const DETAIL_LEVEL_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Balanced", value: "balanced" },
  { label: "High", value: "high" },
] as const satisfies readonly SegmentedSettingOption<DetailLevelOption>[];

const LABEL_DENSITY_OPTIONS = [
  { label: "Minimal", value: "minimal" },
  { label: "Standard", value: "standard" },
  { label: "Dense", value: "dense" },
] as const satisfies readonly SegmentedSettingOption<LabelDensityOption>[];

const ANIMATION_SPEED_OPTIONS = [
  { label: "Slow", value: "slow" },
  { label: "Normal", value: "normal" },
  { label: "Fast", value: "fast" },
] as const satisfies readonly SegmentedSettingOption<AnimationSpeedOption>[];

const initialMockMapSettings: MockMapSettings = {
  animationSpeed: "normal",
  detailLevel: "balanced",
  labelDensity: "standard",
  mapStyle: "light",
};

type SettingsPanelProps = {
  isOpen: boolean;
  onToggleTheme: () => void;
  theme: ThemeMode;
};

export function SettingsPanel({
  isOpen,
  onToggleTheme,
  theme,
}: SettingsPanelProps) {
  const [mockMapSettings, setMockMapSettings] = useState(initialMockMapSettings);
  const isDarkTheme = theme === "dark";

  const updateMockSetting = <Key extends keyof MockMapSettings,>(
    key: Key,
    value: MockMapSettings[Key],
  ) => {
    setMockMapSettings((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <BasePanel isOpen={isOpen} ariaLabel="Settings panel">
      <PanelHeader eyebrow="Settings" />

      <div className="mt-5 space-y-5">
        <PanelSection title="Map Settings">
          <div className="space-y-4">
            <SegmentedSetting
              label="Map Style"
              helperText="Satellite is included here as a placeholder for future imagery support."
              options={MAP_STYLE_OPTIONS}
              selectedValue={mockMapSettings.mapStyle}
              onChange={(value) => updateMockSetting("mapStyle", value)}
            />

            <SegmentedSetting
              label="Detail Level"
              options={DETAIL_LEVEL_OPTIONS}
              selectedValue={mockMapSettings.detailLevel}
              onChange={(value) => updateMockSetting("detailLevel", value)}
            />

            <SegmentedSetting
              label="Label Density"
              options={LABEL_DENSITY_OPTIONS}
              selectedValue={mockMapSettings.labelDensity}
              onChange={(value) => updateMockSetting("labelDensity", value)}
            />

            <SegmentedSetting
              label="Animation Speed"
              options={ANIMATION_SPEED_OPTIONS}
              selectedValue={mockMapSettings.animationSpeed}
              onChange={(value) => updateMockSetting("animationSpeed", value)}
            />
          </div>
        </PanelSection>

        <PanelSection title="Interface">
          <button
            type="button"
            onClick={onToggleTheme}
            className={cx(
              "flex w-full items-center gap-3 px-4 py-3 text-left",
              atlasUi.surfaces.interactiveCard,
              atlasUi.surfaces.interactiveCardHover,
            )}
          >
            <span className={atlasUi.chips.icon}>
              {isDarkTheme ? <MoonIcon /> : <SunIcon />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={atlasUi.text.label}>Theme</span>
              <span className={cx("mt-1 block", atlasUi.text.meta)}>
                {isDarkTheme ? "Dark shell active" : "Light shell active"}
              </span>
            </span>
            <span className={atlasUi.text.controlLabel}>{theme.toUpperCase()}</span>
          </button>
        </PanelSection>
      </div>
    </BasePanel>
  );
}
