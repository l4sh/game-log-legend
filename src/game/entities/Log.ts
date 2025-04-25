import Phaser from "phaser";

export class Log {
  private log: Phaser.Physics.Matter.Image;
  private ghostLog: Phaser.Physics.Matter.Image;
  private centerMassY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, centerMassY: number) {
    const logTexture = "log";
    const { width: logWidth, height: logHeight } = scene.textures
      .get("log")
      .get();

    this.log = scene.matter.add.image(x, y, logTexture, undefined, {
      shape: {
        type: "rectangle",
        width: logWidth,
        height: logHeight,
      },
      // scale: 4,
      // ignoreGravity: true,

      frictionAir: 0,
      mass: 1,
    });
    this.log.setIgnoreGravity(true);
    this.log.setScale(scene.entityScale); // TODO: calculate scale depending on screen size
    this.log.setDepth(20);
    this.log.setBounce(0);
    this.log.setAngle(0);
    this.log.setDensity(1000);
    this.log.setVisible(true); // Hide the log

    // NOTE: both origin and positon with offset need to be set to correctly
    // position the log around an external pivot point
    this.centerMassY = centerMassY;
    this.log.setOrigin(0.5, 2.5);
    const logBody = this.log.body;
    const offset = {
      x: 0,
      y: centerMassY,
    };
    logBody.positionPrev.x += offset.x;
    logBody.positionPrev.y += offset.y;
    logBody.position.x += offset.x;
    logBody.position.y += offset.y;

    // --

    // Ghost log, this is to be able to use static and not be affected by other
    // items weight... Is there a better way to handle this?
    this.ghostLog = scene.matter.add.image(x, y, logTexture, undefined, {
      shape: {
        type: "rectangle",
        width: logWidth,
        height: logHeight,
      },
    });
    this.ghostLog.setOrigin(0.5);
    this.ghostLog.setScale(scene.entityScale); // TODO: calculate scale depending on screen size
    this.ghostLog.setStatic(true);
    this.ghostLog.setFriction(0.1);
    this.ghostLog.setFrictionStatic(0);
    this.ghostLog.setVisible(false);

    // Apply offset also to ghost log
    const ghostLogBody = this.ghostLog.body;
    ghostLogBody.positionPrev.x += offset.x;
    ghostLogBody.positionPrev.y += offset.y;
    ghostLogBody.position.x += offset.x;
    ghostLogBody.position.y += offset.y;
    this.ghostLog.setCollisionCategory(scene.collisionCategories.log);
    this.ghostLog.setCollidesWith([scene.collisionCategories.item]);
    // // Collisions are selective
    // const logCategory = scene.matter.world.nextCategory();
    // const ghostLogCategory = scene.matter.world.nextCategory();

    // this.log.setCollisionCategory(logCategory);
  }

  setPosition(x: number, y: number) {
    this.log.setPosition(x, y);
    this.ghostLog.setPosition(x, y);
  }

  setAngle(angle: number) {
    this.log.setAngle(angle);
    this.ghostLog.setAngle(angle);
  }

  setVelocity(x: number, y: number) {
    this.log.setVelocity(x, y);
  }

  setIgnoreGravity(ignore: boolean) {
    this.log.setIgnoreGravity(ignore);
  }

  setAngularVelocity(velocity: number) {
    // this.log.positionPrev.y += offset.y;
    this.log.setAngularVelocity(velocity);
  }

  get x() {
    return this.log.x;
  }

  get y() {
    return this.log.y;
  }

  get angle() {
    return this.log.angle;
  }

  get width() {
    return this.log.width;
  }

  get height() {
    return this.log.height;
  }

  drop() {
    this.log.setIgnoreGravity(false);
  }

  sync() {
    this.ghostLog.setPosition(this.log.x, this.log.y);
    this.ghostLog.setAngle(this.log.angle);
  }
}
