import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameOverText: Phaser.GameObjects.Text;

  constructor() {
    super("GameOver");
  }

  create() {
    // TODO: Use a different background depending on the scene
    this.background = this.add.image(0, 0, "backgrounds").setOrigin(0, 0);
    // Scale background
    const scaleX = this.scale.width / this.background.width;
    const scaleY = this.scale.height / this.background.height;

    this.background.setScale(scaleX, scaleY);
    this.background.setCrop(0, 0, 1, this.background.height);
    this.background.setDepth(0);

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}
