import { getGeoFenceById } from "@/lib/api";

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
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">{geofence.name}</h1>

        <div className="rounded-2xl border p-6 space-y-2">
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

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-3">Geometry JSON</h2>
          <pre className="overflow-x-auto text-sm whitespace-pre-wrap">
            {geofence.geometryJson}
          </pre>
        </div>
      </div>
    </main>
  );
}