import { MeshBuilder, Vector3, StandardMaterial } from "@babylonjs/core";
import { TextBlock } from "@babylonjs/gui";
export class GameLogic {
    constructor(gameScene, player1, player2, mode) {
        this.player1Score = 0;
        this.player2Score = 0;
        this.mode = mode;
        this.scene = gameScene.scene;
        this.ball = gameScene.ball;
        this.floor = gameScene.ground;
        this.scoreText = new TextBlock();
        this.player1 = player1;
        this.player2 = player2;
        this.scoreText.text = "Score: 0";
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
        this._initBallSuperviseur();
    }
    emitToPlayers(event, data) {
        const players = [this.player1, this.player2];
        players.forEach((player, index) => {
            if (!player?.socket || !player.socket.connected) {
                console.warn(`Socket du joueur ${index + 1} est invalide ou déconnecté.`);
                return;
            }
            if (this.mode === "local" && player.username === "guest")
                return; // skip guest en local
            player.socket.emit(event, data);
        });
    }
    //TODO : souci sur les limites : bordure mal configurée 
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
    //TODO : controler le decalage entre la balle du front et la balle du back
    _initBallSuperviseur() {
        //update de la balle envoye par le client
        this.player1.socket.on("ballPositionUpdate", (pos) => {
            this.ball.position.set(pos.x, pos.y, pos.z);
            this.emitToPlayers("ballPositionUpdate", pos);
        });
        this.player2.socket.on("ballPositionUpdate", (pos) => {
            this.ball.position.set(pos.x, pos.y, pos.z);
            this.emitToPlayers("ballPositionUpdate", pos);
        });
        // point + service 
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
        this._resetBall(winner);
        const scoreData = {
            player1Score: this.player1Score,
            player2Score: this.player2Score,
            winner: winner,
            ball: this.ball.position
        };
        this.emitToPlayers("updateScore", scoreData);
    }
    _resetBall(winner) {
        const tableBox = this.floor.getBoundingInfo().boundingBox;
        const tableWidth = tableBox.maximum.x - tableBox.minimum.x;
        const tableCenter = this.floor.position;
        const ballHeight = tableBox.maximum.y + 0.5;
        const xOffset = tableWidth / 2 - 2;
        let x;
        let serveDir;
        if (winner === 'player1') {
            x = tableCenter.x + xOffset;
            serveDir = -1;
        }
        else {
            x = tableCenter.x - xOffset;
            serveDir = 1;
        }
        const z = tableCenter.z;
        this.ball.position.x = x;
        this.ball.position.y = ballHeight;
        this.ball.position.z = z;
        this.ball.physicsImpostor.setLinearVelocity(Vector3.Zero());
        this.ball.physicsImpostor.setAngularVelocity(Vector3.Zero());
    }
}
