import type { ComponentProps, ReactNode } from "react";

import { atlasUi, cx } from "@/features/atlascope/config/theme";

type PanelSectionProps = ComponentProps<"section"> & {
  children: ReactNode;
  title: string;
};

export function PanelSection({
  children,
  className,
  title,
  ...props
}: PanelSectionProps) {
  return (
    <section className={className} {...props}>
      <p className={cx("px-1", atlasUi.text.eyebrow)}>{title}</p>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
