import Link from "next/link";

type GeoFenceCardProps = {
  id: string;
  name: string;
  userId: string;
  updatedAtUtc: string;
};

export function GeoFenceCard({
  id,
  name,
  userId,
  updatedAtUtc,
}: GeoFenceCardProps) {
  return (
    <Link
      href={`/geofences/${id}`}
      className="block rounded-2xl border p-4 hover:bg-gray-50"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-600">ID: {id}</p>
        <p className="text-sm text-gray-600">User: {userId}</p>
        <p className="text-sm text-gray-600">Updated: {updatedAtUtc}</p>
      </div>
    </Link>
  );
}