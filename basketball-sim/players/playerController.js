import { THREE } from '../js/renderer.js';

export class PlayerController {
  constructor({ input, body, mesh, stamina, animations, camera }) {
    this.input = input;
    this.body = body;
    this.mesh = mesh;
    this.stamina = stamina;
    this.animations = animations;
    this.camera = camera;
    this.accel = 36;
    this.maxSpeed = 6;
    this.dribbleTime = 0;
  }

  update(dt) {
    const move = new THREE.Vector3(
      Number(this.input.isDown('KeyD')) - Number(this.input.isDown('KeyA')),
      0,
      Number(this.input.isDown('KeyS')) - Number(this.input.isDown('KeyW')),
    );

    const sprinting = this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight');
    this.stamina.update(sprinting, dt);

    if (move.lengthSq() > 0) {
      move.normalize();
      const yaw = this.camera.yaw;
      const rotated = new THREE.Vector3(
        move.x * Math.cos(yaw) - move.z * Math.sin(yaw),
        0,
        move.x * Math.sin(yaw) + move.z * Math.cos(yaw)
      );

      const top = this.maxSpeed * (sprinting ? 1.45 : 1) * this.stamina.sprintFactor();
      this.body.velocity.x += rotated.x * this.accel * dt;
      this.body.velocity.z += rotated.z * this.accel * dt;
      const planar = Math.hypot(this.body.velocity.x, this.body.velocity.z);
      if (planar > top) {
        const scale = top / planar;
        this.body.velocity.x *= scale;
        this.body.velocity.z *= scale;
      }
      this.dribbleTime += dt * (sprinting ? 1.9 : 1.2);
    } else {
      this.body.velocity.x *= 0.84;
      this.body.velocity.z *= 0.84;
      this.dribbleTime += dt * 0.4;
    }

    if (this.input.isDown('KeyQ')) {
      this.body.velocity.x += Math.sin(this.dribbleTime * 24) * 0.15;
    }

    this.mesh.position.copy(this.body.position);
    this.animations.update(this.mesh, new THREE.Vector3(this.body.velocity.x, 0, this.body.velocity.z), this.dribbleTime);
  }
}
