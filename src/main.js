import Phaser from "phaser";
import StartScene from "./scenes/StartScene";
import GameScene from "./scenes/GameScene";
import Gameover from "./scenes/Gameover";
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      // gravity: { y: 900 },
      // debug: true,
    },
  },
  scene: [StartScene, GameScene, Gameover],
};
export default config;
