import Phaser from "phaser";
import Gameover from "./Gameover.js";
let game, timerText;
let counter = 0;
window.onload = function () {
  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
        gravity: { y: 0 },
      },
    },
    scene: [GameScene, Gameover],
  };

  game = new Phaser.Game(config);
};

// let gamePoints = 0;

let gameOptions = {
  platformSpeedRange: [300, 300], //speed range in px/sec
  backgroundSpeed: 80, //backgroundspeed in px/sec
  platformSpawnRange: [80, 300], //how far should the next be platform from the right edge, before next platform spawns, in px
  platformSizeRange: [150, 300], //platform width range in px
  platformHeightRange: [-5, 5], //height range between rightmost platform and next platform to be spawned
  platformHeightScale: 20, //scale to be multiplied by platformHeightRange
  playerGravity: 1200,
  jumps: 2,
  jumpForce: 500,
  platformVerticalLimit: [0.4, 0.8],
  playerStartPosition: 200, //x position
  coinPercent: 25, // % of probability of coin appearing
  spikePercent: 25, // % of probability of spike appearing
};

class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene",
    });
  }

  preload() {
    this.load.image("platform", "./assets/platform.png");
    this.load.spritesheet("dude", "./assets/thePlayer.png", { frameWidth: 96, frameHeight: 128 });
  }

  create() {
    // setting player animation
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("dude", {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "jump",
      frames: [{ key: "dude", frame: 4 }],
    });

    // group with all active platforms.
    this.platformGroup = this.add.group({
      // once a platform is removed, it's added to the pool
      removeCallback: function (platform) {
        // @ts-ignore Property 'platformPool' does not exist on type 'Scene'.
        platform.scene.platformPool.add(platform);
      },
    });

    // platform pool
    this.platformPool = this.add.group({
      // once a platform is removed from the pool, it's added to the active platforms group
      removeCallback: function (platform) {
        // @ts-ignore Property 'platformGroup' does not exist on type 'Scene'.
        platform.scene.platformGroup.add(platform);
      },
    });
    // keeping track of added platforms
    this.addedPlatforms = 0;
    // number of consecutive jumps made by the player so far

    // Add jump on spacebar
    this.input.on("pointerdown", this.jump, this);

    this.playerJumps = 0;

    this.dying = false;

    this.player = this.physics.add.sprite(
      gameOptions.playerStartPosition,
      game.config.height * 0.5,
      "dude"
    );
    this.player.setGravityY(gameOptions.playerGravity);
    this.player.setDepth(2);
    // adding a platform to the game, the arguments are platform width, x position and y position
    this.addPlatform(
      game.config.width,
      game.config.width / 2,
      game.config.height * gameOptions.platformVerticalLimit[1]
    );
    // the player is not dying
    this.dying = false;
    // checking for input
    this.input.on("pointerdown", this.jump, this);
    // setting collisions between the player and the platform group
    this.platformCollider = this.physics.add.collider(
      this.player,
      this.platformGroup,
      function () {
        // play "run" animation if the player is on a platform
        if (!this.player.anims.isPlaying) {
          this.player.anims.play("run");
        }
      },
      null,
      this
    );

    // this.physics.add.collider(player, platform);
    timerText = this.add.text(100, 100, "points: 0");
    timerText.setOrigin(0.5);

    this.time.addEvent({
      delay: 5000,
      callback: this.updateCounter,
      callbackScope: this,
      loop: true,
    });
  }

  // the core of the script: platform are added from the pool or created on the fly
  /**
   * @param {number} platformWidth
   * @param {number} posX
   * @param {number} posY
   */
  addPlatform(platformWidth, posX, posY) {
    this.addedPlatforms++;
    let platform;
    if (this.platformPool.getLength()) {
      platform = this.platformPool.getFirst();

      platform.x = posX;
      platform.y = posY;
      platform.active = true;
      platform.visible = true;
      this.platformPool.remove(platform);
      platform.displayWidth = platformWidth;
      platform.tileScaleX = 1 / platform.scaleX;
    } else {
      platform = this.add.tileSprite(posX, posY, platformWidth, 64, "platform");
      this.physics.add.existing(platform);
      // @ts-ignore
      platform.body.setImmovable(true);
      // @ts-ignore
      platform.body.setVelocityX(
        Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) *
          -1
      );
      platform.setDepth(2);
      this.platformGroup.add(platform);
    }
    this.nextPlatformDistance = Phaser.Math.Between(
      gameOptions.platformSpawnRange[0],
      gameOptions.platformSpawnRange[1]
    );
  }
  updateCounter() {
    counter++;
    timerText.setText("points: " + counter);
  }
  jump() {
    if (
      !this.dying &&
      (this.player.body.touching.down ||
        (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps))
    ) {
      if (this.player.body.touching.down) {
        this.playerJumps = 0;
      }
      this.player.setVelocityY(gameOptions.jumpForce * -1);
      this.playerJumps++;

      // stops animation
      this.player.anims.play("jump");
      this.player.anims.stop();
    }
  }

  update() {
    // if the player is falliong down, reset
    if (this.player.y > game.config.height) {
      this.scene.start("Gameover", Gameover);
      let score = JSON.stringify(counter);
      sessionStorage.setItem("Score", score);
      // this.scene.remove("GameScene");
    }
    // Keep the player at the same position on the x axis
    this.player.x = gameOptions.playerStartPosition;
    // recycling platforms
    let minDistance = game.config.width;
    let rightmostPlatformHeight = 0;
    this.platformGroup.getChildren().forEach(function (platform) {
      // @ts-ignore Property 'x' && 'displawidth' does not exist on type 'GameObject'.
      let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
      if (platformDistance < minDistance) {
        minDistance = platformDistance;
        // @ts-ignore Property 'y' does not exist on type 'GameObject'.
        rightmostPlatformHeight = platform.y;
      }
      // @ts-ignore Property 'x' && 'displawidth' does not exist on type 'GameObject'.
      if (platform.x < -platform.displayWidth / 2) {
        this.platformGroup.killAndHide(platform);
        this.platformGroup.remove(platform);
      }
    }, this);

    // adding new platforms
    if (minDistance > this.nextPlatformDistance) {
      let nextPlatformWidth = Phaser.Math.Between(
        gameOptions.platformSizeRange[0],
        gameOptions.platformSizeRange[1]
      );
      let platformRandomHeight =
        gameOptions.platformHeightScale *
        Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
      let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;

      let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
      let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
      let nextPlatformHeight = Phaser.Math.Clamp(
        nextPlatformGap,
        minPlatformHeight,
        maxPlatformHeight
      );
      this.addPlatform(
        nextPlatformWidth,
        game.config.width + nextPlatformWidth / 2,
        nextPlatformHeight
      );
    }
  }
}

export default GameScene;
