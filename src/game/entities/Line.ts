import Phaser from "phaser";

export class Line {
  private line: Phaser.GameObjects.Image;
  private lineArea: number;
  private offsetY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    lineArea: number = 0,
    offsetY: number = 0
  ) {
    this.line = scene.add.image(x, y, texture);
    this.line.setOrigin(0.5, 0.5);
    this.line.setDepth(1);
    this.lineArea = lineArea;
    this.offsetY = offsetY;
  }

  setPosition(x: number, y: number) {
    this.line.setPosition(x, y);
  }

  moveBy(offsetX: number, offsetY: number) {
    // Move line by a certain offset
    this.line.x += offsetX;
    this.line.y += offsetY;

    if (this.line.y > this.lineArea + this.offsetY) {
      this.line.y = this.offsetY;
    } else if (this.line.y < this.offsetY) {
      this.line.y = this.lineArea + this.offsetY;
    }
  }

  setVisible(visible: boolean) {
    this.line.setVisible(visible);
  }

  get x() {
    return this.line.x;
  }

  get y() {
    return this.line.y;
  }

  destroy() {
    this.line.destroy();
  }
}

export const genLines = (
  scene: Phaser.Scene,
  amount: number,
  lineTexture: string
) => {
  lineTexture = lineTexture || "line";
  const lines: Line[] = [];
  const lineArea = scene.scale.height / 2;
  const offsetY = lineArea * 1.3;

  for (let i = 0; i < amount; i++) {
    const x = Phaser.Math.Between(0, scene.scale.width);
    // Lines are only drawn in the lower part of the screen
    const y = (lineArea / amount) * i + offsetY;
    const line = new Line(scene, x, y, lineTexture, lineArea, offsetY);
    lines.push(line);
  }
  return lines;
};
