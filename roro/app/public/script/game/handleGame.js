//import * as BABYLON from 'babylonjs';
//import * as GUI from 'babylonjs-gui';
/// <reference types="babylonjs" />
/// <reference types="babylonjs-gui" />
import { socket } from "../../game.js";
export class GameManager {
    constructor(scene, pingPongBall, floor) {
        this.player1Score = 0;
        this.player2Score = 0;
        this.scene = scene;
        this.ball = pingPongBall;
        this.floor = floor;
        this.scoreText = new BABYLON.GUI.TextBlock();
        this.scoreText.text = "Score: 0";
        // Limiter la vitesse de la balle
        scene.onBeforeRenderObservable.add(() => {
            const maxSpeed = 13;
            if (this.ball.physicsImpostor) {
                const velocity = this.ball.physicsImpostor.getLinearVelocity();
                if (velocity && velocity.length() > maxSpeed) {
                    const newVelocity = velocity.normalize().scale(maxSpeed);
                    this.ball.physicsImpostor.setLinearVelocity(newVelocity);
                }
            }
        });
        this._createGUI();
        this._initBallSuperviseur();
    }
    _initBallSuperviseur() {
        socket.on("updateScore", (data) => {
            console.log("Score mis à jour :", data);
            this.player1Score = data.player1Score;
            this.player2Score = data.player2Score;
            this.ball.position = data.ball;
            if (data.winner === "player1" || data.winner === "player2") {
                this._handlePoint(data.winner);
            }
            else {
                console.warn("Valeur inattendue pour winner :", data.winner);
            }
        });
    }
    _handlePoint(winner) {
        if (winner === 'player1') {
            console.log("🏆 Point pour Joueur 1 !");
        }
        else {
            console.log("🏆 Point pour Joueur 2 !");
        }
        this.ball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.ball.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        this._updateUI();
        //this._resetBall(winner);
    }
    _createGUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.scoreText = new BABYLON.GUI.TextBlock();
        this.scoreText.text = "Joueur 1: 0 | Joueur 2: 0";
        this.scoreText.color = "white";
        this.scoreText.fontFamily = "Verdana";
        this.scoreText.fontSize = 24;
        this.scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.scoreText.left = "10px";
        this.scoreText.top = "10px";
        advancedTexture.addControl(this.scoreText);
    }
    _updateUI() {
        this.scoreText.text = `Joueur 1: ${this.player1Score} | Joueur 2: ${this.player2Score}`;
    }
}
