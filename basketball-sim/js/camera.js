import { THREE } from './renderer.js';

export class SportsCamera {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 500);
    this.yaw = Math.PI;
    this.pitch = -0.22;
    this.distance = 8;
    this.height = 4;
  }

  update(targetPos, mouseDelta) {
    this.yaw -= mouseDelta.x * 0.0022;
    this.pitch -= mouseDelta.y * 0.0015;
    this.pitch = Math.max(-0.65, Math.min(0.25, this.pitch));

    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * this.distance,
      this.height + Math.sin(this.pitch) * 3,
      Math.cos(this.yaw) * this.distance,
    );
    this.camera.position.copy(targetPos).add(offset);
    this.camera.lookAt(targetPos.x, targetPos.y + 1.4, targetPos.z);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
