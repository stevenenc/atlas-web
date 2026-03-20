import type { ReactNode } from "react";

import { atlasUi, cx, type ThemeMode } from "@/features/atlascope/config/theme";

import { MoonIcon, SunIcon, ToolIcon } from "./atlascope-icons";
import { BasePanel } from "./panel-system";

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

function PanelSection({
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
