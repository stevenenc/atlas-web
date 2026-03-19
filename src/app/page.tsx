import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">Atlas</h1>
        <p className="text-sm text-gray-600">
          Frontend for the Scope GeoFence API
        </p>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Quick links</h2>
          <div className="mt-4">
            <Link
              href="/geofences"
              className="rounded-lg border px-4 py-2 inline-block"
            >
              View GeoFences
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}