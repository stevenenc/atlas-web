import type { FeatureCollection, Point } from "geojson";
import type { LayerProps } from "react-map-gl/maplibre";

import type { ThemeMode } from "@/features/atlascope/config/theme";

import type { HazardLayerType, MapMarkerData } from "../map-types";

type HazardFeatureProperties = {
  id: string;
  layerType: HazardLayerType;
  title: string;
};

const layerColors: Record<
  ThemeMode,
  Record<HazardLayerType, { glow: string; core: string }>
> = {
  dark: {
    earthquake: { glow: "rgba(249, 115, 22, 0.18)", core: "#F97316" },
    wildfire: { glow: "rgba(239, 68, 68, 0.18)", core: "#EF4444" },
    air_quality: { glow: "rgba(234, 179, 8, 0.18)", core: "#EAB308" },
  },
  light: {
    earthquake: { glow: "rgba(249, 115, 22, 0.12)", core: "#F97316" },
    wildfire: { glow: "rgba(239, 68, 68, 0.12)", core: "#EF4444" },
    air_quality: { glow: "rgba(234, 179, 8, 0.12)", core: "#EAB308" },
  },
};

export function createHazardSourceData(
  markers: MapMarkerData[],
): FeatureCollection<Point, HazardFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: markers.map((marker) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [marker.coordinates.longitude, marker.coordinates.latitude],
      },
      properties: {
        id: marker.id,
        layerType: marker.layerType,
        title: marker.title,
      },
    })),
  };
}

export function createHazardLayers(theme: ThemeMode): LayerProps[] {
  return (Object.keys(layerColors[theme]) as HazardLayerType[]).flatMap(
    (layerType) => {
      const palette = layerColors[theme][layerType];
      const filter: ["==", ["get", "layerType"], HazardLayerType] = [
        "==",
        ["get", "layerType"],
        layerType,
      ];

      return [
        {
          id: `${layerType}-glow`,
          type: "circle",
          filter,
          paint: {
            "circle-radius": 28,
            "circle-color": palette.glow,
            "circle-blur": 0.72,
          },
        },
        {
          id: `${layerType}-core`,
          type: "circle",
          filter,
          paint: {
            "circle-radius": 9,
            "circle-color": palette.core,
            "circle-stroke-width": 1.5,
            "circle-stroke-color":
              theme === "dark" ? "rgba(255,255,255,0.22)" : "rgba(43,37,28,0.12)",
          },
        },
      ];
    },
  );
}
