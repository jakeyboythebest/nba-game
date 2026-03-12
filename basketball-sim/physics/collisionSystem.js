export class CollisionSystem {
  constructor({ world, ballBody, shotClock }) {
    this.world = world;
    this.ballBody = ballBody;
    this.shotClock = shotClock;
    this.lastRimHit = 0;
  }

  setup(rimBody) {
    this.ballBody.addEventListener('collide', (e) => {
      if (e.body === rimBody) {
        this.lastRimHit = performance.now();
        this.shotClock.reset();
      }
    });
  }

  rimRecentlyHit() {
    return performance.now() - this.lastRimHit < 700;
  }
}
