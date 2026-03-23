import { GeoFenceCard } from "@/shared/components/geofence-card";
import { atlasUi } from "@/features/atlascope/config/theme";
import type { GeoFenceDto } from "@/lib/geofences";

type GeoFenceListProps = {
  geofences: GeoFenceDto[];
};

export function GeoFenceList({ geofences }: GeoFenceListProps) {
  if (geofences.length === 0) {
    return (
      <div className={atlasUi.page.empty}>
        No geofences found.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {geofences.map((geofence) => (
        <GeoFenceCard
          key={geofence.id}
          id={geofence.id}
          name={geofence.name}
          userId={geofence.userId}
          updatedAtUtc={geofence.updatedAtUtc}
        />
      ))}
    </div>
  );
}
