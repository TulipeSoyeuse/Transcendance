// import * as BABYLON from 'babylonjs';
// import Ammo from 'ammo.js';


// TODO : reset si la balle est bloquée

export class GameManager {
    constructor(scene, pingPongBall, floor) {
        this.scene = scene;
        this.ball = pingPongBall;
        this.floor = floor;
        this.player1Score = 0;
        this.player2Score = 0;


        // limiter la vitesse de la balle
        scene.onBeforeRenderObservable.add(() => {
            const maxSpeed = 13;
            if(this.ball.physicsImpostor) {
                const velocity = this.ball.physicsImpostor.getLinearVelocity();
                if (velocity.length() > maxSpeed) {
                    const newVelocity = velocity.normalize().scale(maxSpeed);
                    pingPongBall.physicsImpostor.setLinearVelocity(newVelocity);
                }
            }
        });

        this._createLimits();
        this._createGUI();
        this._initBallSuperviseur();
    }

    _createLimits() {
        const box = this.floor.getBoundingInfo().boundingBox;
        const width = box.maximum.x - box.minimum.x;
        const length = box.maximum.z - box.minimum.z;
        const center = this.floor.position;
    
        const zoneThickness = 0.2;
        const extraMargin = 0.5; // marge autour de la table
        const yPos = center.y + zoneThickness / 2;
    
        // Helper 
        const createInvisibleMat = (name) => {
            const mat = new BABYLON.StandardMaterial(name, this.scene);
            mat.alpha = 0;
            return mat;
        };
    
        // Helper 
        const createZone = (name, options, position, material) => {
            const zone = BABYLON.MeshBuilder.CreateBox(name, options, this.scene);
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
            new BABYLON.Vector3(center.x, yPos, center.z - length / 2 - 0.5),
            matLeft
        );
    
        this.rightZone = this.leftZone.clone("rightZone");
        this.rightZone.position.z = center.z + length / 2 + 0.5;
        this.rightZone.material = matRight;
    
        this.sideLeftZone = createZone(
            "sideLeftZone",
            { width: 1, height: zoneThickness, depth: length + 2 * extraMargin },
            new BABYLON.Vector3(center.x - width / 2 - 0.5, yPos, center.z),
            matSideLeft
        );
    
        this.sideRightZone = this.sideLeftZone.clone("sideRightZone");
        this.sideRightZone.position.x = center.x + width / 2 + 0.5;
        this.sideRightZone.material = matSideRight;
    }
    

    _initBallSuperviseur() {
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
    

    _handlePointLoss(losingPlayer) {
        let winner;
        if (losingPlayer === 'player1') {
            this.player2Score++;
            winner = 'player2';
        } else {
            this.player1Score++;
            winner = 'player1';
        }

        this._updateUI();
        this._resetBall(winner);
    }

    _createGUI() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
        this.scoreText = new BABYLON.GUI.TextBlock();
        this.scoreText.text = "Joueur 1: 0 | Joueur 2: 0";
        this.scoreText.color = "white";
        this.scoreText.fontFamily = "Verdana";
        this.scoreText.fontSize = 24;
    
        this.scoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    
        this.scoreText.left = 10;
        this.scoreText.top = 10;
    
        this.scoreText.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.scoreText.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    
        advancedTexture.addControl(this.scoreText);
    }
    

    _updateUI() {
        this.scoreText.text = `Joueur 1: ${this.player1Score} | Joueur 2: ${this.player2Score}`;
    }


    _resetBall(winner) {
        const tableBox = this.floor.getBoundingInfo().boundingBox;
        const tableWidth = tableBox.maximum.x - tableBox.minimum.x;
        const tableCenter = this.floor.position;
        const ballHeight = tableBox.maximum.y + 0.5;
    
        const xOffset = tableWidth / 2 - 2  ; // un peu avant le bord 
    
        let x, serveDir;
    
        if (winner === 'player1') {
            x = tableCenter.x + xOffset; // player1 à gauche
            serveDir = -1;                // vers player2 (droite)
        } else {
            x = tableCenter.x - xOffset; // player2 à droite
            serveDir = 1;               // vers player1 (gauche)
        }
    
        const z = tableCenter.z; 
    
        this.ball.position.set(x, ballHeight, z);
    
        // Reset de la physique
        this.ball.physicsImpostor.setLinearVelocity(BABYLON.Vector3.Zero());
        this.ball.physicsImpostor.setAngularVelocity(BABYLON.Vector3.Zero());
    
    }

}
