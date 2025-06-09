// import * as BABYLON from 'babylonjs';
// import Ammo from 'ammo.js';

export var setPhysicImpostor = function (pingPongBall, ground, groundMaterial, scene) {
        // Importation du moteur physique
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.9 },
            scene
          );
    
        groundMaterial.alpha = 0.5;
    
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.BoxImpostor,
            {mass: 0, restitutioqn: 0.5},
            scene
        );
    
        ground.material = groundMaterial;
    
        pingPongBall.physicsImpostor = new BABYLON.PhysicsImpostor(
            pingPongBall,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 1.5, restitution: 0.7 },
            scene
          );
}