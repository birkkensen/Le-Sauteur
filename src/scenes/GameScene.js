import Phaser from "phaser";

let player, controls, center;
// let gamePoints = 0;
class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene",
    });
  }

  preload() {
    this.load.image("thanos", "./assets/thanospic.png");
    this.load.image("platform", "./assets/platform.png");
  }

  create() {
    center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };

    player = this.physics.add.sprite(center.x - 100, 0, "thanos");
    player.setCollideWorldBounds(true);

    controls = this.input.keyboard.createCursorKeys();

    this.add.image(center.x, center.y, "platform");
  }

  update() {
    if (controls.up.isDown) {
      player.setVelocityY(-500);
      console.log("up");
    } else if (controls.down.isDown) {
      player.setVelocityY(500);
      console.log("down");
    }
  }
}

export default GameScene;
