import type { Incident } from "@/features/atlascope/types/atlascope";

export const incidents: Incident[] = [
  {
    id: "eq-manila-trench",
    type: "earthquake",
    locationName: "Manila Trench",
    severity: "High",
    timestamp: "12 minutes ago",
    startTime: "2026-03-20T05:10:00+08:00",
    endTime: "2026-03-20T08:00:00+08:00",
    coordinates: {
      longitude: 120.42,
      latitude: 14.09,
    },
    whyThisAlert:
      "Seismic activity exceeded the regional baseline and was detected near a high-population coastal corridor.",
  },
  {
    id: "wf-palawan-range",
    type: "wildfire",
    locationName: "Palawan Range",
    severity: "Critical",
    timestamp: "4 minutes ago",
    startTime: "2026-03-20T05:45:00+08:00",
    endTime: "2026-03-20T09:35:00+08:00",
    coordinates: {
      longitude: 118.54,
      latitude: 9.78,
    },
    whyThisAlert:
      "Heat signatures intensified over the last hour with wind conditions favoring rapid spread toward nearby communities.",
  },
  {
    id: "aq-metro-cebu",
    type: "air_quality",
    locationName: "Metro Cebu",
    severity: "Moderate",
    timestamp: "27 minutes ago",
    startTime: "2026-03-20T06:20:00+08:00",
    endTime: "2026-03-20T10:25:00+08:00",
    coordinates: {
      longitude: 123.89,
      latitude: 10.32,
    },
    whyThisAlert:
      "Particulate concentrations moved above healthy thresholds and are trending upward based on recent forecast conditions.",
  },
  {
    id: "eq-davao-gulf",
    type: "earthquake",
    locationName: "Davao Gulf",
    severity: "Moderate",
    timestamp: "41 minutes ago",
    startTime: "2026-03-20T07:15:00+08:00",
    endTime: "2026-03-20T11:10:00+08:00",
    coordinates: {
      longitude: 125.65,
      latitude: 6.71,
    },
    whyThisAlert:
      "A localized tremor cluster was detected in an active fault zone with moderate exposure to surrounding infrastructure.",
  },
  {
    id: "wf-sierra-madre",
    type: "wildfire",
    locationName: "Sierra Madre",
    severity: "High",
    timestamp: "9 minutes ago",
    startTime: "2026-03-20T08:05:00+08:00",
    endTime: "2026-03-20T12:05:00+08:00",
    coordinates: {
      longitude: 121.52,
      latitude: 16.42,
    },
    whyThisAlert:
      "Dry vegetation and elevated thermal readings indicate an expanding burn area along the ridge line.",
  },
  {
    id: "aq-iloilo-strait",
    type: "air_quality",
    locationName: "Iloilo Strait",
    severity: "High",
    timestamp: "18 minutes ago",
    startTime: "2026-03-20T09:00:00+08:00",
    endTime: "2026-03-20T12:40:00+08:00",
    coordinates: {
      longitude: 122.56,
      latitude: 10.71,
    },
    whyThisAlert:
      "Marine inversion conditions and port emissions pushed air quality into an elevated risk band through the central channel.",
  },
];
