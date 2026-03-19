import { GeoFenceCard } from "@/components/geofence-card";
import type { GeoFenceDto } from "@/lib/api";

type GeoFenceListProps = {
  geofences: GeoFenceDto[];
};

export function GeoFenceList({ geofences }: GeoFenceListProps) {
  if (geofences.length === 0) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-gray-600">
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