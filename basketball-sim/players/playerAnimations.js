export class PlayerAnimations {
  update(playerMesh, velocity, dribblePhase = 0) {
    const speed = velocity.length();
    playerMesh.rotation.y = Math.atan2(velocity.x || 0.001, velocity.z || 0.001);
    playerMesh.children.forEach((limb, i) => {
      if (!limb.userData.limb) return;
      limb.rotation.x = Math.sin(dribblePhase * 7 + i) * 0.35 * Math.min(1, speed / 6);
    });
  }
}
