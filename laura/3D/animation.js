//import * as BABYLON from 'babylonjs';
//import Ammo from 'ammo.js';


export function animateLeftPaddle(paddle, startPosZ, onComplete) {
    if (!paddle) {
        console.error("can't find left paddle");
        if (onComplete) onComplete();
        return;
    }

    // Nettoyer les anciennes animations
    paddle.animations = [];

    const startPos = paddle.position.clone();
    startPos.z = startPosZ; // fixe la position z de départ

    const paddleAnimation = new BABYLON.Animation(
        "paddleHitAnimation",
        "position",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const forwardPos = startPos.add(new BABYLON.Vector3(3, 0, 1));

    const keys = [
        { frame: 0, value: startPos },
        { frame: 10, value: forwardPos },
        { frame: 20, value: startPos }
    ];

    paddleAnimation.setKeys(keys);
    paddle.animations.push(paddleAnimation);

    const animation = paddle.getScene().beginAnimation(paddle, 0, 20, false);

    if (!animation) {
        console.error("left paddle animation can't start");
        if (onComplete) onComplete();
        return;
    }

    animation.onAnimationEnd = () => {
        if (onComplete) onComplete();
    };
}

export function animateRightPaddle(paddle, startPosZ, onComplete) {
    if (!paddle) {
        console.error("can't find right paddle.");
        if (onComplete) onComplete();
        return;
    }
    paddle.animations = [];

    const startPos = paddle.position.clone();
    startPos.z = startPosZ; 

    const paddleAnimation = new BABYLON.Animation(
        "paddleHitAnimation",
        "position",
        30,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const forwardPos = startPos.add(new BABYLON.Vector3(-3, 0, 1));

    const keys = [
        { frame: 0, value: startPos },
        { frame: 10, value: forwardPos },
        { frame: 20, value: startPos }
    ];

    paddleAnimation.setKeys(keys);
    paddle.animations.push(paddleAnimation);

    const animation = paddle.getScene().beginAnimation(paddle, 0, 20, false);

    if (!animation) {
        console.error("right paddle animation can't start");
        if (onComplete) onComplete();
        return;
    }

    animation.onAnimationEnd = () => {
        if (onComplete) onComplete();
    };
}

