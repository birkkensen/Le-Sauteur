import Phaser from "phaser";

let player, controls, center, platform;
let counter = 0;
let timerText;
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

    controls = this.input.keyboard.createCursorKeys();

    platform = this.physics.add.sprite(center.x, center.y * 2 - 100, "platform");
    platform.setCollideWorldBounds(true);
    platform.setImmovable(true);
    platform.body.moves = false;

    timerText = this.add.text(center.x, center.y, "Counter: 0");
    timerText.setOrigin(0.5);
    this.time.addEvent({
      delay: 1000,
      callback: this.updateCounter,
      callbackScope: this,
      loop: true,
    });
  }

  updateCounter() {
    counter++;
    timerText.setText("Counter: " + counter);
  }

  update() {
    this.physics.add.collider(platform, player, landing, null, this);

    //timer
    // text.setText("T " + timedEvent.getProgress().toString().substr(0, 5));

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

function landing() {
  player.setVelocityY(0);
  // console.log("test");
}
