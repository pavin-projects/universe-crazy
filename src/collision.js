export function segmentSphereHitTime(start, end, center, radius) {
  const dx = end.x - start.x, dy = end.y - start.y, dz = end.z - start.z;
  const ox = start.x - center.x, oy = start.y - center.y, oz = start.z - center.z;
  const c = ox * ox + oy * oy + oz * oz - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy + dz * dz;
  if (a === 0) return null;
  const b = ox * dx + oy * dy + oz * dz;
  const discriminant = b * b - a * c;
  if (discriminant < 0) return null;
  const time = (-b - Math.sqrt(discriminant)) / a;
  return time >= 0 && time <= 1 ? time : null;
}

export function segmentHitsSphere(start, end, center, radius) {
  return segmentSphereHitTime(start, end, center, radius) !== null;
}

export function segmentCrossesGate(start, end, center, normal, radius) {
  const startSide = (start.x - center.x) * normal.x + (start.y - center.y) * normal.y + (start.z - center.z) * normal.z;
  const endSide = (end.x - center.x) * normal.x + (end.y - center.y) * normal.y + (end.z - center.z) * normal.z;
  if ((startSide < 0 && endSide < 0) || (startSide > 0 && endSide > 0) || startSide === endSide) return false;
  const t = startSide / (startSide - endSide);
  const x = start.x + (end.x - start.x) * t - center.x;
  const y = start.y + (end.y - start.y) * t - center.y;
  const z = start.z + (end.z - start.z) * t - center.z;
  return x * x + y * y + z * z <= radius * radius;
}
