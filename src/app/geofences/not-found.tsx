import { atlasUi, cx } from "@/features/atlascope/config/theme";

export default function NotFound() {
  return (
    <main className={atlasUi.layout.pageMain}>
      <div className="mx-auto max-w-3xl">
        <div className={cx(atlasUi.page.card, "space-y-3")}>
          <p className={atlasUi.text.eyebrow}>GeoFences</p>
          <h1 className={atlasUi.text.pageTitle}>Geofence not found</h1>
          <p className={atlasUi.text.body}>
            The requested geofence could not be resolved by the frontend route.
          </p>
        </div>
      </div>
    </main>
  );
}
