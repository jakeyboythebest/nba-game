export class BallPhysics {
  constructor({ world, body, mesh, ui, audio }) {
    this.world = world;
    this.body = body;
    this.mesh = mesh;
    this.ui = ui;
    this.audio = audio;
    this.owner = null;
    this.state = 'loose';
  }

  attachTo(owner) {
    this.owner = owner;
    this.state = 'dribble';
  }

  release(velocity) {
    this.owner = null;
    this.state = 'flight';
    this.body.velocity.set(velocity.x, velocity.y, velocity.z);
  }

  passTo(from, to) {
    const dir = to.body.position.vsub(from.body.position);
    dir.normalize();
    this.owner = null;
    this.state = 'flight';
    this.body.velocity.set(dir.x * 10, 4, dir.z * 10);
  }

  update(dt) {
    if (this.owner && this.state === 'dribble') {
      const phase = performance.now() * 0.01;
      this.body.position.set(
        this.owner.body.position.x + 0.45,
        1 + Math.abs(Math.sin(phase)) * 0.8,
        this.owner.body.position.z + 0.2
      );
      this.body.velocity.set(0, 0, 0);
      if (Math.abs(Math.sin(phase)) < 0.05) this.audio.play('bounce');
    }

    this.mesh.position.copy(this.body.position);

    if (!this.owner && this.body.position.y < 0.28) {
      this.audio.play('bounce');
      this.state = 'loose';
    }

    if (!this.owner && this.body.velocity.length() < 0.2 && this.body.position.y < 0.31) {
      this.state = 'loose';
    }
  }
}
