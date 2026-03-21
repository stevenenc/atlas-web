import { atlasUi } from "@/features/atlascope/config/theme";

import { CloseIcon } from "./geofence-icons";

type GeofenceDrawingCalloutProps = {
  drawingPointCount: number;
  onCancelDrawing: () => void;
};

export function GeofenceDrawingCallout({
  drawingPointCount,
  onCancelDrawing,
}: GeofenceDrawingCalloutProps) {
  return (
    <div
      className="atlas-primary-callout mt-3 flex min-h-[64px] w-full items-center justify-between rounded-atlas-card border px-4 py-3 text-sm text-atlas-ink"
    >
      <div className="min-w-0 text-left">
        <p className={atlasUi.text.primaryDetail}>Geofence Drawing</p>
        <p className="mt-1 text-xs font-semibold text-atlas-muted">
          {drawingPointCount} point{drawingPointCount === 1 ? "" : "s"} placed
        </p>
      </div>
      <div className="ml-3 flex shrink-0">
        <button
          type="button"
          onClick={onCancelDrawing}
          aria-label="Cancel geofence drawing"
          className="flex size-7 items-center justify-center text-atlas-muted atlas-transition-surface hover:text-[#E15B64]"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
