//import * as BABYLON from 'babylonjs';
//import * as GUI from 'babylonjs-gui';
/// <reference types="babylonjs" />
/// <reference types="babylonjs-gui" />

import { socket } from "../../game.js";
export {};

export class GameManager {
    scene: BABYLON.Scene;
    ball: BABYLON.Mesh;
    floor: BABYLON.GroundMesh;
    player1Score: number = 0;
    player2Score: number = 0;

    leftZone!: BABYLON.Mesh;
    rightZone!: BABYLON.Mesh;
    sideLeftZone!: BABYLON.Mesh;
    sideRightZone!: BABYLON.Mesh;

    scoreText: BABYLON.GUI.TextBlock;

    constructor(scene: BABYLON.Scene, pingPongBall: BABYLON.AbstractMesh, floor: BABYLON.AbstractMesh) {
        this.scene = scene;
        this.ball = pingPongBall as BABYLON.Mesh;
        this.floor = floor as BABYLON.GroundMesh;
        this.scoreText = new BABYLON.GUI.TextBlock();
        this.scoreText.text = "Score: 0";

        // Limiter la vitesse de la balle
        scene.onBeforeRenderObservable.add(() => {
            const maxSpeed = 13;
            if (this.ball.physicsImpostor) {
                const velocity = this.ball.physicsImpostor.getLinearVelocity();
                if (velocity && velocity.length() > maxSpeed) {
                    const newVelocity = velocity.normalize().scale(maxSpeed);
                    this.ball.physicsImpostor!.setLinearVelocity(newVelocity);
                }
            }
        });

        this._createGUI();
        this._initBallSuperviseur();
    }

    private _initBallSuperviseur(): void {
        socket.on("updateScore", (data: { winner: 'player1' | 'player2', player1Score: number, player2Score: number, ball: BABYLON.Vector3}) => {
            console.log("Score mis à jour :", data);
            this.player1Score = data.player1Score;
            this.player2Score = data.player2Score;
            this.ball.position = data.ball;
            if (data.winner === "player1" || data.winner === "player2") {
                this._handlePoint(data.winner);
            } else {
                console.warn("Valeur inattendue pour winner :", data.winner);
            }
        });
    }
    
    private _handlePoint(winner: 'player1' | 'player2'): void {
        if (winner === 'player1') {
            console.log("🏆 Point pour Joueur 1 !");
        } else {
            console.log("🏆 Point pour Joueur 2 !");
        }
    
        (this.ball as any).physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        (this.ball as any).physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
        this._updateUI();
        //this._resetBall(winner);
    }
    
    

    private _createGUI(): void {
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

    private _updateUI(): void {
        this.scoreText.text = `Joueur 1: ${this.player1Score} | Joueur 2: ${this.player2Score}`;
    }

}
