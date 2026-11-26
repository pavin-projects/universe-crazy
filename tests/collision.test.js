import test from "node:test";
import assert from "node:assert/strict";
import { Vector3 } from "three";
import { segmentHitsSphere, segmentSphereHitTime, segmentCrossesGate } from "../src/collision.js";

test("swept projectile hits a target crossed between frames", () => {
  const start = new Vector3(0, 0, 0);
  const end = new Vector3(10, 0, 0);
  assert.equal(segmentHitsSphere(start, end, new Vector3(5, 0.9, 0), 1), true);
  assert.equal(segmentHitsSphere(start, end, new Vector3(5, 1.1, 0), 1), false);
  assert.equal(segmentHitsSphere(start, end, new Vector3(12, 0, 0), 1), false);
  assert.equal(segmentHitsSphere(start, start, new Vector3(0.5, 0, 0), 1), true);
  assert.equal(segmentSphereHitTime(start, end, new Vector3(3, 0, 0), 1), 0.2);
  assert.equal(segmentSphereHitTime(start, end, new Vector3(7, 0, 0), 1), 0.6);
  assert.equal(segmentSphereHitTime(start, start, new Vector3(2, 0, 0), 1), null);
});

test("gates trigger only when the ship crosses inside the opening", () => {
  const center = new Vector3(0, 0, 0);
  const normal = new Vector3(0, 0, 1);
  assert.equal(segmentCrossesGate(new Vector3(1, 0, -3), new Vector3(1, 0, 3), center, normal, 2), true);
  assert.equal(segmentCrossesGate(new Vector3(3, 0, -3), new Vector3(3, 0, 3), center, normal, 2), false);
  assert.equal(segmentCrossesGate(new Vector3(0, 0, -3), new Vector3(1, 0, -1), center, normal, 2), false);
  assert.equal(segmentCrossesGate(new Vector3(0, 0, -1), center, center, normal, 2), true);
});
