export class ShotMeter {
  constructor(ui) {
    this.ui = ui;
    this.releaseWindow = [0.77, 0.84];
  }

  evaluate(holdTime) {
    const n = Math.min(1, holdTime / 1.2);
    let timing = 'Late';
    let bonus = 0;

    if (n < 0.45) timing = 'Early';
    else if (n < 0.68) timing = 'Slightly Early';
    else if (n >= this.releaseWindow[0] && n <= this.releaseWindow[1]) {
      timing = 'Perfect Release';
      bonus = 0.18;
    } else if (n < 0.93) timing = 'Slightly Late';

    this.ui.updateShotMeter(n, timing);
    return { timing, bonus, power: n };
  }
}
