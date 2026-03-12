import { THREE } from '../js/renderer.js';

export function addArenaLighting(scene) {
  scene.add(new THREE.HemisphereLight('#9db4ff', '#0a0a0a', 0.45));

  const key = new THREE.DirectionalLight('#ffffff', 1.4);
  key.position.set(12, 24, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.top = 30;
  key.shadow.camera.bottom = -30;
  key.shadow.camera.left = -30;
  key.shadow.camera.right = 30;
  scene.add(key);

  const rimLight = new THREE.SpotLight('#98e6ff', 0.8, 120, 0.45, 0.8, 1);
  rimLight.position.set(0, 22, -13);
  rimLight.target.position.set(0, 3, -13);
  scene.add(rimLight, rimLight.target);
}
