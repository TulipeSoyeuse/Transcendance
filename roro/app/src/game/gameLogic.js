import { MeshBuilder, Vector3, StandardMaterial } from "@babylonjs/core";
import { TextBlock } from "@babylonjs/gui";
export class GameLogic {
    constructor(gameScene, player1, player2) {
        this.player1Score = 0;
        this.player2Score = 0;
        this.scene = gameScene.scene;
        this.ball = gameScene.ball;
        this.floor = gameScene.ground;
        this.scoreText = new TextBlock();
        this.player1 = player1;
        this.player2 = player2;
        this.scoreText.text = "Score: 0";
        // Limiter la vitesse de la balle
        this.scene.onBeforeRenderObservable.add(() => {
            const maxSpeed = 13;
            if (this.ball.physicsImpostor) {
                const velocity = this.ball.physicsImpostor.getLinearVelocity();
                if (velocity && velocity.length() > maxSpeed) {
                    const newVelocity = velocity.normalize().scale(maxSpeed);
                    this.ball.physicsImpostor.setLinearVelocity(newVelocity);
                }
            }
        });
        this._createLimits();
        // this._createGUI();
        this._initBallSuperviseur();
    }
    _createLimits() {
        const box = this.floor.getBoundingInfo().boundingBox;
        const width = box.maximum.x - box.minimum.x;
        const length = box.maximum.z - box.minimum.z;
        const center = this.floor.position;
        const zoneThickness = 0.2;
        const extraMargin = 0.5;
        const yPos = center.y + zoneThickness / 2;
        // Helpers
        const createInvisibleMat = (name) => {
            const mat = new StandardMaterial(name, this.scene);
            mat.alpha = 0;
            return mat;
        };
        const createZone = (name, options, position, material) => {
            const zone = MeshBuilder.CreateBox(name, options, this.scene);
            zone.position = position;
            zone.material = material;
            zone.isPickable = false;
            return zone;
        };
        const matLeft = createInvisibleMat("matLeft");
        const matRight = createInvisibleMat("matRight");
        const matSideLeft = createInvisibleMat("matSideLeft");
        const matSideRight = createInvisibleMat("matSideRight");
        this.leftZone = createZone("leftZone", { width: width + 2 * extraMargin, height: zoneThickness, depth: 1 }, new Vector3(center.x, yPos, center.z - length / 2 - 0.5), matLeft);
        this.rightZone = this.leftZone.clone("rightZone");
        this.rightZone.position.z = center.z + length / 2 + 0.5;
        this.rightZone.material = matRight;
        this.sideLeftZone = createZone("sideLeftZone", { width: 1, height: zoneThickness, depth: length + 2 * extraMargin }, new Vector3(center.x - width / 2 - 0.5, yPos, center.z), matSideLeft);
        this.sideRightZone = this.sideLeftZone.clone("sideRightZone");
        this.sideRightZone.position.x = center.x + width / 2 + 0.5;
        this.sideRightZone.material = matSideRight;
    }
    _initBallSuperviseur() {
        // 1. Écoute les positions de la balle envoyées par le client
        this.player1.socket.on("ballPositionUpdate", (pos) => {
            this.ball.position.set(pos.x, pos.y, pos.z);
        });
        // 2. Vérifie les collisions à chaque frame
        this.scene.registerBeforeRender(() => {
            if (this.ball.intersectsMesh(this.leftZone, false)) {
                this._handlePointLoss('player2');
            }
            else if (this.ball.intersectsMesh(this.rightZone, false)) {
                this._handlePointLoss('player1');
            }
            else if (this.ball.intersectsMesh(this.sideLeftZone, false)) {
                this._handlePointLoss('player2');
            }
            else if (this.ball.intersectsMesh(this.sideRightZone, false)) {
                this._handlePointLoss('player1');
            }
        });
    }
    _handlePointLoss(losingPlayer) {
        let winner;
        if (losingPlayer === 'player1') {
            this.player2Score++;
            winner = 'player2';
        }
        else {
            this.player1Score++;
            winner = 'player1';
        }
        const scoreData = {
            player1Score: this.player1Score,
            player2Score: this.player2Score,
            winner: winner
        };
        this.player1.socket.emit("updateScore", scoreData);
    }
}
