import { getGeoFences } from "@/lib/api";
import { atlasUi } from "@/features/atlascope/config/theme";
import { GeoFenceList } from "@/features/geofences/geofence-list";

export default async function GeoFencesPage() {
  const geofences = await getGeoFences();

  return (
    <main className={atlasUi.layout.pageMain}>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className={atlasUi.text.pageTitle}>GeoFences</h1>
        <GeoFenceList geofences={geofences} />
      </div>
    </main>
  );
}
