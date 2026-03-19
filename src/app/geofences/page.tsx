import { getGeoFences } from "@/lib/api";
import { GeoFenceList } from "@/features/geofences/geofence-list";

export default async function GeoFencesPage() {
  const geofences = await getGeoFences();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold">GeoFences</h1>
        <GeoFenceList geofences={geofences} />
      </div>
    </main>
  );
}