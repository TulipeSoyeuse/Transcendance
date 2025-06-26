import { NullEngine, Scene, MeshBuilder, Vector3, Quaternion, FreeCamera } from "@babylonjs/core";
export class GameScene {
    constructor() {
        // NullEngine = server-side Babylon sans rendu
        this.engine = new NullEngine();
        this.scene = new Scene(this.engine);
        // Position de caméra (optionnelle ici)
        this.camera = new FreeCamera("camera", new Vector3(0, 5, -10), this.scene);
        // Création de la balle
        this.ball = MeshBuilder.CreateSphere("pingPongBall", {
            diameter: 1,
            segments: 32
        }, this.scene);
        this.ball.position = new Vector3(-13, 10, 0);
        // Paddle gauche
        this.leftPaddle = this.createPaddle("paddleLeft", new Vector3(-16, 1.5, 0), new Vector3(2, 2, 2), new Vector3(0, 0, -1), -Math.PI / 2);
        // Paddle droit
        this.rightPaddle = this.createPaddle("paddleRight", new Vector3(16, 1.5, 0), new Vector3(2, 2, 2), new Vector3(0, 0, -1), -Math.PI / 2);
    }
    createPaddle(name, position, scaling, rotationAxis, rotationAngle) {
        const paddle = MeshBuilder.CreateBox(name, {
            width: 1,
            height: 3,
            depth: 0.5
        }, this.scene);
        paddle.position = position.clone();
        paddle.scaling = scaling.clone();
        paddle.rotationQuaternion = Quaternion.RotationAxis(rotationAxis, rotationAngle);
        return paddle;
    }
    moovePaddle(playerId, direction) {
        switch (direction) {
            case "o":
                this.leftPaddle.position.z += 0.1;
            case "l":
                this.leftPaddle.position.z -= 0.1;
            case "q":
                this.rightPaddle.position.z += 0.1;
            case "w":
                this.rightPaddle.position.z -= 0.1;
        }
    }
    getSceneState() {
        return {
            ball: {
                position: this.ball.position.asArray(),
                rotationQuaternion: this.ball.rotationQuaternion ? this.ball.rotationQuaternion.toArray(new Array(4)) : null,
            },
            leftPaddle: {
                position: this.leftPaddle.position.asArray(),
                rotationQuaternion: this.leftPaddle.rotationQuaternion ? this.leftPaddle.rotationQuaternion.toArray(new Array(4)) : null,
            },
            rightPaddle: {
                position: this.rightPaddle.position.asArray(),
                rotationQuaternion: this.rightPaddle.rotationQuaternion ? this.rightPaddle.rotationQuaternion.toArray(new Array(4)) : null,
            }
        };
    }
}
