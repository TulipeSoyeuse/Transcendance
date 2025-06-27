import { socket } from "../../game.js";
// import * as BABYLON from 'babylonjs';
/// <reference types="babylonjs" />
/// <reference types="babylonjs-gui" />
export class PlayerInput {
    constructor(scene) {
        scene.actionManager = new BABYLON.ActionManager(scene);
        this.Scene = scene;
        this.inputMap = {};
        this.leftStartZ = null;
        this.rightStartZ = null;
        this.leftAnimating = false;
        this.rightAnimating = false;
        this.ballAnimating = false;
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = true;
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = false;
        }));
        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard(scene);
        });
    }
    _updateFromKeyboard(scene) {
        const leftPaddle = scene.getMeshByName("paddleLeft_hitbox");
        const rightPaddle = scene.getMeshByName("paddleRight_hitbox");
        // Initialiser la position de départ une seule fois
        if (leftPaddle && this.leftStartZ === null) {
            this.leftStartZ = leftPaddle.position.z;
        }
        if (rightPaddle && this.rightStartZ === null) {
            this.rightStartZ = rightPaddle.position.z;
        }
        if (this.inputMap["o"] && leftPaddle) {
            console.log("j'appui mdr");
            //leftPaddle.position.z += 0.1;
            socket.emit("keyPressed", {
                key: "o",
                position: {
                    x: leftPaddle.position.x,
                    y: leftPaddle.position.y,
                    z: leftPaddle.position.z
                }
            });
        }
        if (this.inputMap["l"] && leftPaddle) {
            //leftPaddle.position.z -= 0.1;
            socket.emit("keyPressed", {
                key: "l",
                position: {
                    x: leftPaddle.position.x,
                    y: leftPaddle.position.y,
                    z: leftPaddle.position.z
                }
            });
        }
        if (this.inputMap["q"] && rightPaddle) {
            //rightPaddle.position.z += 0.1;
            socket.emit("keyPressed", {
                key: "q",
                position: {
                    x: rightPaddle.position.x,
                    y: rightPaddle.position.y,
                    z: rightPaddle.position.z
                }
            });
        }
        if (this.inputMap["w"] && rightPaddle) {
            //rightPaddle.position.z -= 0.1;
            socket.emit("keyPressed", {
                key: "w",
                position: {
                    x: leftPaddle.position.x,
                    y: leftPaddle.position.y,
                    z: leftPaddle.position.z
                }
            });
        }
        // if (this.inputMap["p"] && leftPaddle && !this.leftAnimating) {
        //     //this.leftAnimating = true;
        //     animateLeftPaddle(leftPaddle, () => {
        //         this.leftAnimating = false;
        //     });
        // }
        // if (this.inputMap["d"] && rightPaddle && !this.rightAnimating) {
        //     //this.rightAnimating = true;
        //     animateRightPaddle(rightPaddle, () => {
        //         this.rightAnimating = false;
        //     });
        // }
        // if (this.inputMap["s"] && !this.ballAnimating) {
        //     const ball = scene.getMeshByName("pingPongBall") as BABYLON.Mesh;
        //     if (ball) {
        //         this.ballAnimating = true;
        //         serveBall(ball, scene, () => {
        //             this.ballAnimating = false;
        //         });
        //     }
        // }
    }
    _updateFromServer(leftPaddle, rightPaddle) {
        const _left = this.Scene.getMeshByName("paddleLeft_hitbox");
        const _right = this.Scene.getMeshByName("paddleRight_hitbox");
        console.log("leftPaddle", leftPaddle);
        console.log("rightPaddle", rightPaddle);
        if (_left && leftPaddle?.position) {
            _left.position.x = leftPaddle.position[0];
            _left.position.y = leftPaddle.position[1];
            _left.position.z = leftPaddle.position[2];
        }
        if (_right && rightPaddle?.position) {
            _right.position.x = rightPaddle.position[0];
            _right.position.y = rightPaddle.position[1];
            _right.position.z = rightPaddle.position[2];
        }
    }
}
