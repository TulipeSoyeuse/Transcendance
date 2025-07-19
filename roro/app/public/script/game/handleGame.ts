//import * as BABYLON from 'babylonjs';
//import * as GUI from 'babylonjs-gui';
/// <reference types="babylonjs" />
/// <reference types="babylonjs-gui" />

const player1ScoreDisplay = document.getElementById('player1ScoreDisplay') as HTMLDivElement;
const player2ScoreDisplay = document.getElementById('player2ScoreDisplay') as HTMLDivElement;
let player1ScoreValue = document.getElementById('player1ScoreValue') as HTMLSpanElement;
let player2ScoreValue = document.getElementById('player2ScoreValue') as HTMLSpanElement;

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


    constructor(scene: BABYLON.Scene, pingPongBall: BABYLON.AbstractMesh, floor: BABYLON.AbstractMesh) {
        this.scene = scene;
        this.ball = pingPongBall as BABYLON.Mesh;
        this.floor = floor as BABYLON.GroundMesh;

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
    }
    


    // TODO : remplacer player1 et player 2 par le nom de l'utilisateur
    private _updateUI(): void {
        player2ScoreValue.textContent = this.player2Score.toString();
        player1ScoreValue.textContent = this.player1Score.toString();
    }

}
