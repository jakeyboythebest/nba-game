export class StaminaSystem {
  constructor(ui) {
    this.ui = ui;
    this.max = 100;
    this.current = 100;
    this.drainRate = 22;
    this.recoverRate = 16;
  }

  update(isSprinting, dt) {
    if (isSprinting) this.current = Math.max(0, this.current - this.drainRate * dt);
    else this.current = Math.min(this.max, this.current + this.recoverRate * dt);
    this.ui.updateStamina(this.current / this.max);
  }

  sprintFactor() {
    return this.current > 1 ? 1 : 0.7;
  }

  reset() {
    this.current = this.max;
    this.ui.updateStamina(1);
  }
}
