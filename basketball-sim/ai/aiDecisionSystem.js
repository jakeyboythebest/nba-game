export class AIDecisionSystem {
  decide(ctx) {
    if (ctx.hasBall) {
      if (ctx.openShot && ctx.distanceToHoop < 9) return 'shoot';
      if (ctx.defenderDistance < 2.2 && ctx.openTeammate) return 'pass';
      if (ctx.laneOpen) return 'drive';
      return 'reposition';
    }

    if (ctx.playerHasBall) {
      if (ctx.distanceToPlayer < 1.4) return 'steal';
      return 'guard';
    }

    return 'space';
  }
}
