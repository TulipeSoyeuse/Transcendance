import { createScene } from "./scene.js";
import { PlayerInput } from "./inputController.js";
import { GameManager } from "./handleGame.js";
// import * as BABYLON from 'babylonjs';
// import Ammo from 'ammo.js';

// Récupérer le canvas
var canvas = document.getElementById("renderCanvas");

// Créer le moteur Babylon
var engine = new BABYLON.Engine(canvas, true);


async function initScene() {
    var scene = await createScene(engine, canvas); // Attendre que la scène soit créée
    const playerInput = new PlayerInput(scene);  // Choper les input du clavier

    // Compter les points et remettre le service
    const gameManager = new GameManager(scene, scene.getMeshByName("pingPongBall"), scene.getMeshByName("ground"));
    // Boucle de rendu
    engine.runRenderLoop(function () {
        scene.render(); // Appeler la méthode render de la scène
    });
    // Redimensionner le moteur
    window.addEventListener("resize", function () {
        engine.resize();
    });
}
// Appeler la fonction d'initialisation
initScene();