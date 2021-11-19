import Phaser from "phaser";

let game, player, controls, center, platform;
// let gamePoints = 0;

let gameOptions = {
  platformSpeedRange: [300, 300], //speed range in px/sec
  backgroundSpeed: 80, //backgroundspeed in px/sec
  platformSpawnRange: [80, 300], //how far should the next be platform from the right edge, before next platform spawns, in px
  platformSizeRange: [90, 300], //platform width range in px
  platformHeightRange: [-5, 5], //height range between rightmost platform and next platform to be spawned
  platformHeightScale: 20, //scale to be multiplied by platformHeightRange
  playerGravity: 900,
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
    this.load.image("thanos", "./assets/thanospic.png");
    this.load.image("platform", "./assets/platform.png");
    this.load.image("spike", "./assets/spike.png");
    this.load.image("coin", "./assets/coin.png");
    this.load.spritesheet("dude", "./assets/theDude.png", { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };

    player = this.physics.add.sprite(center.x - 100, center.y, "dude");
    // Set gravity
    player.setGravityY(gameOptions.playerGravity);
    // Define two animations, one for when running, one for jumping
    this.anims.create({
      key: "running",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1,
    });
    this.anims.create({
      key: "jumping",
      frames: [{ key: "dude", frame: 4 }],
    });
    // Add jump on spacebar
    this.input.on("pointerdown", this.jump, this);
    this.playerJumps = 0;
    // Create platform and set its physics
    platform = this.physics.add.sprite(center.x, center.y * 2 - 100, "platform");
    platform.setImmovable(true);
    platform.body.moves = false;

    this.physics.add.collider(player, platform);


    //group all active platforms
    this.platformGroup = this.add.group({
      //when a platform is removed > added to the pool 
      removeCallback: function(platform) {
        platform.scene.platformPool.add(platform)
      }
    });

    //platform pool
    this.platformPool = this.add.group({
      //when a platform is removed from the pool > added to the active platforms group
      removeCallback: function(platform) {
        platform.scene.platformGroup.add(platform)
      }
    });
    
    //group all active coins
    this.coinGroup = this.add.group({
      //when a coin is removed > added to the pool
      removeCallback: function(coin) {
        coin.scene.coinPool.add(coin)
      }
    });

    //coin pool
    this.coinPool = this.add.group({
      //when a coin is removed from the pool > added to the active coins group
      removeCallback: function(coin) {
        coin.scene.coinGroup.add(coin)
      }
    });


    
    //keeping track of added platforms
    this.addedPlatforms = 0;
    // adding a platform to the game, the arguments are platform width, x position and y position
    this.addPlatforms(game.config.width, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);

    this.dying = false; //player is not dying

    this.physics.add.overlap(this.playerJumps, this.coinGroup, function(player, coin) {
      this.tweens.add( {
        target: coin,
        callbackScope: this,
        onComplete: function() {
          this.coinGroup.killAndHide(coin);
          this.coinGroup.remove(coin);
        } 
      });
    }, null, this);


    //platform added from the pool or created on the fly
    this.addedPlatforms(platformWidth, posX, posY); {
      this.addedPlatforms ++;
      let platform;
      if(this.platformPool.getLength()) {
        platform = this.platformPool.getFirst();
        platform.x = posX;
        platform.y = posY;
        platform.active = true;
        platform.visible = true;
        this.platformPool.remove(platform);
        let newRatio = platformWidth / platform.displayWidth;
        platform.displayWidth = platformWidth;
        platform.tileScaleX = 1 /platform.scaleX;
      }
      else {
        platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
        this.physics.add.existing(platform);
        platform.body.setImmovable(true);
        platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
        platform.setDepth(2);
        this.platformPool.add(platform);
      }
      this.nextPlatformDistance = Phaser.Math.Between(gameOptions.platformSpawnRange[0], gameOptions.platformSpawnRange[1]);

    }

  }

  update() {
    if (player.body.touching.down) {
      player.anims.play("running", true);
    }
  }

  jump() {
    if (
      player.body.touching.down ||
      (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)
    ) {
      if (player.body.touching.down) {
        this.playerJumps = 0;
      }
      player.setVelocityY(gameOptions.jumpForce * -1);
      player.anims.play("jumping", true);
      this.playerJumps++;
    }
  }
}

export default GameScene;
