export function readFlightInput(keys, virtualKeys) {
  const pressed = (...codes) => codes.some((code) => keys.has(code) || virtualKeys.has(code));
  return {
    turn: Number(pressed("KeyA", "ArrowLeft")) - Number(pressed("KeyD", "ArrowRight")),
    pitch: Number(pressed("KeyR")) - Number(pressed("KeyF")),
    forward: Number(pressed("KeyW", "ArrowUp")) - Number(pressed("KeyS", "ArrowDown")) * 0.5,
    strafe: Number(pressed("KeyE")) - Number(pressed("KeyQ")),
    rise: Number(pressed("Space")) - Number(pressed("KeyC", "ControlRight")),
    boosting: pressed("ShiftLeft", "ShiftRight", "KeyK"),
    firing: pressed("KeyJ")
  };
}
