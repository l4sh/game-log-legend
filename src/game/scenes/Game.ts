import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { InputManager } from "../InputManager";

import { Strongman } from "../entities/Strongman";
import { Log } from "../entities/Log";
import { Line, genLines } from "../entities/Line";
import { Item, dropItems } from "../entities/Item";
import type { ItemType } from "../entities/Item";

import { GridLayout } from "../../GridLayout";

const X_INERTIA = 0.05;
const Y_INERTIA = 0.05;
const LOG_DROP_ANGLE = 20;
const Y_WALK_MIN_ROW = 19;
const Y_WALK_MID_ROW = 20;
const Y_WALK_MAX_ROW = 24;

const MAX_WALKED_BACK = 7;
const DROP_ITEM_EVERY_N_STEPS = 30; // in ms
const BONUS_EVERY_N_STEPS = 10; // in ms
const SCORE_MULTIPLIER = 10;
const BONUS_MULTIPLIER = 100;

const Y_STRONGMAN_ROW = 20;
const Y_LINE_START_ROW = 15;
const Y_LINE_END_ROW = 24;
const Y_LOG_ROW = 13;

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;
  strongman: Strongman;
  log: Log;
  lines: Line[];
  items: Item[];
  lastItemDropAt: number = 0;
  lastBonusAt: number = 0;
  lastScoreAt: number = 0;
  // Object with key as string and value as collision category
  collisionCategories: Record<string, number>;
  inputManager: InputManager;
  xInertia: number;
  yInertia: number;

  entityScale: number;
  isGamePaused: boolean;
  isGameOver: boolean;

  isMovingForward: boolean;
  isMovingBackward: boolean;
  isMovingLeft: boolean;
  isMovingRight: boolean;

  // Game state
  score: number;
  // Distance walked
  walked: number;
  // Goal distance
  goal: number;
  // Distance walked back
  // If too long the game is over
  walkedBack: number;

  gridLayout: GridLayout;

  constructor() {
    super("Game");
    this.xInertia = 0;
    this.yInertia = 0;
    this.isGamePaused = false;
    this.isGameOver = false;

    this.isMovingForward = false;
    this.isMovingBackward = false;
    this.isMovingLeft = false;
    this.isMovingRight = false;

    this.score = 0;
    this.walked = 0;
    this.goal = 1000;
    this.walkedBack = 0;
    this.collisionCategories = {};
    this.items = [];
    this.lines = [];
    this.lastItemDropAt = 0;
    this.entityScale = 1;
  }

  setInitialState() {
    this.xInertia = 0;
    this.yInertia = 0;
    this.isGamePaused = false;
    this.isGameOver = false;

    this.isMovingForward = false;
    this.isMovingBackward = false;
    this.isMovingLeft = false;
    this.isMovingRight = false;

    this.score = 0;
    this.walked = 0;
    this.goal = 1000;
    this.walkedBack = 0;
  }

  create() {
    this.setInitialState();

    this.gridLayout = new GridLayout(
      16,
      24,
      this.game.config.width as number,
      this.game.config.height as number
    );

    // this.matter.world.createDebugGraphic();
    // this.matter.world.drawDebug = true;

    // Initialize collision categories
    ["strongman", "log", "item", "obstacle"].forEach((category) => {
      this.collisionCategories[category] = this.matter.world.nextCategory();
    });

    this.camera = this.cameras.main;

    // TODO: Handle multiple backgrounds
    this.background = this.add.image(0, 0, "backgrounds").setOrigin(0, 0);
    // Scale background
    const scaleX = this.scale.width / this.background.width;
    const scaleY = this.scale.height / this.background.height;
    this.entityScale = scaleY; // Entities are scaled based on the height of the background

    this.background.setScale(scaleX, scaleY);

    // Only use 1px of the bg
    // TODO: Add more backgrounds
    this.background.setCrop(0, 0, 1, this.background.height);
    this.background.setDepth(0);
    //-

    this.strongman = new Strongman(
      this,
      this.gridLayout.centerX,
      this.gridLayout.row(Y_STRONGMAN_ROW)
    );

    this.log = new Log(
      this,
      this.gridLayout.centerX,
      this.gridLayout.row(Y_LOG_ROW),
      this.strongman.topheight // center mass Y
    );

    this.log.setVelocity(0, 0);
    this.log.setIgnoreGravity(true);

    // Lines used as visual cues for front/back movement

    this.lines = genLines(
      this,
      20,
      "line",
      this.gridLayout.row(Y_LINE_START_ROW),
      this.gridLayout.row(Y_LINE_END_ROW)
    );

    // Initialize input
    this.inputManager = new InputManager(this);

    // Resize background on game window rezise
    this.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      const width = gameSize.width;
      const height = gameSize.height;

      const scaleX = width / this.background.width;
      const scaleY = height / this.background.height;
      this.background.setScale(scaleX, scaleY);
    });

    this.matter.world.on("collisionstart", (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        console.log("Collision detected between bodies:", bodyA, bodyB);
      });
    });

    // TODO: resize strongman, log, items on resize??

    EventBus.emit("current-scene-ready", this);
  }

  setGameOver() {
    this.isGameOver = true;
    this.log.drop();
    this.strongman.stopWalkAnimation();

    // Wait 3 seconds and then change scene to "GameOver" scene
    setTimeout(() => {
      this.scene.start("GameOver", {
        score: this.score,
        walked: this.walked,
      });
    }, 1000);
  }

  checkAndDropItems() {
    if (this.lastItemDropAt + DROP_ITEM_EVERY_N_STEPS > this.walked) {
      return;
    }

    const logStartX = this.log.x - this.log.width / 2;
    const logEndX = logStartX + this.log.width;

    const items = dropItems(
      this,
      1,
      ["box_1", "box_2", "mini_log_1", "mini_log_2"],
      logStartX,
      logEndX
    );
    this.items = [...this.items, ...items];
    this.lastItemDropAt = this.walked;
  }

  checkAndDiscardItems() {
    this.items.forEach((item) => {
      // Check if the item is out of bounds
      if (item.y > this.gridLayout.screenHeight + 2) {
        const penalization = item.multiplier * 100;
        this.score -= penalization;

        EventBus.emit("item-dropped", penalization);
        item.destroy();
        this.items = this.items.filter((i) => i !== item);
        console.log("Item dropped:", item.type, penalization);
      }
    });
  }

  checkAndApplyScore() {
    const walked = Math.floor(this.walked);
    if (walked <= this.lastScoreAt) {
      return;
    }

    this.lastScoreAt = walked;
    this.score += 1 * SCORE_MULTIPLIER;
    console.log("Current score:", this.score);
    if (this.lastBonusAt + BONUS_EVERY_N_STEPS > walked) {
      return;
    }
    // Calculate bonus depending on items carried
    // summ all items multipliers
    const totalMultiplier = this.items.reduce(
      (acc, item) => acc + item.multiplier,
      0
    );

    const bonus = BONUS_MULTIPLIER * totalMultiplier;
    this.score += bonus;

    EventBus.emit("bonus-applied", bonus);
    this.lastBonusAt = this.walked;
    console.log("Bonus applied:", bonus);
  }

  update() {
    EventBus.emit("update-scene-state", this);

    // Sync logs, this needs to be at the very top to avoid logs out of sync on game over
    this.log.sync();

    if (this.isGameOver) {
      return; // Prevent further updates if the game is over
    }

    this.checkAndDropItems();

    // sync logs

    this.checkAndApplyScore();

    // TODO: add goal and levels later??
    // if (this.walked >= this.goal) {
    //   this.setGameOver();
    //   return;
    // }

    if (this.walkedBack >= MAX_WALKED_BACK) {
      this.setGameOver();
      return;
    }
    if (!this.isGameOver) {
      // Even if cursors are not pressed the log should keep moving
      if (this.xInertia === 0) {
        this.xInertia = (Math.random() - 0.5) / 10;
      }

      this.xInertia *= 1.01;
      this.log.setAngularVelocity(this.xInertia / 100);
    }

    if (!this.isGameOver && this.inputManager.isMovingLeft()) {
      this.xInertia -= X_INERTIA;
      this.log.setAngularVelocity(this.xInertia / 100);
    } else if (!this.isGameOver && this.inputManager.isMovingRight()) {
      this.xInertia += X_INERTIA;
      this.log.setAngularVelocity(this.xInertia / 100);
    }

    if (!this.isGameOver && this.inputManager.isMovingUp()) {
      this.yInertia -= Y_INERTIA;
      this.strongman.setPosition(this.strongman.x, this.strongman.y - 0.5);
      this.log.setPosition(this.log.x, this.log.y - 0.5);
    } else if (!this.isGameOver && this.inputManager.isMovingDown()) {
      this.yInertia += Y_INERTIA;
      this.strongman.setPosition(this.strongman.x, this.strongman.y + 0.5);
      this.log.setPosition(this.log.x, this.log.y + 0.5);
    }

    if (!this.isGameOver) {
      this.strongman.setTopRotation(this.log.angle);
      const Xposition = this.log.x + this.log.angle * 0.05;

      this.strongman.setPosition(Xposition, this.strongman.y);
      this.log.setPosition(Xposition, this.log.y);
    }

    const yWalkMin = this.gridLayout.row(Y_WALK_MIN_ROW);
    const yWalkMax = this.gridLayout.row(Y_WALK_MAX_ROW);
    // const yWalkMiddle = (yWalkMin + yWalkMax) / 2;
    const yWalkMiddle = this.gridLayout.row(Y_WALK_MID_ROW);

    if (!this.isGameOver) {
      if (this.strongman.y < yWalkMiddle - 3) {
        this.isMovingForward = true;
        this.isMovingBackward = false;
      } else if (this.strongman.y > yWalkMiddle + 3) {
        this.isMovingBackward = true;
        this.isMovingForward = false;
      } else {
        this.isMovingBackward = false;
        this.isMovingForward = false;
      }

      if (
        Math.abs(this.log.angle) > 3 ||
        this.isMovingBackward ||
        this.isMovingForward
      ) {
        this.strongman.playWalkAnimation();
      } else {
        this.strongman.stopWalkAnimation();
      }
    }

    if (this.isMovingForward) {
      this.lines.forEach((line) => {
        line.moveBy(0, -this.yInertia);
      });
      const step = Math.abs(this.yInertia) / 10;
      this.walked += step;
      this.walkedBack = Math.max(0, this.walkedBack - step); // Consider cases where walked forth and back but back is larger
    } else if (this.isMovingBackward) {
      this.lines.forEach((line) => {
        line.moveBy(0, -this.yInertia);
      });
      const step = Math.abs(this.yInertia) / 10;
      this.walked -= step;
      this.walkedBack += step;
    }

    if (
      !this.isGameOver &&
      (this.strongman.y < yWalkMin || this.strongman.y > yWalkMax)
    ) {
      this.setGameOver();
    }

    if (!this.isGameOver && Math.abs(this.log.angle) > LOG_DROP_ANGLE) {
      this.setGameOver();
    }
  }
  changeScene() {
    this.scene.start("GameOver");
  }
}
