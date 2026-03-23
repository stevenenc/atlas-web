import { GeoFenceDetailPageClient } from "@/features/geofences/geofence-detail-page";

type GeoFenceDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [];
}

export default async function GeoFenceDetailPage({
  params,
}: GeoFenceDetailPageProps) {
  const { id } = await params;

  return <GeoFenceDetailPageClient id={id} />;
}
