import Phaser from "phaser";
import { TextButton } from "../utils/TextButton.js";

// TODO: Add the naruto-player and the player_three
const NARUTO_PLAYER = "naruto";
const BACKPACK_GIRL = "backpack-girl";
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
    this.load.spritesheet("retro-bg", "./assets/backgrounds/startsprite.png", {
      frameWidth: 952,
      frameHeight: 416,
    });

    // * ======= Sounds ======== * //
    this.load.audio("landing", "./sounds/groundimpact.mp3");
    this.load.audio("bgMusic", "./sounds/bg-music.mp3");

    // * ======= Obstacles and Health ======== * //
    this.load.image("ball", "./assets/obstacles/greenbowl.png");
    this.load.image("healthbar1", "./assets/healthAndCoins/health1.png");
    this.load.image("healthbar2", "./assets/healthAndCoins/health2.png");
    this.load.image("healthbar3", "./assets/healthAndCoins/health3.png");
    this.load.spritesheet("sasuke", "./assets/obstacles/sasukesprite.png", {
      frameWidth: 34,
      frameHeight: 55,
    });
    this.load.spritesheet("sasukefire", "./assets/obstacles/sasukefire.png", {
      frameWidth: 268.5,
      frameHeight: 116,
    });

    // * ======= Players ======== * //
    this.load.spritesheet(THE_DUDE_PLAYER, "./assets/players/theDude.png", {
      frameWidth: 44.2,
      frameHeight: 59,
    });
    this.load.spritesheet(NARUTO_PLAYER, "./assets/players/narutosprite.png", {
      frameWidth: 63.333,
      frameHeight: 59,
    });
    this.load.spritesheet(BACKPACK_GIRL, "./assets/players/runningGirl.png", {
      frameWidth: 59,
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

    this.anims.create({
      key: "startsceneBG",
      frames: this.anims.generateFrameNames("retro-bg", {
        start: 0,
        end: 7,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.addBackground();
    this.backgroundMusic = this.sound.add("bgMusic", { volume: 1 });

    // * ======= Texts / Buttons ======== * //
    // TODO: When the user press one button, and later change their mind and press another instead - remove the hasChoosenState color from the previous button //
    this.title = this.add
      .text(this.center.x, this.center.y - 250, "le sauteur", {
        fontFamily: "Arcade",
        fontSize: "80px",
        color: "#FF5733"
      })
      .setOrigin(0.5, 1);

      this.description = this.add
      .text(this.center.x, this.title.y + 100, "click to jump, doubleclick to doublejump  \n \n Collect coins while avoiding obstacles", {
        fontFamily: "Arcade",
        fontSize: "20px",
      })
      .setOrigin(0.5, 1);

    const offsetY = 75;
    const offsetX = 300;
    const color = "#fff";
    this.playerText = this.add
      .text(this.center.x, this.title.y + 150, "select your player", {
        fontFamily: "Arcade",
        fontSize: "30px",
        color: "#FFA500",
      })
      .setOrigin(0.5, 0);
    this.playerOne = new TextButton(
      this,
      this.center.x + offsetX,
      this.playerText.y + offsetY,
      "The Dude",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () =>
        this.choosenPlayer(
          THE_DUDE_PLAYER,
          THE_DUDE_PLAYER + "-key",
          4,
          false,
          THE_DUDE_PLAYER + "-run",
          0,
          3
        )
    ).setOrigin(0.5, 0);
    this.add.existing(this.playerOne);

    this.playerTwo = new TextButton(
      this,
      this.center.x - offsetX,
      this.playerText.y + offsetY,
      "Naruto",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () =>
        this.choosenPlayer(
          NARUTO_PLAYER,
          NARUTO_PLAYER + "-key",
          7,
          true,
          NARUTO_PLAYER + "-run",
          1,
          6
        )
    ).setOrigin(0.5, 0);
    this.add.existing(this.playerTwo);
    this.playerThree = new TextButton(
      this,
      this.center.x,
      this.playerText.y + offsetY,
      "backpacker",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () =>
        this.choosenPlayer(
          BACKPACK_GIRL,
          BACKPACK_GIRL + "-key",
          5,
          false,
          BACKPACK_GIRL + "-run",
          0,
          9
        )
    ).setOrigin(0.5, 0);
    this.add.existing(this.playerThree);

    this.backgroundText = this.add
      .text(this.center.x, this.playerOne.y + offsetY, "select your map", {
        fontFamily: "Arcade",
        fontSize: "30px",
        color: "#FFA500",
      })
      .setOrigin(0.5, 0);

    this.scaryBg = new TextButton(
      this,
      this.center.x + offsetX,
      this.backgroundText.y + offsetY,
      "Netherrealm",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenBg(SCARY_BG, SCARY_BG + "-key", 15, "lava")
    ).setOrigin(0.5, 0);
    this.add.existing(this.scaryBg);

    this.regularBg = new TextButton(
      this,
      this.center.x - offsetX,
      this.backgroundText.y + offsetY,
      "Living Forest",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenBg(REGULAR_BG, REGULAR_BG + "-key", 7, "grass")
    ).setOrigin(0.5, 0);
    this.add.existing(this.regularBg);

    this.mortalBg = new TextButton(
      this,
      this.center.x,
      this.backgroundText.y + offsetY,
      "Kahn's Arena",
      { fontFamily: "Arcade", fontSize: "20px", color: color },
      () => this.choosenBg(MORTAL_BG, MORTAL_BG + "-key", 7, "snow")
    ).setOrigin(0.5, 0);
    this.add.existing(this.mortalBg);

    this.startGameText = new TextButton(
      this,
      this.center.x,
      this.regularBg.y + offsetY + 50,
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
  choosenPlayer(
    player,
    jumpKey,
    frame,
    doubleJump,
    runningKey,
    runningFrameStart,
    runningFrameEnd
  ) {
    this.player = player;
    this.jumpKey = jumpKey;
    this.jumpFrame = frame;
    this.doubleJump = doubleJump;
    this.runningKey = runningKey;
    this.runningFrameStart = runningFrameStart;
    this.runningFrameEnd = runningFrameEnd;
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
      jumpKey: this.jumpKey,
      jumpFrame: this.jumpFrame,
      doubleJump: this.doubleJump,
      runningKey: this.runningKey,
      runningFrameStart: this.runningFrameStart,
      runningFrameEnd: this.runningFrameEnd,
      background: this.background,
      backgroundKey: this.backgroundKey,
      platformKey: this.platformKey,
      frames: this.backgroundFrames,
      center: this.center,
      fullScreen: this.fullScreen,
    });
  }

  addBackground() {
    this.add
      .sprite(this.center.x, this.center.y, "retro-bg")
      .setDisplaySize(this.fullScreen.x, this.fullScreen.y)
      .anims.play("startsceneBG"); 
  }
}
