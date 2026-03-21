import type { MapCoordinates } from "@/features/atlascope/map/core/types";

const POINT_EPSILON = 1e-6;
const POLYGON_AREA_EPSILON = 1e-10;

type Segment = {
  start: MapCoordinates;
  end: MapCoordinates;
};

export function distanceBetweenPoints(first: MapCoordinates, second: MapCoordinates) {
  return Math.hypot(first.longitude - second.longitude, first.latitude - second.latitude);
}

export function isPointNearPoint(
  first: MapCoordinates,
  second: MapCoordinates,
  threshold = POINT_EPSILON,
) {
  return distanceBetweenPoints(first, second) <= threshold;
}

export function buildPolygonPath(points: MapCoordinates[]) {
  if (!points.length) {
    return [];
  }

  return [...points, points[0] as MapCoordinates];
}

export function segmentsIntersect(
  firstStart: MapCoordinates,
  firstEnd: MapCoordinates,
  secondStart: MapCoordinates,
  secondEnd: MapCoordinates,
) {
  const firstOrientation = getOrientation(firstStart, firstEnd, secondStart);
  const secondOrientation = getOrientation(firstStart, firstEnd, secondEnd);
  const thirdOrientation = getOrientation(secondStart, secondEnd, firstStart);
  const fourthOrientation = getOrientation(secondStart, secondEnd, firstEnd);

  if (
    firstOrientation !== secondOrientation &&
    thirdOrientation !== fourthOrientation
  ) {
    return true;
  }

  if (
    firstOrientation === 0 &&
    isPointOnSegment(firstStart, secondStart, firstEnd)
  ) {
    return true;
  }

  if (
    secondOrientation === 0 &&
    isPointOnSegment(firstStart, secondEnd, firstEnd)
  ) {
    return true;
  }

  if (
    thirdOrientation === 0 &&
    isPointOnSegment(secondStart, firstStart, secondEnd)
  ) {
    return true;
  }

  if (
    fourthOrientation === 0 &&
    isPointOnSegment(secondStart, firstEnd, secondEnd)
  ) {
    return true;
  }

  return false;
}

export function wouldCreateSelfIntersection(
  points: MapCoordinates[],
  nextPoint: MapCoordinates,
) {
  if (points.length < 2) {
    return false;
  }

  return !isValidOpenGeofencePath([...points, nextPoint]);
}

export function isValidNextPoint(
  points: MapCoordinates[],
  nextPoint: MapCoordinates,
) {
  if (!points.length) {
    return true;
  }

  if (points.some((point) => isPointNearPoint(point, nextPoint))) {
    return false;
  }

  return !wouldCreateSelfIntersection(points, nextPoint);
}

export function canCloseFromPoint(points: MapCoordinates[]) {
  if (!isValidOpenGeofencePath(points)) {
    return false;
  }

  if (getDistinctPointCount(points) < 3) {
    return false;
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (!firstPoint || !lastPoint || isPointNearPoint(firstPoint, lastPoint)) {
    return false;
  }

  const segments = buildSegments(points);
  const closingSegment: Segment = {
    start: lastPoint,
    end: firstPoint,
  };

  for (let segmentIndex = 1; segmentIndex < segments.length - 1; segmentIndex += 1) {
    if (segmentsIntersect(
      closingSegment.start,
      closingSegment.end,
      segments[segmentIndex]!.start,
      segments[segmentIndex]!.end,
    )) {
      return false;
    }
  }

  return Math.abs(getPolygonArea(points)) > POLYGON_AREA_EPSILON;
}

export function isValidOpenGeofencePath(points: MapCoordinates[]) {
  if (points.length <= 1) {
    return true;
  }

  for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
    const point = points[pointIndex];

    if (!point) {
      return false;
    }

    for (let compareIndex = pointIndex + 1; compareIndex < points.length; compareIndex += 1) {
      const comparePoint = points[compareIndex];

      if (!comparePoint) {
        return false;
      }

      if (isPointNearPoint(point, comparePoint)) {
        return false;
      }
    }
  }

  const segments = buildSegments(points);

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const segment = segments[segmentIndex];

    if (!segment || isPointNearPoint(segment.start, segment.end)) {
      return false;
    }

    for (
      let compareIndex = segmentIndex + 1;
      compareIndex < segments.length;
      compareIndex += 1
    ) {
      if (compareIndex === segmentIndex + 1) {
        continue;
      }

      const compareSegment = segments[compareIndex];

      if (
        compareSegment &&
        segmentsIntersect(
          segment.start,
          segment.end,
          compareSegment.start,
          compareSegment.end,
        )
      ) {
        return false;
      }
    }
  }

  return true;
}

function buildSegments(points: MapCoordinates[]) {
  const segments: Segment[] = [];

  for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
    const start = points[pointIndex];
    const end = points[pointIndex + 1];

    if (!start || !end) {
      continue;
    }

    segments.push({ start, end });
  }

  return segments;
}

function getDistinctPointCount(points: MapCoordinates[]) {
  const distinctPoints: MapCoordinates[] = [];

  points.forEach((point) => {
    if (!distinctPoints.some((item) => isPointNearPoint(item, point))) {
      distinctPoints.push(point);
    }
  });

  return distinctPoints.length;
}

function getOrientation(
  first: MapCoordinates,
  second: MapCoordinates,
  third: MapCoordinates,
) {
  const crossProduct =
    (second.latitude - first.latitude) * (third.longitude - second.longitude) -
    (second.longitude - first.longitude) * (third.latitude - second.latitude);

  if (Math.abs(crossProduct) <= POINT_EPSILON) {
    return 0;
  }

  return crossProduct > 0 ? 1 : 2;
}

function isPointOnSegment(
  start: MapCoordinates,
  point: MapCoordinates,
  end: MapCoordinates,
) {
  return (
    point.longitude <= Math.max(start.longitude, end.longitude) + POINT_EPSILON &&
    point.longitude >= Math.min(start.longitude, end.longitude) - POINT_EPSILON &&
    point.latitude <= Math.max(start.latitude, end.latitude) + POINT_EPSILON &&
    point.latitude >= Math.min(start.latitude, end.latitude) - POINT_EPSILON
  );
}

function getPolygonArea(points: MapCoordinates[]) {
  const polygonPath = buildPolygonPath(points);
  let area = 0;

  for (let pointIndex = 0; pointIndex < polygonPath.length - 1; pointIndex += 1) {
    const currentPoint = polygonPath[pointIndex];
    const nextPoint = polygonPath[pointIndex + 1];

    if (!currentPoint || !nextPoint) {
      continue;
    }

    area +=
      currentPoint.longitude * nextPoint.latitude -
      nextPoint.longitude * currentPoint.latitude;
  }

  return area / 2;
}
