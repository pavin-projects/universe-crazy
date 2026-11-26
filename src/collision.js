import { Line3, Vector3 } from "three";

const segment = new Line3();
const closest = new Vector3();

export function segmentHitsSphere(start, end, center, radius) {
  if (start.distanceToSquared(end) === 0) return start.distanceToSquared(center) <= radius * radius;
  segment.set(start, end);
  segment.closestPointToPoint(center, true, closest);
  return closest.distanceToSquared(center) <= radius * radius;
}
