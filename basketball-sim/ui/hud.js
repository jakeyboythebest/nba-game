export class HUD {
  constructor() {
    this.home = document.getElementById('home-score');
    this.away = document.getElementById('away-score');
    this.gameTimer = document.getElementById('game-timer');
    this.shotClock = document.getElementById('shot-clock');
    this.staminaFill = document.getElementById('stamina-fill');
    this.shotFill = document.getElementById('shot-fill');
    this.shotFeedback = document.getElementById('shot-feedback');
  }

  updateScore(home, away) {
    this.home.textContent = home;
    this.away.textContent = away;
  }

  updateGameTimer(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(Math.floor(seconds % 60)).padStart(2, '0');
    this.gameTimer.textContent = `${mm}:${ss}`;
  }

  updateShotClock(seconds) {
    this.shotClock.textContent = Math.ceil(seconds);
  }

  updateStamina(norm) {
    this.staminaFill.style.width = `${Math.floor(norm * 100)}%`;
  }

  updateShotMeter(norm, stateText = 'Ready') {
    this.shotFill.style.width = `${Math.floor(norm * 100)}%`;
    this.shotFeedback.textContent = stateText;
    const color = norm > 0.76 && norm < 0.86 ? '#76ff93' : '#53d7ff';
    this.shotFill.style.background = color;
  }
}
