import {
  MoonIcon,
  SunIcon,
  ToolIcon,
} from "@/features/atlascope/components/icons/atlascope-icons";
import { BasePanel, PanelHeader } from "@/features/atlascope/components/overlay/panel/panel-system";
import { atlasUi, type ThemeMode } from "@/features/atlascope/config/theme";

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
  return (
    <BasePanel isOpen={isOpen} ariaLabel="Settings panel">
      <PanelHeader eyebrow="Settings" />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" className={atlasUi.buttons.utility}>
          <span className={atlasUi.chips.icon}>
            <ToolIcon />
          </span>
          <span className={atlasUi.text.controlLabel}>SETTINGS</span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className={atlasUi.buttons.utilityStart}
        >
          <span className={atlasUi.chips.icon}>
            {theme === "dark" ? <MoonIcon /> : <SunIcon />}
          </span>
          <span className={atlasUi.text.controlLabel}>{theme.toUpperCase()}</span>
        </button>
      </div>
    </BasePanel>
  );
}
