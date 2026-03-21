import { MoonIcon, SunIcon, ToolIcon } from "@/features/atlascope/components/icons/atlascope-icons";
import { BasePanel } from "@/features/atlascope/components/overlay/panel/panel-system";
import { ControlRow } from "@/features/atlascope/components/primitives/control-row";
import { PanelSection } from "@/features/atlascope/components/primitives/panel-section";
import { atlasUi, type ThemeMode } from "@/features/atlascope/config/theme";

type UserPanelProps = {
  isOpen: boolean;
  onToggleTheme: () => void;
  theme: ThemeMode;
};

export function UserPanel({ isOpen, onToggleTheme, theme }: UserPanelProps) {
  return (
    <BasePanel isOpen={isOpen} ariaLabel="User panel">
      <PanelSection title="User">
        <ControlRow
          label="Steven Encarnacion"
          detail="Premium account"
          control={<span className={atlasUi.chips.avatar}>SE</span>}
        />
      </PanelSection>

      <PanelSection title="Utilities" className="mt-5">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={atlasUi.buttons.utility}>
            <span className={atlasUi.chips.icon}>
              <ToolIcon />
            </span>
            <span className={atlasUi.text.controlLabel}>Settings</span>
          </button>

          <button type="button" onClick={onToggleTheme} className={atlasUi.buttons.utilityStart}>
            <span className={atlasUi.chips.icon}>
              {theme === "dark" ? <MoonIcon /> : <SunIcon />}
            </span>
            <span className={atlasUi.text.controlLabel}>{theme}</span>
          </button>
        </div>
      </PanelSection>
    </BasePanel>
  );
}
