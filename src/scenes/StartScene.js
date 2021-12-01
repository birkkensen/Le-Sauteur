import Phaser from "phaser";
import { TextButton } from "../utils/TextButton.js";

// TODO: Add the naruto-player and the player_three
const NARUTO_PLAYER = "naruto";
const PLAYER_THREE = ":)";
const THE_DUDE_PLAYER = "dude";
const SCARY_BG = "scary-background";
const REGULAR_BG = "regular-background";
const MORTAL_BG = "mortal-background";
export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });
  }

  preload() {
    // * ======= Backgrounds ======== * //
    this.load.spritesheet(REGULAR_BG, "./assets/backgrounds/regular-bg.png", {
      frameWidth: 560,
      frameHeight: 256,
    });
    this.load.spritesheet(SCARY_BG, "./assets/backgrounds/scary-bg.png", {
      frameWidth: 800,
      frameHeight: 336,
    });
    this.load.spritesheet(MORTAL_BG, "./assets/backgrounds/mortal-combat-bg.png", {
      frameWidth: 640,
      frameHeight: 322,
    });
    this.load.image("retro-bg", "./assets/backgrounds/retro-bg.webp");

    // * ======= Sounds ======== * //
    this.load.audio("landing", "./sounds/groundimpact.mp3");
    this.load.audio("bgMusic", "./sounds/bg-music.mp3");

    // * ======= Obstacles and Health ======== * //
    this.load.image("ball", "./assets/obstacles/bowling-ball-pixel.png");
    this.load.image("healthbar1", "./assets/healthAndCoins/health1.png");
    this.load.image("healthbar2", "./assets/healthAndCoins/health2.png");
    this.load.image("healthbar3", "./assets/healthAndCoins/health3.png");
    this.load.spritesheet("sasuke", "./assets/obstacles/sasukesprite.png", {
      frameWidth: 34,
      frameHeight: 55,
    });
    this.load.spritesheet("sasukefire", "./assets/obstacles/sasukefirefire.png", {
      frameWidth: 148,
      frameHeight: 66,
    });

    // * ======= Players ======== * //
    this.load.spritesheet(THE_DUDE_PLAYER, "./assets/players/thePlayer.png", {
      frameWidth: 96,
      frameHeight: 128,
    });
    this.load.spritesheet("naruto", "./assets/players/narutosprite.png", {
      frameWidth: 63.333,
      frameHeight: 59,
    });

    // * ======= Coins ======== * //
    this.load.spritesheet("coins", "./assets/healthAndCoins/coins.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // * ======= Helpers ======== * //
    this.center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };
    this.fullScreen = {
      x: this.physics.world.bounds.width,
      y: this.physics.world.bounds.height,
    };

    this.addBackground();
    this.backgroundMusic = this.sound.add("bgMusic", { volume: 1 });

    // * ======= Texts / Buttons ======== * //
    // TODO: When the user press one button, and later change their mind and press another instead - remove the hasChoosenState color from the previous button //
    this.title = this.add
      .text(this.center.x, this.center.y - 100, "le sauteur", {
        fontFamily: "Arcade",
        fontSize: "80px",
      })
      .setOrigin(0.5, 1);

    const offsetY = 75;
    const offsetX = 200;
    const color = "#fff";
    this.title.setFill(this.setGradient(this.title));
    this.playerText = this.add
      .text(this.center.x, this.title.y + 50, "select a player", {
        fontFamily: "Arcade",
        fontSize: "30px",
        color: color,
      })
      .setOrigin(0.5, 0);
    this.playerOne = new TextButton(
      this,
      this.center.x + offsetX,
      this.playerText.y + offsetY,
      "The Dude",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenPlayer(THE_DUDE_PLAYER)
    ).setOrigin(0.5, 0);
    this.add.existing(this.playerOne);

    // ! ======= Not working - see line 4 ======== ! //
    this.playerTwo = new TextButton(
      this,
      this.center.x - offsetX,
      this.playerText.y + offsetY,
      "Naruto",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenPlayer(NARUTO_PLAYER)
    ).setOrigin(0.5, 0);
    this.add.existing(this.playerTwo);
    // ! ======= Not working - see line 4 ======== ! //
    this.playerThree = new TextButton(
      this,
      this.center.x,
      this.playerText.y + offsetY,
      "player?",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenPlayer(PLAYER_THREE)
    ).setOrigin(0.5, 0);
    this.add.existing(this.playerThree);

    this.backgroundText = this.add
      .text(this.center.x, this.playerOne.y + offsetY, "select a background", {
        fontFamily: "Arcade",
        fontSize: "30px",
        color: color,
      })
      .setOrigin(0.5, 0);

    this.scaryBg = new TextButton(
      this,
      this.center.x + offsetX,
      this.backgroundText.y + offsetY,
      "Scary",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenBg(SCARY_BG, SCARY_BG + "-key", 15, "lava")
    ).setOrigin(0.5, 0);
    this.add.existing(this.scaryBg);

    this.regularBg = new TextButton(
      this,
      this.center.x - offsetX,
      this.backgroundText.y + offsetY,
      "Regular",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenBg(REGULAR_BG, REGULAR_BG + "-key", 7, "grass")
    ).setOrigin(0.5, 0);
    this.add.existing(this.regularBg);

    this.mortalBg = new TextButton(
      this,
      this.center.x,
      this.backgroundText.y + offsetY,
      "Mortal",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenBg(MORTAL_BG, MORTAL_BG + "-key", 7, "snow")
    ).setOrigin(0.5, 0);
    this.add.existing(this.mortalBg);

    this.startGameText = new TextButton(
      this,
      this.center.x,
      this.regularBg.y + offsetY,
      "Start Game",
      { fontFamily: "Arcade", fontSize: "25px", color: color },
      () => {
        this.startGame();
      }
    ).setOrigin(0.5);
    this.add.existing(this.startGameText);

    // * ======= Mute or Play ======== * //
    this.musicBtn = new TextButton(
      this,
      this.center.x * 2 - 50,
      this.center.y * 2 - 50,
      "Sound Off",
      {
        fontFamily: "Arcade",
        color: color,
        fontSize: "24px",
      },
      () => {
        this.setMusicState();
      }
    ).setOrigin(1, 1);
    this.add.existing(this.musicBtn);
  }

  // * ======= Methods ======== * //
  setMusicState() {
    if (this.backgroundMusic.isPlaying) {
      this.backgroundMusic.pause();
      this.musicBtn.setText("Sound Off");
    } else {
      this.backgroundMusic.play();
      this.musicBtn.setText("Sound On");
    }
  }
  choosenPlayer(player) {
    this.player = player;
  }
  choosenBg(bg, key, frames, platform) {
    this.background = bg;
    this.backgroundKey = key;
    this.backgroundFrames = frames;
    this.platformKey = platform;
  }
  // TODO: Clean this if-block up, somehow...
  startGame() {
    if (this.player === undefined) return;
    if (this.background === undefined) return;
    if (this.backgroundKey === undefined) return;
    if (this.backgroundFrames === undefined) return;
    this.scene.start("GameScene", {
      player: this.player,
      background: this.background,
      backgroundKey: this.backgroundKey,
      platformKey: this.platformKey,
      frames: this.backgroundFrames,
      center: this.center,
      fullScreen: this.fullScreen,
    });
  }
  // ? ======= Could probaly remove setGradient method ======== ? //
  setGradient(text) {
    let gradient = text.context.createLinearGradient(0, 0, 0, text.height);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, "#fff");
    return gradient;
  }
  addBackground() {
    this.add
      .sprite(this.center.x, this.center.y, "retro-bg")
      .setDisplaySize(this.fullScreen.x, this.fullScreen.y);
  }
}
