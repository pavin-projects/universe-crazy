import test from "node:test";
import assert from "node:assert/strict";
import { Vector3 } from "three";
import { segmentHitsSphere } from "../src/collision.js";

test("swept projectile hits a target crossed between frames", () => {
  const start = new Vector3(0, 0, 0);
  const end = new Vector3(10, 0, 0);
  assert.equal(segmentHitsSphere(start, end, new Vector3(5, 0.9, 0), 1), true);
  assert.equal(segmentHitsSphere(start, end, new Vector3(5, 1.1, 0), 1), false);
  assert.equal(segmentHitsSphere(start, end, new Vector3(12, 0, 0), 1), false);
  assert.equal(segmentHitsSphere(start, start, new Vector3(0.5, 0, 0), 1), true);
});
