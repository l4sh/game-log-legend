import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  // width: 1024,
  width: window.innerWidth,
  // height: 768,
  height: window.innerHeight,

  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],

  physics: {
    default: "matter",
    matter: {
      debug: {
        lineColor: 0xff0000, // Red color for the debug box
      },
    },
  },

  scale: {
    // mode: Phaser.Scale.FIT,
    mode: Phaser.Scale.RESIZE, // dynamic aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  antialias: false,
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
