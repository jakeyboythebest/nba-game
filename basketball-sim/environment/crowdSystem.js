import { THREE } from '../js/renderer.js';

export function buildCrowd(scene) {
  const crowdGeo = new THREE.BoxGeometry(0.9, 1.5, 0.9);
  const crowdMat = new THREE.MeshStandardMaterial({ color: '#334b7a' });

  for (let i = 0; i < 220; i++) {
    const fan = new THREE.Mesh(crowdGeo, crowdMat);
    const side = i % 2 ? 1 : -1;
    fan.position.set((Math.random() - 0.5) * 30, 1, side * (12 + Math.random() * 12));
    fan.scale.y = 0.8 + Math.random() * 1.2;
    scene.add(fan);
  }
}
