"use client";

import { useEffect } from "react";

import { atlasUi, cx } from "@/features/atlascope/config/theme";

type GeofencesErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function Error({
  error,
  unstable_retry,
}: GeofencesErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={atlasUi.layout.pageMain}>
      <div className="mx-auto max-w-3xl">
        <div className={cx(atlasUi.page.card, "space-y-4")}>
          <div>
            <p className={atlasUi.text.eyebrow}>GeoFences</p>
            <h1 className={cx("mt-2", atlasUi.text.pageTitle)}>
              The route failed to render
            </h1>
          </div>

          <p className={atlasUi.text.body}>
            The geofence route hit an unexpected rendering error. Retry the segment to request a
            fresh response from the frontend boundary.
          </p>

          <button
            type="button"
            onClick={() => unstable_retry()}
            className={atlasUi.buttons.pagePrimary}
          >
            Retry route
          </button>
        </div>
      </div>
    </main>
  );
}
