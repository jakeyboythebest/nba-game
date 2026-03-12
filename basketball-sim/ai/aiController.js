import { AIDecisionSystem } from './aiDecisionSystem.js';
import { AIMovement } from './aiMovement.js';

export class AIController {
  constructor({ roster, ball, hoop }) {
    this.roster = roster;
    this.ball = ball;
    this.hoop = hoop;
    this.decision = new AIDecisionSystem();
    this.move = new AIMovement();
    this.cooldown = 0;
  }

  update(dt, player, onShoot, onPass, onSteal) {
    this.cooldown = Math.max(0, this.cooldown - dt);

    this.roster.forEach((npc, idx) => {
      const hasBall = this.ball.owner === npc;
      const ctx = {
        hasBall,
        playerHasBall: this.ball.owner === player,
        openShot: Math.random() > 0.45,
        openTeammate: Math.random() > 0.55,
        laneOpen: Math.random() > 0.5,
        defenderDistance: npc.body.position.distanceTo(player.body.position),
        distanceToHoop: npc.body.position.distanceTo(this.hoop.position),
        distanceToPlayer: npc.body.position.distanceTo(player.body.position),
      };

      const choice = this.decision.decide(ctx);
      switch (choice) {
        case 'shoot':
          if (this.cooldown === 0) {
            this.cooldown = 1.5;
            onShoot(npc, 0.72 + Math.random() * 0.22);
          }
          break;
        case 'pass': {
          const mate = this.roster[(idx + 1) % this.roster.length];
          onPass(npc, mate);
          break;
        }
        case 'drive':
          this.move.moveToward(npc.body, this.hoop.position, dt, 5.2);
          break;
        case 'guard':
          this.move.moveToward(npc.body, player.body.position, dt, 4.7);
          break;
        case 'steal':
          if (this.cooldown === 0) {
            this.cooldown = 0.6;
            onSteal(npc);
          }
          break;
        case 'space':
        case 'reposition': {
          const orbit = {
            x: Math.sin(performance.now() * 0.001 + idx) * 8,
            z: Math.cos(performance.now() * 0.001 + idx) * 6,
          };
          this.move.moveToward(npc.body, orbit, dt, 4.0);
          break;
        }
      }

      npc.mesh.position.copy(npc.body.position);
    });
  }
}
