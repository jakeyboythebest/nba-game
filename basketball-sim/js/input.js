export class InputController {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouse = { deltaX: 0, deltaY: 0, sensitivity: 0.0022 };
    this.shotHeld = 0;
    this.pointerLocked = false;
    this.#bind();
  }

  #bind() {
    window.addEventListener('keydown', (e) => this.keys.add(e.code));
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    this.canvas.addEventListener('click', () => this.canvas.requestPointerLock?.());
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.mouse.deltaX += e.movementX;
      this.mouse.deltaY += e.movementY;
    });
  }

  update(dt) {
    if (this.isDown('Space')) this.shotHeld = Math.min(1.2, this.shotHeld + dt);
  }

  consumeShotRelease() {
    if (!this.isDown('Space') && this.shotHeld > 0) {
      const held = this.shotHeld;
      this.shotHeld = 0;
      return held;
    }
    return null;
  }

  consumeMouseDelta() {
    const delta = { x: this.mouse.deltaX, y: this.mouse.deltaY };
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    return delta;
  }

  isDown(code) {
    return this.keys.has(code);
  }
}
