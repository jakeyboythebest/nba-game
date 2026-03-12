import { createRenderer, createScene, THREE } from './renderer.js';
import { InputController } from './input.js';
import { SportsCamera } from './camera.js';
import { GameLoop } from './gameLoop.js';
import { buildCourt, buildHoop } from '../environment/courtBuilder.js';
import { addArenaLighting } from '../environment/arenaLighting.js';
import { buildCrowd } from '../environment/crowdSystem.js';
import { UIManager } from '../ui/uiManager.js';
import { GameManager } from '../game/gameManager.js';

const canvas = document.getElementById('game-canvas');
const renderer = createRenderer(canvas);
const scene = createScene();
const input = new InputController(canvas);
const sportsCam = new SportsCamera();

buildCourt(scene);
const hoopParts = buildHoop(scene);
addArenaLighting(scene);
buildCrowd(scene);

const ui = new UIManager(startGame, restartGame);
const game = new GameManager({ scene, ui, input, camera: sportsCam, hoopParts });
game.init();

const loop = new GameLoop(update, render);
loop.start();

function startGame(mode) {
  game.startMode(mode);
}

function restartGame() {
  game.reset();
}

function update(dt) {
  game.update(dt);
  const target = new THREE.Vector3(
    game.entities.player.body.position.x,
    game.entities.player.body.position.y,
    game.entities.player.body.position.z,
  );
  sportsCam.update(target, input.consumeMouseDelta());
}

function render() {
  renderer.render(scene, sportsCam.camera);
}

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  sportsCam.resize();
});
