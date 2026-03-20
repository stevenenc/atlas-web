import { getGeoFenceById } from "@/lib/api";
import { atlasUi, cx } from "@/features/atlascope/config/theme";

type GeoFenceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GeoFenceDetailPage({
  params,
}: GeoFenceDetailPageProps) {
  const { id } = await params;
  const geofence = await getGeoFenceById(id);

  return (
    <main className={atlasUi.layout.pageMain}>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className={atlasUi.text.pageTitle}>{geofence.name}</h1>

        <div className={cx(atlasUi.page.card, "space-y-2")}>
          <p>
            <span className="font-semibold">ID:</span> {geofence.id}
          </p>
          <p>
            <span className="font-semibold">User ID:</span> {geofence.userId}
          </p>
          <p>
            <span className="font-semibold">Updated:</span>{" "}
            {geofence.updatedAtUtc}
          </p>
        </div>

        <div className={atlasUi.page.card}>
          <h2 className={cx("mb-3 text-xl font-semibold", atlasUi.text.heading)}>
            Geometry JSON
          </h2>
          <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-atlas-muted">
            {geofence.geometryJson}
          </pre>
        </div>
      </div>
    </main>
  );
}
