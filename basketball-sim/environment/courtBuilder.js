import { THREE } from '../js/renderer.js';

export function buildCourt(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 18),
    new THREE.MeshStandardMaterial({ color: '#b87a45', roughness: 0.6 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const paintMat = new THREE.LineBasicMaterial({ color: '#ffffff' });
  const line = (points) => {
    const geom = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p[0], 0.03, p[1])));
    scene.add(new THREE.LineLoop(geom, paintMat));
  };

  line([[-14, -8], [14, -8], [14, 8], [-14, 8]]);
  line([[-3, -8], [3, -8], [3, -3], [-3, -3]]);
  line([[-3, 8], [3, 8], [3, 3], [-3, 3]]);

  const circle = new THREE.EllipseCurve(0, 0, 2, 2, 0, Math.PI * 2);
  const points = circle.getPoints(64).map((p) => new THREE.Vector3(p.x, 0.03, p.y));
  scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), paintMat));

  const arc = (z, facing = 1) => {
    const c = new THREE.EllipseCurve(0, z, 6.75, 6.75, facing > 0 ? Math.PI * 0.2 : Math.PI * 1.2, facing > 0 ? Math.PI * 0.8 : Math.PI * 1.8, false);
    const pts = c.getPoints(48).map((p) => new THREE.Vector3(p.x, 0.03, p.y));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), paintMat));
  };
  arc(-8, 1);
  arc(8, -1);
}

export function buildHoop(scene) {
  const parts = {};
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.3), new THREE.MeshStandardMaterial({ color: '#4f5a66' }));
  pole.position.set(0, 1.65, -10.2);
  pole.castShadow = true;

  const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.08), new THREE.MeshStandardMaterial({ color: '#f1f7ff' }));
  board.position.set(0, 3.3, -9.3);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.025, 16, 64), new THREE.MeshStandardMaterial({ color: '#f86e29' }));
  rim.position.set(0, 3.05, -8.8);
  rim.rotation.x = Math.PI / 2;

  const net = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.45, 10, 1, true), new THREE.MeshStandardMaterial({ color: '#f8f8f8', wireframe: true }));
  net.position.set(0, 2.8, -8.8);

  scene.add(pole, board, rim, net);
  parts.pole = pole;
  parts.backboard = board;
  parts.rim = rim;
  parts.net = net;
  return parts;
}
