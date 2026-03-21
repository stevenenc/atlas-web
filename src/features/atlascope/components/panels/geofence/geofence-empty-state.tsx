import { atlasUi, cx } from "@/features/atlascope/config/theme";

type GeofenceEmptyStateProps = {
  isDrawingGeofence: boolean;
  onAddGeofence: () => void;
};

export function GeofenceEmptyState({
  isDrawingGeofence,
  onAddGeofence,
}: GeofenceEmptyStateProps) {
  return (
    <div
      className={cx("mt-4 px-4 py-7 text-center", atlasUi.surfaces.card, "border-dashed")}
    >
      <p className={atlasUi.text.label}>No geofences yet</p>
      <button
        type="button"
        onClick={onAddGeofence}
        className={cx("mt-4", atlasUi.buttons.pagePrimary)}
      >
        <span className="text-base leading-none">+</span>
        <span>{isDrawingGeofence ? "Drawing Geofence" : "Create Geofence"}</span>
      </button>
    </div>
  );
}
