import Phaser from "phaser";

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };
    this.load.spritesheet("bg", "./assets/bg-spritesheet.png", {
      frameWidth: 560,
      frameHeight: 272,
    });
  }

  create() {
    this.anims.create({
      key: "background",
      frames: this.anims.generateFrameNames("bg", {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.bg = this.add.sprite(this.center.x, this.center.y, "bg");
    this.bg.anims.play("background");
    this.bg.setDisplaySize(this.center.x * 2 + 2, this.center.y * 2 + 2);
    this.title = this.add.text(this.center.x, this.center.y, "The Dude", {
      fontFamily: "Arcade",
      fontSize: "100px",
    });
    this.title.setOrigin(0.5);
    this.titleGradient = this.title.context.createLinearGradient(0, 0, 0, this.title.height);
    this.titleGradient.addColorStop(0, "#FFFFFF");
    this.titleGradient.addColorStop(1, "#D99C79");
    this.title.setFill(this.titleGradient);

    this.text = this.add.text(this.center.x, this.title.y + 100, "Press any key to start", {
      fontFamily: "Arcade",
      fontSize: "30px",
    });
    this.textGradient = this.title.context.createLinearGradient(0, 0, 0, this.text.height);
    this.textGradient.addColorStop(0, "#FFFFFF");
    this.textGradient.addColorStop(1, "#D99C79");
    this.text.setFill(this.textGradient);
    this.text.setOrigin(0.5);
    this.tweens.add({
      targets: this.text,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }
}

export default StartScene;
