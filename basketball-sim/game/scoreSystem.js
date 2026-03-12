export class ScoreSystem {
  constructor(ui) {
    this.ui = ui;
    this.home = 0;
    this.away = 0;
  }

  addScore(team, points) {
    if (team === 'home') this.home += points;
    else this.away += points;
    this.ui.updateScore(this.home, this.away);
  }

  reset() {
    this.home = 0;
    this.away = 0;
    this.ui.updateScore(0, 0);
  }
}
