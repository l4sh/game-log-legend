// TODO: add items that go on top of the log
// Depth here is 30

import Phaser from "phaser";

export const ITEM_PROPERTIES = {
  box_1: { score: 1 },
  box_2: { score: 2 },
  mini_log_1: { score: 3 },
  mini_log_2: { score: 3 },
} as const;

export type ItemType = keyof typeof ITEM_PROPERTIES;

export class Item {
  private item: Phaser.Physics.Matter.Image;
  multiplier: number;
  type: ItemType;

  constructor(scene: Phaser.Scene, item: ItemType, x: number, y: number) {
    const itemTexture = item;

    this.multiplier = ITEM_PROPERTIES[item]?.score || 1;
    this.type = item;

    const { width: itemWidth, height: itemHeight } = scene.textures
      .get(itemTexture)
      .get();

    this.item = scene.matter.add.image(x, y, itemTexture, undefined, {
      shape: {
        type: "rectangle",
        width: itemWidth,
        height: itemHeight,
      },
      // scale: 4,
      // ignoreGravity: true,
      frictionAir: 0.01,
      friction: 0.02,
      frictionStatic: 0,
      restitution: 0.1,
      mass: 1,
    });
    this.item.setScale(scene.entityScale); // TODO: calculate scale depending on screen size
    this.item.setDepth(30);
    // this.item.setBounce(0);
    // this.item.setMass(1);
    this.item.setOrigin(0.5, 0.5);

    this.item.setCollisionCategory(scene.collisionCategories.item);
    this.item.setCollidesWith([
      scene.collisionCategories.log,
      scene.collisionCategories.item,
    ]);
  }

  setPosition(x: number, y: number) {
    this.item.setPosition(x, y);
  }

  setAngle(angle: number) {
    this.item.setAngle(angle);
  }

  setVelocity(x: number, y: number) {
    this.item.setVelocity(x, y);
  }

  setIgnoreGravity(ignore: boolean) {
    this.item.setIgnoreGravity(ignore);
  }

  setAngularVelocity(velocity: number) {
    this.item.setAngularVelocity(velocity);
  }

  get x() {
    return this.item.x;
  }

  get y() {
    return this.item.y;
  }

  get angle() {
    return this.item.angle;
  }

  drop() {
    this.item.setIgnoreGravity(false);
  }

  destroy() {
    this.item.destroy();
  }
}

export const dropItems = (
  scene: Phaser.Scene,
  amount: number,
  itemTypes: ItemType[],
  startX: number = 0,
  endX: number = 0
) => {
  const items: Item[] = [];
  // const dropArea = endX - startX;

  for (let i = 0; i < amount; i++) {
    const itemType = Phaser.Math.RND.pick(itemTypes);
    const y = -100 * i; // Just outside the screen
    const x = Phaser.Math.Between(startX, endX); // Drop at a random x in the area
    const item = new Item(scene, itemType, x, y);
    items.push(item);
  }
  return items;
};
