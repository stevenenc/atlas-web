"use client";

import { atlasUi, cx } from "@/features/atlascope/config/theme";
import { GeoFenceList } from "@/features/geofences/geofence-list";
import { useGeoFencesQuery } from "@/features/geofences/use-geofence-data";

export function GeoFenceListPage() {
  const { data: geofences, errorMessage, isLoading } = useGeoFencesQuery();

  return (
    <main className={atlasUi.layout.pageMain}>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className={atlasUi.text.pageTitle}>GeoFences</h1>

        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={cx(atlasUi.page.card, "animate-pulse space-y-3")}
              >
                <div className="h-5 w-40 rounded bg-atlas-card-border/70" />
                <div className="h-4 w-56 rounded bg-atlas-card-border/50" />
                <div className="h-4 w-36 rounded bg-atlas-card-border/50" />
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className={cx(atlasUi.page.card, "space-y-3")}>
            <p className={atlasUi.text.heading}>Geofence feed unavailable</p>
            <p className={atlasUi.text.body}>{errorMessage}</p>
            <p className={atlasUi.text.meta}>
              The frontend is using its first-party API boundary, but the upstream backend is not
              reachable from this environment.
            </p>
          </div>
        ) : (
          <GeoFenceList geofences={geofences ?? []} />
        )}
      </div>
    </main>
  );
}
