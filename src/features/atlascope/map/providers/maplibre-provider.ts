import type { GeoJSON } from "geojson";
import type { GeoJSONSource, Map as MapLibreMapInstance } from "maplibre-gl";

import type {
  MapFeatureState,
  MapFeatureTarget,
  MapLayerDefinition,
  MapLayerStyleUpdate,
  MapSourceDefinition,
  MapStyleDefinition,
  VectorMapProvider,
} from "@/features/atlascope/map/core/provider";

type MapLibreProviderState = {
  activeStyleSignature: string | null;
};

export function createMapLibreProvider(map: MapLibreMapInstance): VectorMapProvider {
  const state: MapLibreProviderState = {
    activeStyleSignature: null,
  };

  return {
    providerId: "maplibre",
    initializeMap(_container, options) {
      if (options?.style) {
        this.updateStyle(options.style);
      }
    },
    addSource(sourceId, source) {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, source as Parameters<MapLibreMapInstance["addSource"]>[1]);
      }
    },
    addLayer(layer, beforeId) {
      if (!map.getLayer(layer.id)) {
        map.addLayer(
          layer as Parameters<MapLibreMapInstance["addLayer"]>[0],
          beforeId,
        );
      }
    },
    setLayerVisibility(layerId, visible) {
      if (!map.getLayer(layerId)) {
        return;
      }

      map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
    },
    updateLayerStyle(layerId, style) {
      if (!map.getLayer(layerId)) {
        return;
      }

      const currentVisibility = map.getLayoutProperty(layerId, "visibility");
      const nextVisibility = style.layout?.visibility;

      // Focus-profile layers toggle between `none` and `visible` while their
      // filters also repartition features. Apply the narrower filter before
      // showing a layer, and hide before broadening it back out.
      if (currentVisibility === "none" && nextVisibility === "visible") {
        applyLayerDefinitionUpdate(map, layerId, style);
        applyLayoutUpdate(map, layerId, style);
        applyPaintUpdate(map, layerId, style);
        return;
      }

      if (currentVisibility !== "none" && nextVisibility === "none") {
        applyLayoutUpdate(map, layerId, style);
        applyPaintUpdate(map, layerId, style);
        applyLayerDefinitionUpdate(map, layerId, style);
        return;
      }

      applyLayoutUpdate(map, layerId, style);
      applyPaintUpdate(map, layerId, style);
      applyLayerDefinitionUpdate(map, layerId, style);
    },
    updateStyle(style) {
      const nextStyleSignature = getStyleSignature(style);

      if (state.activeStyleSignature === nextStyleSignature) {
        return;
      }

      state.activeStyleSignature = nextStyleSignature;
      map.setStyle(style as Parameters<MapLibreMapInstance["setStyle"]>[0], {
        diff: true,
      });
    },
    destroy() {
      state.activeStyleSignature = null;
    },
    hasLayer(layerId) {
      return Boolean(map.getLayer(layerId));
    },
    hasSource(sourceId) {
      return Boolean(map.getSource(sourceId));
    },
    setGeoJsonSourceData(sourceId, data) {
      const source = map.getSource(sourceId) as GeoJSONSource | undefined;

      source?.setData(data);
    },
    setFeatureState(target, state) {
      map.setFeatureState(
        target as Parameters<MapLibreMapInstance["setFeatureState"]>[0],
        state as Parameters<MapLibreMapInstance["setFeatureState"]>[1],
      );
    },
    removeFeatureState(target, key) {
      map.removeFeatureState(
        target as Parameters<MapLibreMapInstance["removeFeatureState"]>[0],
        key,
      );
    },
  };
}

function applyLayoutUpdate(
  map: MapLibreMapInstance,
  layerId: string,
  style: MapLayerStyleUpdate,
) {
  if (!style.layout) {
    return;
  }

  Object.entries(style.layout).forEach(([property, value]) => {
    map.setLayoutProperty(layerId, property, value);
  });
}

function applyPaintUpdate(
  map: MapLibreMapInstance,
  layerId: string,
  style: MapLayerStyleUpdate,
) {
  if (!style.paint) {
    return;
  }

  Object.entries(style.paint).forEach(([property, value]) => {
    map.setPaintProperty(layerId, property, value);
  });
}

function applyLayerDefinitionUpdate(
  map: MapLibreMapInstance,
  layerId: string,
  style: MapLayerStyleUpdate,
) {
  const mapStyle = map.getStyle() as MapStyleDefinition | undefined;
  const targetLayer = mapStyle?.layers?.find((layer) => layer.id === layerId);

  if (!targetLayer) {
    return;
  }

  if (style.filter !== undefined || targetLayer.filter !== undefined) {
    map.setFilter(
      layerId,
      (style.filter ?? null) as Parameters<MapLibreMapInstance["setFilter"]>[1],
    );
  }

  if (style.minzoom !== undefined) {
    targetLayer.minzoom = style.minzoom;
  }

  if (style.maxzoom !== undefined) {
    targetLayer.maxzoom = style.maxzoom;
  }

  if (style.minzoom !== undefined || style.maxzoom !== undefined) {
    map.setLayerZoomRange(
      layerId,
      style.minzoom ?? targetLayer.minzoom ?? 0,
      style.maxzoom ?? targetLayer.maxzoom ?? 24,
    );
  }
}

function getStyleSignature(style: string | MapStyleDefinition) {
  return typeof style === "string" ? style : JSON.stringify(style);
}

export type {
  GeoJSON,
  MapFeatureState,
  MapFeatureTarget,
  MapLayerDefinition,
  MapSourceDefinition,
  MapStyleDefinition,
};
