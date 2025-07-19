import { GameScene } from "./scene.js";
import { NullEngine, Scene, MeshBuilder, Vector3, Quaternion, FreeCamera, Mesh, Animation, StandardMaterial } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import { Player } from "../../includes/custom.js";


export class GameLogic {
    player1: Player;
    player2: Player;
    scene: Scene;
    ball: Mesh;
    floor: Mesh;
    player1Score: number = 0;
    player2Score: number = 0;

    leftZone!: Mesh;
    rightZone!: Mesh;
    sideLeftZone!: Mesh;
    sideRightZone!: Mesh;

    scoreText: TextBlock;

    constructor(gameScene: GameScene, player1: Player, player2: Player) {
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
                    this.ball.physicsImpostor!.setLinearVelocity(newVelocity);
                }
            }
        });

        this._createLimits();
        this._initBallSuperviseur();
    }

    //TODO : souci sur les limites : bordure mal configurée 
    private _createLimits(): void {
        const box = this.floor.getBoundingInfo().boundingBox;
        const width = box.maximum.x - box.minimum.x;
        const length = box.maximum.z - box.minimum.z;
        const center = this.floor.position;

        const zoneThickness = 0.2;
        const extraMargin = 0.5;
        const yPos = center.y + zoneThickness / 2;

        // Helpers
        const createInvisibleMat = (name: string): StandardMaterial => {
            const mat = new StandardMaterial(name, this.scene);
            mat.alpha = 0;
            return mat;
        };

        const createZone = (
            name: string,
            options: { width: number, height: number, depth: number },
            position: Vector3,
            material: StandardMaterial
        ): Mesh => {
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

        this.leftZone = createZone(
            "leftZone",
            { width: width + 2 * extraMargin, height: zoneThickness, depth: 1 },
            new Vector3(center.x, yPos, center.z - length / 2 - 0.5),
            matLeft
        );

        this.rightZone = this.leftZone.clone("rightZone");
        this.rightZone.position.z = center.z + length / 2 + 0.5;
        this.rightZone.material = matRight;

        this.sideLeftZone = createZone(
            "sideLeftZone",
            { width: 1, height: zoneThickness, depth: length + 2 * extraMargin },
            new Vector3(center.x - width / 2 - 0.5, yPos, center.z),
            matSideLeft
        );

        this.sideRightZone = this.sideLeftZone.clone("sideRightZone");
        this.sideRightZone.position.x = center.x + width / 2 + 0.5;
        this.sideRightZone.material = matSideRight;
    }

    //TODO : controler le decalage entre la balle du front et la balle du back
    private _initBallSuperviseur(): void {
        //update de la balle envoye par le client
        this.player1.socket.on("ballPositionUpdate", (pos: { x: number; y: number; z: number }) => {
            this.ball.position.set(pos.x, pos.y, pos.z);
        });
    
        // point + service 
        this.scene.registerBeforeRender(() => {
            if (this.ball.intersectsMesh(this.leftZone, false)) {
                this._handlePointLoss('player2');
            } else if (this.ball.intersectsMesh(this.rightZone, false)) {
                this._handlePointLoss('player1');
            } else if (this.ball.intersectsMesh(this.sideLeftZone, false)) {
                this._handlePointLoss('player2');
            } else if (this.ball.intersectsMesh(this.sideRightZone, false)) {
                this._handlePointLoss('player1');
            }
        });
    }

    private _handlePointLoss(losingPlayer: 'player1' | 'player2'): void {
        let winner: 'player1' | 'player2';
        if (losingPlayer === 'player1') {
            this.player2Score++;
            winner = 'player2';
        } else {
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

        this.player1.socket.emit("updateScore", scoreData);
    }


    private _resetBall(winner: 'player1' | 'player2'): void {
        const tableBox = this.floor.getBoundingInfo().boundingBox;
        const tableWidth = tableBox.maximum.x - tableBox.minimum.x;
        const tableCenter = this.floor.position;
        const ballHeight = tableBox.maximum.y + 0.5;

        const xOffset = tableWidth / 2 - 2;

        let x: number;
        let serveDir: number;

        if (winner === 'player1') {
            x = tableCenter.x + xOffset;
            serveDir = -1;
        } else {
            x = tableCenter.x - xOffset;
            serveDir = 1;
        }

        const z = tableCenter.z;

        this.ball.position.x = x;
        this.ball.position.y = ballHeight;
        this.ball.position.z = z;

        (this.ball as any).physicsImpostor.setLinearVelocity(Vector3.Zero());
        (this.ball as any).physicsImpostor.setAngularVelocity(Vector3.Zero());

    }

}