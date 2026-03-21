import { atlasUi, cx } from "@/features/atlascope/config/theme";

type PanelMetricProps = {
  label: string;
  value: string;
};

export function PanelMetric({ label, value }: PanelMetricProps) {
  return (
    <div className={cx("px-3 py-3", atlasUi.surfaces.card)}>
      <p className={atlasUi.text.detailEyebrow}>{label}</p>
      <p className={cx("mt-2", atlasUi.text.heading)}>{value}</p>
    </div>
  );
}
