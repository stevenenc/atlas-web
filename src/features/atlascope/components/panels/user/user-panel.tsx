import { BasePanel } from "@/features/atlascope/components/overlay/panel/panel-system";
import { ControlRow } from "@/features/atlascope/components/primitives/control-row";
import { PanelSection } from "@/features/atlascope/components/primitives/panel-section";
import { atlasUi } from "@/features/atlascope/config/theme";

type UserPanelProps = {
  isOpen: boolean;
};

export function UserPanel({ isOpen }: UserPanelProps) {
  return (
    <BasePanel isOpen={isOpen} ariaLabel="User panel">
      <PanelSection title="User">
        <ControlRow
          label="Steven Encarnacion"
          detail="Premium account"
          control={<span className={atlasUi.chips.avatar}>SE</span>}
        />
      </PanelSection>
    </BasePanel>
  );
}
