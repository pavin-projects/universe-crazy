import test from "node:test";
import assert from "node:assert/strict";
import { readFlightInput } from "../src/flight.js";

test("flight responds to both joystick and button controls", () => {
  const input = readFlightInput(new Set(["Space", "KeyK", "KeyJ"]), new Set(["KeyA", "KeyW"]));
  assert.equal(input.turn, 1);
  assert.equal(input.forward, 1);
  assert.equal(input.rise, 1);
  assert.equal(input.boosting, true);
  assert.equal(input.firing, true);
  const reverse = readFlightInput(new Set(["ArrowDown", "ControlRight"]), new Set(["KeyD"]));
  assert.equal(reverse.turn, -1);
  assert.equal(reverse.forward, -0.5);
  assert.equal(reverse.rise, -1);
});
