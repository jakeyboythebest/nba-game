export class GameLoop {
  constructor(update, render) {
    this.updateFn = update;
    this.renderFn = render;
    this.last = performance.now();
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.#tick.bind(this));
  }

  #tick(now) {
    if (!this.running) return;
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.updateFn(dt);
    this.renderFn();
    requestAnimationFrame(this.#tick.bind(this));
  }
}
