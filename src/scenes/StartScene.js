import Phaser from "phaser";

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.image("thanos", "./assets/thanospic.png");
    this.load.image("platform", "./assets/platform.png");

    this.add.text(20, 20, "Press any key to continue...");
    this.input.keyboard.on("keydown", () => {
      this.scene.start("GameScene");
      this.scene.remove("StartScene");
    });
  }
}

export default StartScene;
