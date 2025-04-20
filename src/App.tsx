import { useRef, useState, useEffect } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import { EventBus } from "./game/EventBus";


function App()
{
  const debug = true;
  // The sprite can only be moved in the MainMenu Scene
  const [canMoveSprite, setCanMoveSprite] = useState(true);

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
  const [gameState, setGameState] = useState({ isGameOver: false, score: 0, logAngle: 0, xPos: 0, yPos: 0, xInertia: 0, yInertia: 0, walkedBack: 0, walked: 0 });
  const [_, forceRender] = useState(0);

  useEffect(() => {
    const handleGameStateChange = (state: Phaser.Scene) => {
      let { isGameOver, score, xPos, yPos, xInertia, yInertia, walkedBack, walked } = state;
      let logAngle = state.log.angle;

      xInertia = Math.round(xInertia * 100) / 100;
      yInertia = Math.round(yInertia * 100) / 100;
      logAngle = Math.round(logAngle * 100) / 100;

      setGameState((prev) => {
        if (prev.isGameOver !== isGameOver || prev.score !== score || prev.logAngle !== logAngle || prev.xPos !== xPos || prev.yPos !== yPos || prev.xInertia !== xInertia || prev.yInertia !== yInertia || prev.walkedBack !== walkedBack || prev.walked !== walked) { // Added walkedBack and walked to the condition
          return { isGameOver, score, logAngle, xPos, yPos, xInertia, yInertia, walkedBack, walked }; // Update only if relevant state changes
        }
        return prev; // No update if state is unchanged
      });
    };

    EventBus.on("update-scene-state", handleGameStateChange);

    return () => {
      EventBus.off("update-scene-state", handleGameStateChange);
    };
  }, []);

  const changeScene = () => {
    // TODO: add here start game??
    if(phaserRef.current)
    {
      const scene = phaserRef.current.scene as MainMenu;

      if (scene)
      {
        scene.changeScene();
      }
    }
  }

  const moveSprite = () => {

    if(phaserRef.current)
    {

      const scene = phaserRef.current.scene as MainMenu;

      if (scene && scene.scene.key === "MainMenu")
      {
        // Get the update logo position
        scene.moveLogo(({ x, y }) => {

          setSpritePosition({ x, y });

        });
      }
    }

  }


  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {

    setCanMoveSprite(scene.scene.key !== "MainMenu");

  }

  const renderDebugPanel = () => {
    return (
      <div style={{ position: "absolute", top: 200, right: 300, zIndex: 1000, color: "red", fontWeight: "bold" }}>
        <h2>Debug:</h2>
        <div>
          <p>Is Game Over: {gameState.isGameOver ? "Yes" : "No"}</p>
          <p>Current Score: {gameState.score || 0}</p>
          <p>Log Angle: {gameState.logAngle || 0}</p>
          <p>X Position: {gameState.xPos || 0}</p>
          <p>Y Position: {gameState.yPos || 0}</p>
          <p>X Inertia: {gameState.xInertia || 0}</p>
          <p>Y Inertia: {gameState.yInertia || 0}</p>
          <p>Walked: {gameState.walked || 0}</p>
          <p>Walked Back: {gameState.walkedBack || 0}</p>

        </div>
      </div>
    )
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

      {debug && (
        renderDebugPanel()
      )}
    </div>
  )
}

export default App;
