import Phaser from "phaser";
import config from "../main.js";
let game, ball, healthbar1, healthbar2, healthbar3;
let score = 0;
let healthCounter = 3;
let overlapTriggered = false;
window.onload = () => (game = new Phaser.Game(config));

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
  coinPercent: 100, // % of probability of coin appearing
  ballPercent: 25, // % of probability of spike appearing
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene",
    });
  }

  init(data) {
    this.character = data.player;
    this.background = data.background;
    this.backgroundKey = data.backgroundKey;
    this.center = data.center;
    this.fullScreen = data.fullScreen;
    this.platformKey = data.platformKey;
    this.framesEnd = data.frames;
  }

  preload() {
    if (this.background === "scary-background") {
      this.load.image(this.platformKey, "./assets/platforms/lava-platform.png");
    } else if (this.background === "regular-background") {
      this.load.image(this.platformKey, "./assets/platforms/grass-platform.png");
    } else if (this.background === "mortal-background") {
      this.load.image(this.platformKey, "./assets/platforms/snow-platform.png");
    }
  }

  create() {
    // * ======= Animations ======== * //
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

    this.anims.create({
      key: "rotate",
      frames: this.anims.generateFrameNumbers("coins", {
        start: 0,
        end: 6,
      }),
      frameRate: 20,
      repeat: -1,
    });
    this.anims.create({
      key: this.backgroundKey,
      frames: this.anims.generateFrameNames(this.background, {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.addBackground();
    healthbar3 = this.add.image(this.center.x * 2 - 140, 20, "healthbar3").setVisible(false);
    healthbar2 = this.add.image(this.center.x * 2 - 140, 20, "healthbar2").setVisible(false);
    healthbar1 = this.add.image(this.center.x * 2 - 140, 20, "healthbar1").setVisible(false);
    // * ======= Groups & Pools ======== * //
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

    //group all active coins
    this.coinGroup = this.add.group({
      removeCallback: function (coin) {
        //once a coin is removed it's added to the pool
        // @ts-ignore Property 'coinPool' does not exist on type 'Scene'.
        coin.scene.coinPool.add(coin);
      },
    });

    //coin pool
    this.coinPool = this.add.group({
      removeCallback: function (coin) {
        //once a coin is removed from the pool it's added to the active coins group
        // @ts-ignore Property 'coinGroup' does not exist on type 'Scene'.
        coin.scene.coinGroup.add(coin);
      },
    });

    //group all active bowling balls
    this.ballGroup = this.add.group({
      removeCallback: function (ball) {
        //once a ball is removed it's added to the pool
        // @ts-ignore Property 'ballPool' does not exist on type 'Scene'.
        ball.scene.ballPool.add(ball);
      },
    });

    //ball pool
    this.ballPool = this.add.group({
      removeCallback: function (ball) {
        // @ts-ignore Property 'ballGroup' does not exist on type 'Scene'.
        ball.scene.ballGroup.add(ball);
      },
    });
    // * ======= Player ======== * //
    this.player = this.physics.add.sprite(
      gameOptions.playerStartPosition,
      game.config.height * 0.5,
      this.character
    );
    this.player.setGravityY(gameOptions.playerGravity);
    this.player.setDepth(2);
    this.player.setScale(0.5);

    this.playerLanding = this.sound.add("landing", { volume: 0.2 });
    this.playerJumps = 0;

    this.addedPlatforms = 0;
    this.input.keyboard.on("keydown-SPACE", this.jump, this);
    this.input.on("pointerdown", this.jump, this);

    // * ======= Colliders / Overlaps ======== * //
    //setting collision between player and coins
    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      (player, coin) => {
        if (overlapTriggered) {
          return;
        }
        overlapTriggered = true;
        this.updateScore();
        this.tweens.add({
          targets: coin,
          // @ts-ignore
          y: coin.y - 100,
          alpha: 0,
          duration: 800,
          ease: "Cubic.easeOut",
          callbackScope: this,
          onComplete: () => {
            this.coinGroup.killAndHide(coin);
            this.coinGroup.remove(coin);
            overlapTriggered = false;
          },
        });
      },
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.ballGroup,
      (player, ball) => {
        this.ballGroup.killAndHide(ball);
        this.ballGroup.remove(ball);
        // ball.body.enable = false;
        this.checkHealth();
        healthCounter--;
        this.tweens.add({
          targets: player,
          alpha: 0,
          duration: 100,
          repeat: 3,
          yoyo: true,
          callbackScope: this,
        });
      },
      null,
      this
    );

    // * ======= First platform ======== * //
    this.addPlatform(
      game.config.width,
      game.config.width / 2,
      game.config.height * gameOptions.platformVerticalLimit[1]
    );
    // setting collisions between the player and the platform group
    this.platformCollider = this.physics.add.collider(
      this.player,
      this.platformGroup,
      () => {
        // play "run" animation if the player is on a platform
        if (!this.player.anims.isPlaying) {
          this.player.anims.play("run");
          this.playerLanding.play();
        }
      },
      null,
      this
    );

    // this.physics.add.collider(player, platform);
    this.displayScore = this.add.text(10, 10, "Points: 0", {
      fontSize: "16px",
      color: "#FFF",
      fontFamily: "Arcade",
    });
  }
  // * ======= Methods ======== * //

  // the core of the script: platform are added from the pool or created on the fly
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
      platform = this.add.tileSprite(posX, posY, platformWidth, 64, this.platformKey);
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

    //if this is not the starting platform?
    if (this.addedPlatforms > 1) {
      //if there is a coin over the platform?
      if (Phaser.Math.Between(1, 100) <= gameOptions.coinPercent) {
        if (this.coinPool.getLength()) {
          let coin = this.coinPool.getFirst();
          coin.x = posX;
          coin.y = posY - 96;
          coin.alpha = 1;
          coin.active = true;
          coin.visible = true;
          this.coinPool.remove(coin);
        } else {
          let coin = this.physics.add.sprite(posX, posY - 96, "coins");
          coin.setImmovable(true);
          coin.setVelocityX(platform.body.velocity.x);
          // coin.anims.play("rotate");
          coin.anims.play("rotate", true);
          coin.setDepth(2);
          this.coinGroup.add(coin);
        }
      }

      // * ======= Ball - Obstacle ======== * //
      //if there is a ball over the platform?
      if (Phaser.Math.Between(1, 100) <= gameOptions.ballPercent) {
        if (this.ballPool.getLength()) {
          ball = this.ballPool.getFirst();
          ball.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
          ball.y = posY - 52;
          ball.alpha = 1;
          ball.active = true;
          ball.visible = true;
          this.ballPool.remove(ball);
        } else {
          ball = this.physics.add.sprite(
            posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth),
            posY - 52,
            "ball"
          );
          ball.setImmovable(true);
          ball.setVelocityX(platform.body.velocity.x);
          // ball.setSize(8, 2);
          ball.setScale(0.25);
          //ball.anims.play create rotate animation
          ball.setDepth(2);
          this.ballGroup.add(ball);
        }
      }
    }
  }

  updateScore() {
    score++;
    this.displayScore.setText("Points: " + score);
  }

  jump() {
    if (
      this.player.body.touching.down ||
      (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)
    ) {
      if (this.player.body.touching.down) {
        this.playerJumps = 0;
      }
      this.player.setVelocityY(gameOptions.jumpForce * -1);
      this.playerJumps++;
      this.player.anims.play("jump");
      this.player.anims.stop();
    }
  }

  update() {
    this.checkHealth();
    if (this.player.y > game.config.height) {
      this.gameover();
    }
    // Keep the player at the same position on the x axis
    this.player.x = gameOptions.playerStartPosition;

    // * ======= Recycling Platforms / adding new ======== * //
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

    /// * ======= New Coins ======== * //
    this.coinGroup.getChildren().forEach((coin) => {
      // @ts-ignore
      if (coin.x < -coin.displayWidth / 2) {
        this.coinGroup.killAndHide(coin);
        this.coinGroup.remove(coin);
      }
    }, this);

    // * ======= New Balls ======== * //
    this.ballGroup.getChildren().forEach((ball) => {
      // @ts-ignore
      if (ball.x < -ball.displayWidth / 2) {
        this.ballGroup.killAndHide(ball);
        this.ballGroup.remove(ball);
      }
    }, this);
  }

  checkHealth() {
    if (score % 10 === 0 && score !== 0 && healthCounter !== 3) {
      healthCounter++;
    }
    switch (healthCounter) {
      case 3:
        healthbar3.setVisible(true);
        break;
      case 2:
        healthbar3.setVisible(false);
        healthbar2.setVisible(true);
        break;
      case 1:
        healthbar3.setVisible(false);
        healthbar2.setVisible(false);
        healthbar1.setVisible(true);
        break;
      case 0:
        this.gameover();
        break;
    }
  }
  addBackground() {
    this.add
      .sprite(this.center.x, this.center.y, this.background)
      .setDisplaySize(this.fullScreen.x + 2, this.fullScreen.y + 2)
      .anims.play(this.backgroundKey);
  }

  gameover() {
    this.finalScore = score;
    score = 0;
    healthCounter = 3;
    overlapTriggered = false;
    this.scene.start("Gameover", {
      score: this.finalScore,
      center: this.center,
      fullScreen: this.fullScreen,
      background: this.background,
      frames: this.framesEnd,
      key: this.backgroundKey,
    });
  }
}
