import Phaser from "phaser";

export class InputManager {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene) {
    // Keyboard
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // TODO: Add mouse?
    // TODO: Add touch?
    // TODO: Add gyroscope?
  }

  isMovingLeft(): boolean {
    return this.cursors.left.isDown || this.wasd.left.isDown;
  }

  isMovingRight(): boolean {
    return this.cursors.right.isDown || this.wasd.right.isDown;
  }

  isMovingUp(): boolean {
    return this.cursors.up.isDown || this.wasd.up.isDown;
  }

  isMovingDown(): boolean {
    return this.cursors.down.isDown || this.wasd.down.isDown;
  }

  isStopping(): boolean {
    return this.cursors.space.isDown;
  }
}
