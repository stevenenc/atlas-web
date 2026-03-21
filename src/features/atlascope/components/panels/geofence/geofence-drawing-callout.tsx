import { atlasUi } from "@/features/atlascope/config/theme";

import { CheckIcon, CloseIcon } from "./geofence-icons";

type GeofenceDrawingCalloutProps = {
  drawingPointCount: number;
  canFinishDrawing: boolean;
  onCancelDrawing: () => void;
  onFinishDrawing: () => void;
};

export function GeofenceDrawingCallout({
  drawingPointCount,
  canFinishDrawing,
  onCancelDrawing,
  onFinishDrawing,
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
      <div className="ml-3 flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onCancelDrawing}
          aria-label="Cancel geofence drawing"
          className="flex size-7 items-center justify-center text-atlas-muted atlas-transition-surface hover:text-atlas-ink"
        >
          <CloseIcon />
        </button>
        <button
          type="button"
          onClick={onFinishDrawing}
          disabled={!canFinishDrawing}
          aria-label="Finish geofence drawing"
          className="flex size-7 items-center justify-center text-atlas-ink atlas-transition-surface hover:text-atlas-ink disabled:cursor-not-allowed disabled:text-atlas-disabled"
        >
          <CheckIcon />
        </button>
      </div>
    </div>
  );
}
