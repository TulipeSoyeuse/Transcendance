import { Player } from "../../includes/custom.js";
import { GameScene } from "./scene.js";
import { GameLogic } from "./gameLogic.js";

export class Room {
    id: string = "null";
    players: Player[] = [];
    gameScene! : GameScene;
    gameLogic! : GameLogic; 
    isActive: boolean = true;
    winner! : Player;
    mode: string;
    public constructor (mode: string, player1: Player, player2: Player) {
        this.players.push(player1);
        this.players.push(player2);
        this.mode = mode;
        GameScene.create().then((scene) => {
            this.gameScene = scene;
            this.gameLogic = new GameLogic(this.gameScene, this.players[0], this.players[1], mode);
            this.keyPressedListener();
            this.checkMatchStatus();
            this.emitToPlayers(mode);
        }).catch((error) => {
            console.error("Failed to initialize GameScene", error);
        });

    }

    private emitToPlayers(mode: string) {
        const interval = setInterval(() => {
          if (!this.isActive) {
            clearInterval(interval);
            return;
          }
      
          const sceneState = this.gameScene.getSceneState();

      
          for (const player of this.players) {
            if(player.username == "guest")
                continue;
            if (player.socket && player.socket.connected) {
              player.socket.emit("sceneUpdate", sceneState);
            }
          }
        }, 1000 / 30); 
      }
      

      private keyPressedListener() {
        this.players.forEach((player, index) => {
          if (!player.socket?.connected) {
            console.warn(`Socket non connectée pour le joueur ${index + 1}`);
            return;
          }
      
          // On ignore les invités (guest)
          if (player.username === "guest") {
            return;
          }
      
          const paddleName = index === 0 ? "players1" : "players2";
      
          player.socket.on("keyPressed", (data: { key: string, position: { x: number, y: number, z: number } }) => {
            this.gameScene.moovePaddle(paddleName, data.key, this.players[0], this.players[1]);
          });
        });
      }
      
      


    private checkMatchStatus(): void {
        const interval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(interval);
                return;
            }
    
            if (this.gameLogic.player1Score >= 7 || this.gameLogic.player2Score >= 7) {
                this.endMatch();
                clearInterval(interval);
            }
    
        }, 100); // toutes les 100ms
    }


    private endMatch(): void {
        this.isActive = false;
        this.winner = this.gameLogic.player1Score >= 7 ? this.players[0] : this.players[1];
      
        for (const player of this.players) {
            if(player.username == "guest")
                continue;
          if (player.socket && player.socket.connected) {
            player.socket.emit("match_ended", {
              message: "stop match",
              winner: this.winner.username,
            });
          }
        }
      }
    
    isMatchActive() : boolean {
        return this.isActive;
    }

}

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