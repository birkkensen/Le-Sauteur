import Phaser from "phaser";
export default class Gameover extends Phaser.Scene {
  constructor() {
    super({ key: "Gameover" });
  }

  init(data) {
    this.character = data.player;
    this.background = data.background;
    this.center = data.center;
    this.fullScreen = data.fullScreen;
    this.key = data.key;
    this.framesEnd = data.frames;
    this.finalScore = data.score;
  }
  create() {
    // * ======= Background ======== * //
    this.addBackground();

    // * ======= Texts ======== * //
    this.gameoverText = this.add
      .text(this.center.x, this.center.y - 100, "GAME OVER", {
        fontFamily: "Arcade",
        fontSize: "100px",
      })
      .setOrigin(0.5);
    this.gameoverText.setFill(this.setGradient(this.gameoverText));

    this.scoreText = this.add
      .text(
        this.center.x,
        this.gameoverText.y + 100,
        this.finalScore === 1
          ? `You got ${this.finalScore} point`
          : `You got ${this.finalScore} points`,
        {
          fontFamily: "Arcade",
          fontSize: "30px",
        }
      )
      .setOrigin(0.5);
    this.scoreText.setFill(this.setGradient(this.scoreText));

    this.returnText = this.add
      .text(this.center.x, this.scoreText.y + 70, "Press space to return to the main", {
        fontFamily: "Arcade",
        fontSize: "30px",
      })
      .setOrigin(0.5);
    this.returnText.setFill(this.setGradient(this.returnText));
    this.tweens.add({
      targets: this.returnText,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // * ======= Back to the main menu ======== * //
    this.input.keyboard.once("keydown-" + "SPACE", () => {
      let startScene = this.scene.get("StartScene");
      startScene.scene.restart();
      this.scene.start("StartScene");
    });
  }
  setGradient(text) {
    let gradient = text.context.createLinearGradient(0, 0, 0, text.height);
    gradient.addColorStop(0, "#FFF");
    gradient.addColorStop(1, "#FFF");
    return gradient;
  }
  addBackground() {
    console.log(this.background);
    console.log(this.key);
    this.anims.create({
      key: this.key,
      frames: this.anims.generateFrameNames(this.background, {
        start: 0,
        end: this.framesEnd,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.add
      .sprite(this.center.x, this.center.y, this.background)
      .setDisplaySize(this.fullScreen.x + 2, this.fullScreen.y + 2)
      .anims.play(this.key);
  }
}
