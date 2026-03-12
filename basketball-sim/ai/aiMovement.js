import { THREE } from '../js/renderer.js';

export class AIMovement {
  moveToward(body, target, dt, speed = 4.4) {
    const dir = new THREE.Vector3(target.x - body.position.x, 0, target.z - body.position.z);
    if (dir.lengthSq() < 0.01) return;
    dir.normalize();
    body.velocity.x += dir.x * speed * dt * 10;
    body.velocity.z += dir.z * speed * dt * 10;

    const planar = Math.hypot(body.velocity.x, body.velocity.z);
    if (planar > speed) {
      body.velocity.x *= speed / planar;
      body.velocity.z *= speed / planar;
    }
  }
}
