import { GameScene } from "./scene.js";
export class Room {
    constructor(mode, player1) {
        this.id = "null";
        this.players = [];
        this.players.push(player1);
        this.gameScene = new GameScene();
        this.keyPressedListener();
    }
    //envoyer les infos aux players 
    emitToPlayers(player1, player2) {
        if (!player1.socket) {
            console.error("Le joueur n'a pas de socketId");
            return;
        }
        const sceneState = this.gameScene.getSceneState(); // récupère l’état
        // Émission vers le joueur avec son socketId
        player1.socket.emit("sceneUpdate", sceneState);
    }
    //ecoute les touches pressées
    // TODO : la connexion fonctionne, mais si elle est perdue on est obligé de revenir sur /game.ts pour en recrrer une  nouvelle
    keyPressedListener() {
        if (!this.players[0].socket.connected)
            console.log("la socket est die");
        this.players[0].socket.on("keyPressed", (data) => {
            console.log(`Input reçu : ${data.key}, position:`, data.position);
        });
    }
}
;
/*
deux type de room: une room locale et une remote, la locale n'attend pas qu'un autre joueur se connecte,
elle balance la scene avec un invité comme player2. Le constructeur attend l'username du joueur, il crée le match
l'envoi dans le front et l'enregistre sur la base de donnée(maintenant ou une fois terminé ?). Tant que le status terminé n'apparait pas sur le gameManager
le match continu. Quand le match est terminé la room est supprimé et les données envoyées a la base de données.

la remote crée la room et la place en attente qu'on la rejoingne. Une fois les deux joeurs connectés et reliés en ws, le match peut commencer,
le constructeur prend le mode et le username
on peut faire different constructeur, un constructuer en remote avec un username donc qui attend qu'un autre joueur rejoigne le groupe, et par exemple un constructeur
en remote avec deux username qui pourrait resulter d'une invitation a jouer, dans ce cas le joueur n'est pas attribué aléatoirement mais
attend une reponse de la part du joueur invité. (voir comment mettre ca en place une fois le chat implémenté)

pour envoyer le jeu, j'enregistre le socket id de chacun des joeurs et j'emit a ces joueurs la(donc j'ai besoin du socket id) => filer la session directement? enregister le socket id dans la base données ??



*/ 
