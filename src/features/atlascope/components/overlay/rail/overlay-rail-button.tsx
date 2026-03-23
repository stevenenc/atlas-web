import type { ComponentProps, ReactNode } from "react";

import { atlasUi, cx } from "@/features/atlascope/config/theme";

type OverlayRailButtonProps = Omit<
  ComponentProps<"button">,
  "aria-label" | "aria-pressed" | "children"
> & {
  ariaLabel: string;
  children: ReactNode;
  isPressed: boolean;
};

export function OverlayRailButton({
  ariaLabel,
  children,
  className,
  isPressed,
  type = "button",
  ...props
}: OverlayRailButtonProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      aria-pressed={isPressed}
      className={cx(
        "flex size-12 items-center justify-center outline-none ring-0 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 hover:border-atlas-rail-active-border hover:bg-atlas-rail-hover hover:text-atlas-ink",
        atlasUi.surfaces.rail,
        isPressed &&
          "border-atlas-rail-active-border bg-atlas-rail-hover text-atlas-ink shadow-atlas-rail-active",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
