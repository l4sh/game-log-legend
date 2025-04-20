import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { InputManager } from "../InputManager";

import { Strongman } from "../entities/Strongman";
import { Log } from "../entities/Log";
import { Line, genLines } from "../entities/Line";

const X_INERTIA = 0.05;
const Y_INERTIA = 0.05;
const LOG_DROP_ANGLE = 20;
const Y_WALK_MIN = 0.75;
const Y_WALK_MAX = 0.85;

const MAX_WALKED_BACK = 7;

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;
  strongman: Strongman;
  log: Log;
  lines: Line[];
  inputManager: InputManager;
  xInertia: number;
  yInertia: number;
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
    this.goal = 100;
    this.walkedBack = 0;
  }

  create() {
    this.camera = this.cameras.main;

    // TODO: Handle multiple backgrounds
    const backgrounds = this.add.image(0, 0, "backgrounds").setOrigin(0, 0);
    // Scale background
    const scaleX = this.scale.width / backgrounds.width;
    const scaleY = this.scale.height / backgrounds.height;
    backgrounds.setScale(scaleX, scaleY);

    // Only use 1px of the bg
    // TODO: Add more backgrounds
    backgrounds.setCrop(0, 0, 1, backgrounds.height);
    backgrounds.setDepth(0);
    //-

    const centerX = (this.game.config.width as number) / 2;
    const centerY = (this.game.config.height as number) / 2;

    const strongmanY = centerY * 1.6;

    this.strongman = new Strongman(this, centerX, strongmanY);
    // this.strongman.playWalkAnimation();
    this.log = new Log(this, centerX, centerY, 96, 16, "log");

    // this.log = new Log(this, centerX, centerY * 1.29, 96, 16, "log");

    // Example usage
    this.log.setVelocity(0, 0);
    this.log.setIgnoreGravity(true);

    // Lines used as visual cues for front/back movement
    this.lines = genLines(this, 20, "line");

    // TODO: Add clouds??
    // TODO: Add sun??

    // Initialize input
    this.inputManager = new InputManager(this);

    EventBus.emit("current-scene-ready", this);
  }

  setGameOver() {
    this.isGameOver = true;
    this.log.drop();
    this.strongman.stopWalkAnimation();
  }

  update() {
    EventBus.emit("update-scene-state", this);

    if (this.isGameOver) {
      return; // Prevent further updates if the game is over
    }

    // sync logs
    this.log.sync(); // TODO: UNCOMMENT

    if (this.walked >= this.goal) {
      this.setGameOver();
      return;
    }

    if (this.walkedBack >= MAX_WALKED_BACK) {
      this.setGameOver();
      return;
    }

    const centerX = (this.game.config.width as number) / 2;
    const centerY = (this.game.config.height as number) / 2;

    // if (!this.isGamePaused && !this.isGameOver) {
    //   if (this.logXInertia === 0) {
    //     this.logXInertia = (Math.random() - 0.5) / 10;
    //   }

    //   this.logXInertia *= 1.01;
    //   this.log.setAngularVelocity(this.logXInertia / 100);
    // )
    if (!this.isGameOver && this.inputManager.isMovingLeft()) {
      this.xInertia -= X_INERTIA;
      // this.strongman.setPosition(this.strongman.x - 5, this.strongman.y);
      this.log.setAngularVelocity(this.xInertia / 100);
      // this.log.setAngularVelocity(-0.1);
    } else if (!this.isGameOver && this.inputManager.isMovingRight()) {
      this.xInertia += X_INERTIA;
      // this.strongman.setPosition(this.strongman.x + 5, this.strongman.y);
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

    // if (!this.isGameOver && Math.abs(this.log.angle) > 3) {
    //   this.strongman.playWalkAnimation();
    // } else {
    //   // this.strongman.stopWalkAnimation();
    // }

    const yWalkMin = (this.game.config.height as number) * Y_WALK_MIN;
    const yWalkMax = (this.game.config.height as number) * Y_WALK_MAX;
    const yWalkMiddle = (yWalkMin + yWalkMax) / 2;

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
      this.score = Math.round(this.walked) * 100;
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
