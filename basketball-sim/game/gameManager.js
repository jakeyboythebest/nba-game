import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { THREE } from '../js/renderer.js';
import { ScoreSystem } from './scoreSystem.js';
import { TimerSystem } from './timerSystem.js';
import { ShotClock } from './shotClock.js';
import { PlayerController } from '../players/playerController.js';
import { PlayerAnimations } from '../players/playerAnimations.js';
import { StaminaSystem } from '../players/staminaSystem.js';
import { AIController } from '../ai/aiController.js';
import { BallPhysics } from '../physics/ballPhysics.js';
import { CollisionSystem } from '../physics/collisionSystem.js';

const createAudioSystem = () => ({
  ctx: new (window.AudioContext || window.webkitAudioContext)(),
  play(type) {
    const freq = { bounce: 120, rim: 520, swish: 240, crowd: 70 }[type] ?? 220;
    const gain = this.ctx.createGain();
    const osc = this.ctx.createOscillator();
    osc.type = type === 'crowd' ? 'sawtooth' : 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = type === 'crowd' ? 0.01 : 0.02;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + (type === 'crowd' ? 0.5 : 0.07));
  }
});

const makePlayerMesh = (color = '#3ba4ff') => {
  const root = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.0, 4, 8), new THREE.MeshStandardMaterial({ color }));
  body.castShadow = true;
  root.add(body);
  for (let i = 0; i < 2; i++) {
    const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.45, 3, 6), new THREE.MeshStandardMaterial({ color: '#f2f2f2' }));
    limb.position.set(i ? 0.28 : -0.28, 0.6, 0);
    limb.userData.limb = true;
    root.add(limb);
  }
  return root;
};

export class GameManager {
  constructor({ scene, ui, input, camera, hoopParts }) {
    this.scene = scene;
    this.ui = ui;
    this.input = input;
    this.camera = camera;
    this.hoopParts = hoopParts;

    this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    this.world.solver.iterations = 10;
    this.audio = createAudioSystem();

    this.score = new ScoreSystem(ui);
    this.timer = new TimerSystem(ui);
    this.shotClock = new ShotClock(ui);

    this.entities = { ai: [] };
    this.mode = 'quick';
    this.ballCarrierTeam = 'home';
  }

  init() {
    this.#createPhysics();
    this.#createTeams();
    this.#createBall();
    this.aiController = new AIController({ roster: this.entities.ai, ball: this.ball, hoop: this.hoopTarget });
    this.collision = new CollisionSystem({ world: this.world, ballBody: this.ball.body, shotClock: this.shotClock });
    this.collision.setup(this.rimBody);

    this.timer.start();
    this.shotClock.start();
    this.audio.play('crowd');
  }

  startMode(mode) {
    this.mode = mode;
    this.reset();
    if (mode === 'practice') {
      this.entities.ai.forEach((ai) => {
        ai.body.position.set(50, 1, 50);
        ai.mesh.visible = false;
      });
    } else {
      this.entities.ai.forEach((ai, i) => {
        ai.mesh.visible = true;
        ai.body.position.set(-3 + i * 3, 1, -2);
      });
    }
  }

  reset() {
    this.score.reset();
    this.timer.reset();
    this.shotClock.reset();
    this.entities.player.body.position.set(0, 1, 4);
    this.entities.player.body.velocity.set(0, 0, 0);
    this.entities.player.stamina.reset();
    this.ball.attachTo(this.entities.player);
    this.timer.start();
    this.shotClock.start();
  }

  update(dt) {
    this.input.update(dt);
    this.entities.player.controller.update(dt);

    this.#handleActions();
    if (this.mode !== 'practice') {
      this.aiController.update(dt, this.entities.player, this.#aiShoot.bind(this), this.#pass.bind(this), this.#attemptSteal.bind(this));
    }

    this.world.step(1 / 60, dt, 3);
    this.ball.update(dt);

    this.timer.update(dt);
    this.shotClock.update(dt);
    if (this.shotClock.value <= 0) this.#switchPossession();

    this.#checkScoring();
  }

  #handleActions() {
    const heldNorm = Math.min(1, this.input.shotHeld / 1.2);
    this.ui.updateShotMeter(heldNorm, 'Charging');

    const released = this.input.consumeShotRelease();
    if (released !== null && this.ball.owner === this.entities.player) {
      const evalShot = this.ui.shotMeter.evaluate(released);
      this.#playerShoot(evalShot);
    }

    if (this.input.isDown('KeyE') && this.ball.owner === this.entities.player) {
      const target = this.entities.ai[0] ?? this.entities.player;
      this.#pass(this.entities.player, target);
    }

    if (this.input.isDown('KeyF')) this.#attemptSteal(this.entities.player);
    if (this.input.isDown('KeyR')) this.audio.play('rim');
  }

  #playerShoot(evalShot) {
    const from = this.entities.player.body.position;
    const hoop = this.hoopTarget;
    const dir = hoop.vsub(from);
    const dist = dir.length();
    dir.normalize();

    const arc = 5 + dist * 0.35;
    const accuracy = 0.78 + evalShot.bonus;
    const spread = (1 - accuracy) * 0.8;
    const vx = dir.x * (7 + dist * 0.6) + (Math.random() - 0.5) * spread;
    const vz = dir.z * (7 + dist * 0.6) + (Math.random() - 0.5) * spread;
    this.ball.release(new CANNON.Vec3(vx, arc, vz));
  }

  #aiShoot(ai, quality) {
    if (this.ball.owner !== ai) return;
    const from = ai.body.position;
    const dir = this.hoopTarget.vsub(from);
    const dist = dir.length();
    dir.normalize();
    const spread = (1 - quality) * 0.7;
    this.ball.release(new CANNON.Vec3(dir.x * (7 + dist * 0.62) + (Math.random() - 0.5) * spread, 6 + dist * 0.24, dir.z * (7 + dist * 0.62)));
  }

  #pass(from, to) {
    if (this.ball.owner !== from) return;
    this.ball.passTo(from, to);
    this.ballCarrierTeam = from === this.entities.player ? 'home' : 'away';
    this.audio.play('bounce');
  }

  #attemptSteal(who) {
    if (!this.ball.owner || this.ball.owner === who) return;
    const dist = who.body.position.distanceTo(this.ball.owner.body.position);
    if (dist < 1.4 && Math.random() > 0.5) {
      this.ball.attachTo(who);
      this.ballCarrierTeam = who === this.entities.player ? 'home' : 'away';
      this.#switchPossession(false);
    }
  }

  #switchPossession(resetClock = true) {
    if (resetClock) this.shotClock.reset();
    if (this.ballCarrierTeam === 'home') {
      this.ball.attachTo(this.entities.ai[0]);
      this.ballCarrierTeam = 'away';
    } else {
      this.ball.attachTo(this.entities.player);
      this.ballCarrierTeam = 'home';
    }
  }

  #checkScoring() {
    const ball = this.ball.body.position;
    const rim = this.hoopTarget;
    const nearRim = Math.hypot(ball.x - rim.x, ball.z - rim.z) < 0.28;
    const through = nearRim && ball.y < 3 && ball.y > 2.5 && this.ball.body.velocity.y < -1;
    if (through) {
      const shooterHome = this.ballCarrierTeam === 'home';
      const dist = this.entities.player.body.position.distanceTo(this.hoopTarget);
      const points = dist > 6.75 ? 3 : 2;
      this.score.addScore(shooterHome ? 'home' : 'away', points);
      this.audio.play('swish');
      this.#switchPossession();
    }

    if (this.collision.rimRecentlyHit()) this.audio.play('rim');

    const out = Math.abs(ball.x) > 15 || Math.abs(ball.z) > 9;
    if (out) this.#switchPossession();
  }

  #createPhysics() {
    const floor = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: new CANNON.Material('floor') });
    floor.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(floor);

    this.rimBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Cylinder(0.23, 0.23, 0.05, 16),
      collisionResponse: true,
    });
    this.rimBody.position.set(0, 3.05, -8.8);
    this.rimBody.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    this.world.addBody(this.rimBody);

    this.backboardBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(0.9, 0.55, 0.04)) });
    this.backboardBody.position.set(0, 3.3, -9.3);
    this.world.addBody(this.backboardBody);

    this.hoopTarget = new CANNON.Vec3(0, 3.05, -8.8);
  }

  #createTeams() {
    const makeBody = (x, z) => {
      const body = new CANNON.Body({ mass: 80, shape: new CANNON.Sphere(0.42), linearDamping: 0.35 });
      body.position.set(x, 1, z);
      this.world.addBody(body);
      return body;
    };

    const playerMesh = makePlayerMesh('#2f9bff');
    const playerBody = makeBody(0, 4);
    this.scene.add(playerMesh);

    const animations = new PlayerAnimations();
    const stamina = new StaminaSystem(this.ui);
    const controller = new PlayerController({ input: this.input, body: playerBody, mesh: playerMesh, stamina, animations, camera: this.camera });

    this.entities.player = { mesh: playerMesh, body: playerBody, controller, stamina };

    for (let i = 0; i < 3; i++) {
      const mesh = makePlayerMesh('#ff5b5b');
      const body = makeBody(-3 + i * 3, -2);
      this.scene.add(mesh);
      this.entities.ai.push({ mesh, body });
    }
  }

  #createBall() {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), new THREE.MeshStandardMaterial({ color: '#de7c35' }));
    mesh.castShadow = true;
    this.scene.add(mesh);

    const body = new CANNON.Body({ mass: 0.62, shape: new CANNON.Sphere(0.24), linearDamping: 0.03, angularDamping: 0.02 });
    body.position.set(0.5, 1, 4.2);
    body.material = new CANNON.Material('ball');
    this.world.addBody(body);

    this.ball = new BallPhysics({ world: this.world, body, mesh, ui: this.ui, audio: this.audio });
    this.ball.attachTo(this.entities.player);
  }
}
