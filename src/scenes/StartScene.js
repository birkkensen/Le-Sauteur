import Phaser from "phaser";

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    this.load.image("start-bg", "assets/images/start-bg.png");
  }
}

export default StartScene;
