export class ShotClock {
  constructor(ui, value = 24) {
    this.ui = ui;
    this.max = value;
    this.value = value;
    this.running = false;
  }

  start() { this.running = true; }
  stop() { this.running = false; }

  update(dt) {
    if (!this.running) return;
    this.value = Math.max(0, this.value - dt);
    this.ui.updateShotClock(this.value);
  }

  reset() {
    this.value = this.max;
    this.ui.updateShotClock(this.value);
  }
}
