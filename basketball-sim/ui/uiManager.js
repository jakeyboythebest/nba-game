import { HUD } from './hud.js';
import { MenuSystem } from './menuSystem.js';
import { ShotMeter } from './shotMeter.js';

export class UIManager {
  constructor(startCb, restartCb) {
    this.hud = new HUD();
    this.menu = new MenuSystem(startCb, restartCb);
    this.shotMeter = new ShotMeter(this.hud);
  }

  updateScore(home, away) { this.hud.updateScore(home, away); }
  updateGameTimer(sec) { this.hud.updateGameTimer(sec); }
  updateShotClock(sec) { this.hud.updateShotClock(sec); }
  updateStamina(n) { this.hud.updateStamina(n); }
  updateShotMeter(n, msg) { this.hud.updateShotMeter(n, msg); }
}
