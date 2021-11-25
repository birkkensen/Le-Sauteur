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
    this.gameoverText = this.add.text(this.center.x, this.center.y, "GAME OVER", {
      fontFamily: "Arcade",
      fontSize: "50px",
    });
    this.gameoverText.setOrigin(0.5);

    this.score = sessionStorage.getItem("Score");
    this.scoreText = this.add.text(
      this.center.x,
      this.gameoverText.y + 50,
      "You got " + this.score + " points",
      {
        fontFamily: "Arcade",
        fontSize: "30px",
      }
    );
    this.scoreText.setOrigin(0.5);
  }
}
