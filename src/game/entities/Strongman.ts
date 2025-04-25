import Phaser from "phaser";

export class Strongman {
  private scene: Phaser.Scene;
  private top: Phaser.GameObjects.Image;
  private bottom: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Bottom
    this.bottom = scene.add.sprite(x, y, "strongman-bottom");
    this.bottom.setOrigin(0.5, 1); // Top pivots at the center bottom
    this.bottom.setScale(scene.entityScale);
    this.bottom.setDepth(10);

    // Top
    this.top = scene.add.image(
      x,
      y - Math.round(this.bottom.displayHeight * 0.66),
      "strongman-top"
    );
    this.top.setOrigin(0.5, 1);
    this.top.setScale(scene.entityScale); // TODO: calculate scale depending on screen size
    this.top.setDepth(11); // TODO: calculate scale depending on screen size

    // Walk animation
    // TODO: Add faster animation to use when tumbling
    this.scene.anims.create({
      key: "walk",
      frames: this.scene.anims.generateFrameNumbers("strongman-bottom", {
        start: 0,
        end: 3,
      }),
      frameRate: 4,
      repeat: -1,
    });
  }

  playWalkAnimation() {
    this.bottom.play("walk", true);
  }

  stopWalkAnimation() {
    this.bottom.stop();
  }

  setPosition(x: number, y: number) {
    this.bottom.setPosition(x, y);
    this.top.setPosition(x, y - Math.round(this.bottom.displayHeight * 0.66));
  }

  setTopRotation(angle: number) {
    this.top.setRotation(Phaser.Math.DegToRad(angle));
  }

  get x() {
    return this.bottom.x;
  }

  get y() {
    return this.bottom.y;
  }

  get topheight() {
    return this.top.displayHeight;
  }
  get topwidth() {
    return this.top.displayWidth;
  }

  get bottomheight() {
    return this.bottom.displayHeight;
  }
  get bottomwidth() {
    return this.bottom.displayWidth;
  }

  get height() {
    return this.bottom.displayHeight + this.top.displayHeight;
  }
}
