import "./app.css";

import "@webxdc/highscores";

import GameScene from "./Scenes/GameScene";
import MenuScene from "./Scenes/MenuScene";
import Phaser from "phaser";

export const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "bejeweled-game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1440,
    height: 1920,
    backgroundColor: "#df8e73",
  },
  physics: {
    default: "arcade",
  },
  scene: [MenuScene, GameScene],
};

window.highscores.init().then(() => new Phaser.Game(config));
