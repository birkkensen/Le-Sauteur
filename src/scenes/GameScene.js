/* eslint-disable no-undef */
// @ts-nocheck
import Phaser from "phaser";
let healthbar3;
let healthbar2;
let healthbar1;
let healthCounter = 3;
let game, timerText, center;
let counter = 0;
window.onload = function() {
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
        scene: [GameScene],
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
        this.load.image("healthbar1", "./assets/health1.png");
        this.load.image("healthbar2", "./assets/health2.png");
        this.load.image("healthbar3", "./assets/health3.png");


        this.load.spritesheet("dude", "./assets/thePlayer.png", { frameWidth: 96, frameHeight: 128 });
        this.load.spritesheet("coin", "./assets/coin.png", { frameWidth: 20, frameHeight: 20 });
    }

    create() {


        center = {
            x: this.physics.world.bounds.width / 2,
            y: this.physics.world.bounds.height / 2,
        }

        // healthbar3 = this.add.sprite(center.x * 2 - 140, 20, "health3")
        // healthbar2 = this.add.sprite(center.x * 2 - 140, 20, "health2")
        // healthbar1 = this.add.sprite(center.x * 2 - 140, 20, "health1")
        healthbar3 = this.add.image(center.x * 2 - 140, 20, "healthbar3")
        healthbar2 = this.add.image(center.x * 2 - 140, 20, "healthbar2")
        healthbar1 = this.add.image(center.x * 2 - 140, 20, "healthbar1")
        healthbar2.visible = false;
        healthbar1.visible = false;
        healthbar3.visible = false;

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
        //
        this.anims.create({
            key: "rotate",
            frames: this.anims.generateFrameNumbers("coin", {
                start: 0,
                end: 5
            }),
            frameRate: 15,
            yoyo: true,
            repeat: -1
        });

        // group with all active platforms.
        this.platformGroup = this.add.group({
            // once a platform is removed, it's added to the pool
            removeCallback: function(platform) {
                // @ts-ignore Property 'platformPool' does not exist on type 'Scene'.
                platform.scene.platformPool.add(platform);
            },
        });

        // platform pool
        this.platformPool = this.add.group({
            // once a platform is removed from the pool, it's added to the active platforms group
            removeCallback: function(platform) {
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
            function() {
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
        this.coinGroup = this.add.group({

            // once a coin is removed, it's added to the pool
            removeCallback: function(coin) {
                coin.scene.coinPool.add(coin)
            }
        });

        // coin pool
        this.coinPool = this.add.group({

            // once a coin is removed from the pool, it's added to the active coins group
            removeCallback: function(coin) {
                coin.scene.coinGroup.add(coin)
            }
        });
        // setting collisions between the player and the coin group
        this.physics.add.overlap(this.player, this.coinGroup, function(player, coin) {

            this.tweens.add({
                targets: coin,
                y: coin.y - 100,
                alpha: 0,
                duration: 800,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function() {
                    this.coinGroup.killAndHide(coin);
                    this.coinGroup.remove(coin);
                }
            });

        }, null, this);

        // if this is not the starting platform...
        if (this.addedPlatforms > 1) {

            // is there a coin over the platform?
            if (Phaser.Math.Between(1, 100) <= gameOptions.coinPercent) {
                if (this.coinPool.getLength()) {
                    let coin = this.coinPool.getFirst();
                    coin.x = posX;
                    // @ts-ignore
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinPool.remove(coin);
                } else {
                    // @ts-ignore
                    // eslint-disable-next-line no-undef
                    let coin = this.physics.add.sprite(posX, posY - 96, "coin");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    coin.anims.play("rotate");
                    coin.setDepth(2);
                    this.coinGroup.add(coin);
                }
            }

            // is there a fire over the platform?

        }
        //
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
        if (!this.dying &&
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
    checkhealth() {
        switch (healthCounter) {
            case 3:
                healthbar3.visible = true;
                healthbar2.visible = false;
                healthbar1.visible = false;

                break;
            case 2:

                healthbar3.visible = false;
                healthbar2.visible = true;
                healthbar1.visible = false;
                break;
            case 1:

                healthbar3.visible = false;
                healthbar2.visible = false;
                healthbar1.visible = true;
                break;
            case 0:
                healthbar3.visible = false;
                healthbar2.visible = false;
                healthbar1.visible = false;

                break;

            case -1:
                this.scene.stop("GameScene");
                break;


        }
    }

    update() {
        this.checkhealth();
        // if the player is falliong down, reset
        if (this.player.y > game.config.height) {
            this.scene.restart("GameScene");
            this.checkhealth();
            console.log(healthbar3)
            healthCounter--;
            console.log("healthcounter", healthCounter)
        }
        // Keep the player at the same position on the x axis
        this.player.x = gameOptions.playerStartPosition;
        // recycling platforms
        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform) {
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