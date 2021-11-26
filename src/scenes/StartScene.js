import Phaser from "phaser";

export default class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.spritesheet("bg", "./assets/bg.png", {
      frameWidth: 560,
      frameHeight: 256,
    });
    this.load.image("platform", "./assets/moss-platform.png");
    this.load.image("ball", "./assets/bowling-ball-pixel.png");
    this.load.image("healthbar1", "./assets/health1.png");
    this.load.image("healthbar2", "./assets/health2.png");
    this.load.image("healthbar3", "./assets/health3.png");
    this.load.spritesheet("dude", "./assets/thePlayer.png", { frameWidth: 96, frameHeight: 128 });
    this.load.spritesheet("coins", "./assets/coins.png", { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    this.center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };
    this.addBackground();
    this.title = this.add.text(this.center.x, this.center.y, "The Dude", {
      fontFamily: "Arcade",
      fontSize: "100px",
    });
    this.title.setOrigin(0.5);
    this.titleGradient = this.title.context.createLinearGradient(0, 0, 0, this.title.height);
    this.titleGradient.addColorStop(0, "#F2A172");
    this.titleGradient.addColorStop(1, "#D9B5A0");
    this.title.setFill(this.titleGradient);

    this.text = this.add.text(this.center.x, this.title.y + 100, "Press any key to start", {
      fontFamily: "Arcade",
      fontSize: "30px",
    });
    this.textGradient = this.title.context.createLinearGradient(0, 0, 0, this.text.height);
    this.textGradient.addColorStop(0, "#F2A172");
    this.textGradient.addColorStop(1, "#D9B5A0");
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

    this.input.keyboard.on("keydown", () => {
      this.scene.start("GameScene");
    });
  }

  addBackground() {
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
  }
}
