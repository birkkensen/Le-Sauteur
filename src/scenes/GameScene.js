import Phaser from "phaser";


let game, player, controls, center, platform;

// let gamePoints = 0;

let gameOptions = {
  platformSpeedRange: [300, 300], //speed range in px/sec
  backgroundSpeed: 80, //backgroundspeed in px/sec
  platformSpawnRange: [80, 300], //how far should the next be platform from the right edge, before next platform spawns, in px
  platformSizeRange: [90, 300], //platform width range in px
  platformHeightRange: [-5, 5], //height range between rightmost platform and next platform to be spawned
  platformHeightScale: 20, //scale to be multiplied by platformHeightRange
  playerGravity: 900,
  jumps: 2,
  jumpForce: 500, 
  platformVerticalLimit: [0.4, 0.8],
  playerStartPosition: 200, //x position
  coinPercent: 25, // % of probability of coin appearing
  spikePercent: 25, // % of probability of spike appearing
};

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
    // Add jump on spacebar
    this.input.keyboard.on("keydown_UP", this.jump, this);
    this.playerJumps = 0;
    // Create platform and set its physics
    platform = this.physics.add.sprite(center.x, center.y * 2 - 100, "platform");
    platform.setImmovable(true);
    platform.body.moves = false;

    this.physics.add.collider(player, platform);
            timerText = this.add.text(100, 100, "points: 0");
        timerText.setOrigin(0.5);
        this.time.addEvent({
            delay: 5000,
            callback: this.updateCounter,
            callbackScope: this,
            loop: true,
        });
  }

  update() {
    if (player.body.touching.down) {
      player.anims.play("running", true);
    }
  }
    updateCounter() {
        counter++;
        timerText.setText("points: " + counter);
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

export default GameScene;

