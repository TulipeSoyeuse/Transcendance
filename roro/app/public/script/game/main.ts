
import { createScene } from "./scene.js";
import { PlayerInput } from "./inputController.js";
import { GameManager } from "./handleGame.js";
import { UpdateAngleBlock } from "babylonjs";
import { socket } from "../../game.js";
//import * as BABYLON from 'babylonjs';
/// <reference types="babylonjs" />
/// <reference types="babylonjs-gui" />



function updateData(playerInput: PlayerInput) {
    socket.on("sceneUpdate", (sceneState: any) =>  {
        playerInput._updateFromServer(sceneState.leftPaddle, sceneState.rightPaddle);
    });
}

async function initScene() {

    // Récupérer le canvas
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    // Créer le moteur Babylon
    const engine = new BABYLON.Engine(canvas, true);
    const scene = await createScene(engine, canvas); 
    const playerInput = new PlayerInput(scene);  

    const ball = scene.getMeshByName("pingPongBall");
    const ground = scene.getMeshByName("ground");
    if (!ball || !ground) {
        throw new Error("Le mesh 'pingPongBall' n'a pas été trouvé !");
    }
    const gameManager = new GameManager(scene, ball, ground);


    engine.runRenderLoop(function () {
        scene.render();
    });

    //updatedata
    updateData(playerInput)

    window.addEventListener("resize", function () {
        engine.resize();
    });
}
// Appeler la fonction d'initialisation
initScene();



/**
 J'ai besoin de recup : L'orientation de la camera 
 La position du mesh raquette
 la position de la balle
 le nom des players 
 le score
 */