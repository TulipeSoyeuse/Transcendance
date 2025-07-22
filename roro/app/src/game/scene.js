import { NullEngine, Scene, MeshBuilder, Vector3, Quaternion, FreeCamera, Animation, PhysicsImpostor } from "@babylonjs/core";
import { AmmoJSPlugin } from "@babylonjs/core";
import Ammo from 'ammojs-typed';
export class GameScene {
    constructor() {
        // NullEngine = server-side Babylon sans rendu
        this.engine = new NullEngine();
        this.scene = new Scene(this.engine);
        this.leftAnimating = false;
        this.RightAnimating = false;
    }
    emitToPlayers(player1, player2, event, data) {
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
    //TODO : trouver une plus jolie maniere de faire ca 
    static async create() {
        const instance = new GameScene();
        instance.camera = new FreeCamera("camera", new Vector3(0, 5, -10), instance.scene);
        await instance.initializePhysics();
        console.log("Physics initialized, setting up scene...");
        instance.ground = MeshBuilder.CreateGround("ground", { width: 30, height: 20 }, instance.scene);
        instance.ball = MeshBuilder.CreateSphere("pingPongBall", {
            diameter: 1,
            segments: 32
        }, instance.scene);
        instance.ball.position = new Vector3(-13, 10, 0);
        instance.leftPaddle = instance.createPaddle("paddleLeft", new Vector3(-16, 1.5, 0), new Vector3(2, 2, 2), new Vector3(0, 0, -1), -Math.PI / 2);
        instance.rightPaddle = instance.createPaddle("paddleRight", new Vector3(16, 1.5, 0), new Vector3(2, 2, 2), new Vector3(0, 0, -1), -Math.PI / 2);
        instance.ball.physicsImpostor = new PhysicsImpostor(instance.ball, PhysicsImpostor.SphereImpostor, { mass: 0.40, restitution: 0.9 }, instance.scene);
        instance.ground.physicsImpostor = new PhysicsImpostor(instance.ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 }, instance.scene);
        instance.leftPaddle.physicsImpostor = new PhysicsImpostor(instance.leftPaddle, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, instance.scene);
        instance.rightPaddle.physicsImpostor = new PhysicsImpostor(instance.rightPaddle, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, instance.scene);
        instance.engine.runRenderLoop(() => {
            instance.scene.render();
        });
        return instance;
    }
    createPaddle(name, position, scaling, rotationAxis, rotationAngle) {
        const scaleFactor = 0.8;
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
    moovePaddle(playerId, direction, player1, player2) {
        switch (direction) {
            // paddle moove
            case "o":
                this.leftPaddle.position.z += 0.1;
                break;
            case "l":
                this.leftPaddle.position.z -= 0.1;
                break;
            case "q":
                this.rightPaddle.position.z += 0.1;
                break;
            case "w":
                this.rightPaddle.position.z -= 0.1;
                break;
            // paddle shoot
            case "p":
                if (!this.leftAnimating) {
                    this.leftAnimating = true;
                    this.animateLeftPaddle(player1, player2, () => {
                        this.leftAnimating = false;
                    });
                }
                break;
            case "d":
                if (!this.RightAnimating) {
                    this.RightAnimating = true;
                    this.animateRightPaddle(player1, player2, () => {
                        this.RightAnimating = false;
                    });
                }
                break;
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
    animateLeftPaddle(player1, player2, onComplete) {
        if (!this.leftPaddle) {
            console.error("Left paddle doesn't exist");
            if (onComplete)
                onComplete();
            return;
        }
        this.leftPaddle.animations = [];
        const startPos = this.leftPaddle.position.clone();
        const forwardPos = startPos.add(new Vector3(3, 0, 1));
        const animation = new Animation("paddleHitAnimation", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys([
            { frame: 0, value: startPos },
            { frame: 10, value: forwardPos },
            { frame: 20, value: startPos }
        ]);
        this.leftPaddle.animations.push(animation);
        const anim = this.scene.beginAnimation(this.leftPaddle, 0, 20, false);
        const observable = this.scene.onBeforeRenderObservable.add(() => {
            const sceneState = this.getSceneState();
            this.emitToPlayers(player1, player2, "animationUpdate", sceneState);
        });
        anim.onAnimationEnd = () => {
            this.scene.onBeforeRenderObservable.remove(observable);
            if (onComplete)
                onComplete();
        };
    }
    animateRightPaddle(player1, player2, onComplete) {
        if (!this.rightPaddle) {
            console.error("Left paddle doesn't exist");
            if (onComplete)
                onComplete();
            return;
        }
        this.rightPaddle.animations = [];
        const startPos = this.rightPaddle.position.clone();
        const forwardPos = startPos.add(new Vector3(-3, 0, 1));
        const animation = new Animation("paddleHitAnimation", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys([
            { frame: 0, value: startPos },
            { frame: 10, value: forwardPos },
            { frame: 20, value: startPos }
        ]);
        this.rightPaddle.animations.push(animation);
        const anim = this.scene.beginAnimation(this.rightPaddle, 0, 20, false);
        const observable = this.scene.onBeforeRenderObservable.add(() => {
            const sceneState = this.getSceneState();
            this.emitToPlayers(player1, player2, "animationUpdate", sceneState);
        });
        anim.onAnimationEnd = () => {
            this.scene.onBeforeRenderObservable.remove(observable);
            if (onComplete)
                onComplete();
        };
    }
    async initializePhysics() {
        try {
            const ammo = await Ammo(); // Charger Ammo.js
            const ammoPlugin = new AmmoJSPlugin(true, ammo); // Crer le plugin Ammo.js
            this.scene.enablePhysics(new Vector3(0, -9.81, 0), ammoPlugin); // Activer la physique avec la gravite
            console.log("Physics engine initialized successfully with Ammo.js");
        }
        catch (error) {
            console.error("Failed to initialize Ammo.js", error);
            throw new Error("Physics initialization failed");
        }
    }
}
