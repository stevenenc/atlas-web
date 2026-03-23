import Link from "next/link";

import { atlasUi } from "@/features/atlascope/config/theme";

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
      href={`/geofences/${encodeURIComponent(id)}`}
      className={atlasUi.page.linkCard}
    >
      <div className="space-y-1">
        <h3 className={atlasUi.text.heading}>{name}</h3>
        <p className={atlasUi.text.muted}>ID: {id}</p>
        <p className={atlasUi.text.muted}>User: {userId}</p>
        <p className={atlasUi.text.muted}>Updated: {updatedAtUtc}</p>
      </div>
    </Link>
  );
}
