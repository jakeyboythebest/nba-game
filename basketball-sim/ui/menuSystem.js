export class MenuSystem {
  constructor(onStart, onRestart) {
    this.overlay = document.getElementById('menu-overlay');
    this.overlay.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.hide();
        onStart(btn.dataset.mode);
      });
    });

    document.getElementById('restart-btn').addEventListener('click', () => onRestart());
  }

  show() { this.overlay.classList.add('visible'); }
  hide() { this.overlay.classList.remove('visible'); }
}
