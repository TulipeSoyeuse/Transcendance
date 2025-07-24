//import * as BABYLON from 'babylonjs';
//import * as GUI from 'babylonjs-gui';
/// <reference types="babylonjs" />
/// <reference types="babylonjs-gui" />
const player1ScoreDisplay = document.getElementById('player1ScoreDisplay');
const player2ScoreDisplay = document.getElementById('player2ScoreDisplay');
let player1ScoreValue = document.getElementById('player1ScoreValue');
let player2ScoreValue = document.getElementById('player2ScoreValue');
import { socket } from "../../game.js";
export class GameManager {
    constructor(scene, pingPongBall, floor) {
        this.player1Score = 0;
        this.player2Score = 0;
        this.scene = scene;
        this.ball = pingPongBall;
        this.floor = floor;
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
    }
    // TODO : remplacer player1 et player 2 par le nom de l'utilisateur
    _updateUI() {
        player2ScoreValue.textContent = this.player2Score.toString();
        player1ScoreValue.textContent = this.player1Score.toString();
    }
}
