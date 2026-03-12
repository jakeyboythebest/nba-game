export class TimerSystem {
  constructor(ui, totalSeconds = 8 * 60) {
    this.ui = ui;
    this.totalSeconds = totalSeconds;
    this.remaining = totalSeconds;
    this.running = false;
  }

  start() { this.running = true; }
  stop() { this.running = false; }

  update(dt) {
    if (!this.running) return;
    this.remaining = Math.max(0, this.remaining - dt);
    this.ui.updateGameTimer(this.remaining);
  }

  reset() {
    this.remaining = this.totalSeconds;
    this.ui.updateGameTimer(this.remaining);
  }
}
