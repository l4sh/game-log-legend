import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  logoTween: Phaser.Tweens.Tween | null;

  constructor() {
    super("MainMenu");
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
}
