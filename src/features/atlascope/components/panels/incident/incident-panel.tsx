import {
  atlasTheme,
  atlasUi,
  cx,
  severityToneClasses,
} from "@/features/atlascope/config/theme";
import type { Incident } from "@/features/atlascope/types/atlascope";

import { PanelMetric } from "./panel-metric";

type IncidentPanelProps = {
  incident: Incident | null;
  isLoading: boolean;
  onClose: () => void;
};

export function IncidentPanel({
  incident,
  isLoading,
  onClose,
}: IncidentPanelProps) {
  return (
    <aside
      className={`${cx("w-[376px] p-5 text-atlas-ink", atlasUi.panels.detail, "atlas-transition-panel")} ${
        isLoading || incident
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      {isLoading ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
          <div className="size-11 animate-spin rounded-full border-2 border-atlas-card-border border-t-atlas-ink" />
          <div>
            <p className={atlasUi.text.label}>Pulling incident context</p>
            <p className={cx("mt-1", atlasUi.text.subtle)}>
              Rebuilding the mock event picture for review
            </p>
          </div>
        </div>
      ) : incident ? (
        <SelectedIncidentView incident={incident} onClose={onClose} />
      ) : null}
    </aside>
  );
}

function SelectedIncidentView({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  const severityStyle = atlasTheme.severity[incident.severity];

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={atlasUi.text.wideEyebrow}>Incident Workspace</p>
          <h2 className={cx("mt-2", atlasUi.text.title)}>{getIncidentHeading(incident)}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={atlasUi.buttons.smallGhost}
        >
          Clear
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span
          className={cx(
            "rounded-atlas-detail border px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase",
            severityToneClasses[incident.severity],
          )}
        >
          {incident.severity}
        </span>
        <span className={atlasUi.text.muted}>{incident.timestamp}</span>
      </div>

      <div className={cx("mt-5 p-4", atlasUi.surfaces.card)}>
        <p className={atlasUi.text.eyebrow}>Operational Summary</p>
        <p className={cx("mt-3", atlasUi.text.body)}>{incident.whyThisAlert}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PanelMetric label="Hazard" value={getIncidentLabel(incident)} />
        <PanelMetric label="Location" value={incident.locationName} />
      </div>

      <div className={cx("mt-4 p-4", atlasUi.surfaces.strongCard)}>
        <div className="flex items-center justify-between gap-3">
          <p className={atlasUi.text.eyebrow}>Detection Notes</p>
          <span
            className="inline-flex h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: severityStyle.accent,
              boxShadow: `0 0 14px ${severityStyle.accent}66`,
            }}
          />
        </div>
        <p className={cx("mt-3", atlasUi.text.body)}>
          AtlaScope ranks this event from hazard intensity, local exposure, and near-term escalation indicators in the surrounding area.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" className={atlasUi.buttons.solid}>
          Acknowledge Alert
        </button>
        <button type="button" className={atlasUi.buttons.outline}>
          Open Timeline
        </button>
      </div>
    </>
  );
}

function getIncidentHeading(incident: Incident) {
  if (incident.type === "air_quality") {
    return `Air Quality Alert in ${incident.locationName}`;
  }

  return incident.type === "earthquake"
    ? `Earthquake Alert in ${incident.locationName}`
    : `Wildfire Alert in ${incident.locationName}`;
}

function getIncidentLabel(incident: Incident) {
  if (incident.type === "air_quality") {
    return "Air Quality";
  }

  return incident.type === "earthquake" ? "Earthquake" : "Wildfire";
}
