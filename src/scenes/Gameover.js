import Phaser from "phaser";
export default class Gameover extends Phaser.Scene {
  constructor() {
    super({ key: "Gameover" });
  }
  create() {
    this.center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };
    this.gameoverText = this.add.text(this.center.x, this.center.y - 100, "GAME OVER", {
      fontFamily: "Arcade",
      fontSize: "100px",
    });
    this.gameoverText.setOrigin(0.5);

    this.score = sessionStorage.getItem("Score");
    this.scoreText = this.add.text(
      this.center.x,
      this.gameoverText.y + 100,
      "You got " + this.score + " points",
      {
        fontFamily: "Arcade",
        fontSize: "30px",
      }
    );
    this.scoreText.setOrigin(0.5);

    this.returnText = this.add
      .text(this.center.x, this.scoreText.y + 70, "Press any key to return to the main", {
        fontFamily: "Arcade",
        fontSize: "20px",
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: this.returnText,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeInOut",
      yoyo: true,
      repeat: -1,
    });
    this.input.keyboard.once("keydown", () => {
      this.scene.start("StartScene");
    });
  }
}
