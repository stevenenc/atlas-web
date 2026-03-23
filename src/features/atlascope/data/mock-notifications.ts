import type { AtlascopeNotification } from "@/features/atlascope/types/atlascope";

export const mockNotifications: AtlascopeNotification[] = [
  {
    id: "wildfire-brief",
    title: "Wildfire perimeter updated",
    detail: "Los Angeles County · 4 min ago",
    summary: "Containment moved to 48%. Evacuation corridors remain under review.",
  },
  {
    id: "air-quality-brief",
    title: "Air quality advisory refreshed",
    detail: "San Gabriel Valley · 16 min ago",
    summary: "PM2.5 levels remain elevated through the early evening window.",
  },
];
