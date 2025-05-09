import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    // TODO:: Load these in the entities themselves??
    this.load.image("backgrounds", "backgrounds.png");
    this.load.image("log", "log.png");
    this.load.image("strongman-top", "strongman-top.png");
    this.load.spritesheet("strongman-bottom", "strongman-bottom.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image("line", "line.png");

    this.load.image("box_1", "box_1.png");
    this.load.image("box_2", "box_2.png");
    this.load.image("mini_log_1", "mini_log_1.png");
    this.load.image("mini_log_2", "mini_log_2.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
