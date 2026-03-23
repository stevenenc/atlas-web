"use client";

import { atlasUi, cx } from "@/features/atlascope/config/theme";
import { useGeoFenceQuery } from "@/features/geofences/use-geofence-data";

type GeoFenceDetailPageClientProps = {
  id: string;
};

export function GeoFenceDetailPageClient({
  id,
}: GeoFenceDetailPageClientProps) {
  const { data: geofence, errorMessage, isLoading } = useGeoFenceQuery(id);
  const isNotFound = errorMessage?.toLowerCase().includes("404") ?? false;

  return (
    <main className={atlasUi.layout.pageMain}>
      <div className="mx-auto max-w-3xl space-y-6">
        {isLoading ? (
          <>
            <div className="h-10 w-64 animate-pulse rounded bg-atlas-card-border/60" />
            <div className={cx(atlasUi.page.card, "animate-pulse space-y-3")}>
              <div className="h-4 w-48 rounded bg-atlas-card-border/60" />
              <div className="h-4 w-56 rounded bg-atlas-card-border/50" />
              <div className="h-4 w-40 rounded bg-atlas-card-border/50" />
            </div>
          </>
        ) : errorMessage ? (
          <div className={cx(atlasUi.page.card, "space-y-3")}>
            <h1 className={atlasUi.text.pageTitle}>
              {isNotFound ? "Geofence not found" : "Geofence unavailable"}
            </h1>
            <p className={atlasUi.text.body}>{errorMessage}</p>
            <p className={atlasUi.text.meta}>
              {isNotFound
                ? "The requested geofence does not exist in the upstream service."
                : "The first-party frontend boundary is reachable, but the upstream backend did not return a usable result."}
            </p>
          </div>
        ) : geofence ? (
          <>
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
          </>
        ) : null}
      </div>
    </main>
  );
}
