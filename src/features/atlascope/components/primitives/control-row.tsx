import type { ComponentProps, ReactNode } from "react";

import { atlasUi, cx } from "@/features/atlascope/config/theme";

type ControlRowProps = Omit<ComponentProps<"button">, "children"> & {
  control: ReactNode;
  detail: string;
  label: string;
};

export function ControlRow({
  className,
  control,
  detail,
  label,
  type = "button",
  ...props
}: ControlRowProps) {
  return (
    <button
      type={type}
      className={cx(
        "flex min-h-[88px] w-full items-center justify-between gap-4 px-4 py-3 text-left",
        atlasUi.surfaces.interactiveCard,
        atlasUi.surfaces.interactiveCardHover,
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <p className={atlasUi.text.label}>{label}</p>
        <p className={cx("mt-1", atlasUi.text.meta)}>{detail}</p>
      </div>
      <div className="shrink-0">{control}</div>
    </button>
  );
}
