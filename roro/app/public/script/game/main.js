import { createScene } from "./scene.js";
import { PlayerInput } from "./inputController.js";
import { GameManager } from "./handleGame.js";
import { socket } from "../../game.js";
//import * as BABYLON from 'babylonjs';
/// <reference types="babylonjs" />
/// <reference types="babylonjs-gui" />
function updateData(playerInput) {
    socket.on("sceneUpdate", (sceneState) => {
        playerInput._updateFromServer(sceneState.leftPaddle, sceneState.rightPaddle, sceneState.ball);
    });
    socket.on("animationUpdate", (sceneState) => {
        playerInput._updateFromServer(sceneState.leftPaddle, sceneState.rightPaddle, sceneState.ball);
    });
}
function sendBallPositionRealtime(scene) {
    // Envoie la position toutes les 50 ms (20 fois par seconde)
    const ballMesh = scene.getMeshByName("pingPongBall");
    setInterval(() => {
        if (!ballMesh)
            return;
        const position = {
            x: ballMesh.position.x,
            y: ballMesh.position.y,
            z: ballMesh.position.z,
        };
        socket.emit("ballPositionUpdate", position);
    }, 50);
}
async function initScene() {
    // Récupérer le canvas
    const canvas = document.getElementById("renderCanvas");
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
    updateData(playerInput);
    sendBallPositionRealtime(scene);
    window.addEventListener("resize", function () {
        engine.resize();
    });
}
initScene();
/**
 J'ai besoin de recup : L'orientation de la camera
 La position du mesh raquette
 la position de la balle
 le nom des players
 le score
 */ 
