import Phaser from "phaser";

let player, center, platform;
let gameOptions = {
  jumps: 2,
  jumpForce: 500,
  playerGravity: 900,
};
// let playerJumps = 0;
class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene",
    });
  }

  preload() {
    this.load.image("thanos", "./assets/thanospic.png");
    this.load.image("platform", "./assets/platform.png");
    this.load.spritesheet("dude", "./assets/theDude.png", { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };

    player = this.physics.add.sprite(center.x - 100, center.y, "dude");
    // Set gravity
    player.setGravityY(gameOptions.playerGravity);
    // Define two animations, one for when running, one for jumping
    this.anims.create({
      key: "running",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "jumping",
      frames: [{ key: "dude", frame: 4 }],
    });

    this.input.on("pointerdown", this.jump, this);
    this.playerJumps = 0;
    // Create platform and set its physics
    platform = this.physics.add.sprite(center.x, center.y * 2 - 100, "platform");
    platform.setImmovable(true);
    platform.body.moves = false;

    this.physics.add.collider(player, platform);
  }
  update() {
    if (player.body.touching.down) {
      player.anims.play("running", true);
    }
  }
  jump() {
    if (
      player.body.touching.down ||
      (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)
    ) {
      if (player.body.touching.down) {
        this.playerJumps = 0;
      }
      player.setVelocityY(gameOptions.jumpForce * -1);
      player.anims.play("jumping", true);
      this.playerJumps++;
    }
  }
}

export default GameScene;
