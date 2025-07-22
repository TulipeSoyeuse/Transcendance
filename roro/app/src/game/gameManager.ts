
import { Room } from './room.js'
import fastifySession, { FastifySessionObject, SessionStore } from "@fastify/session";
import { notStrictEqual } from "assert";
import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import cookie from "cookie";
import { Player } from "../../includes/custom.js";
import { WaitList } from "./waitList.js";



//Singleton GameManager
export class GameManager {
    // tableau de room 
    private rooms: Room[] = [];
    private fastify: FastifyInstance | null = null;
    private mapPlayer: Map<number, Player> = new Map<number, Player>();
    private waitList : WaitList;

    static #instance: GameManager
    private constructor() {
        console.log("Game Manager crée");
    }

    public static getInstance(server: FastifyInstance) : GameManager {
    if(!this.#instance) {
        this.#instance = new GameManager();
        this.#instance.configureSocketIO(server);
        this.#instance.fastify = server;
        this.#instance.waitList = new WaitList();
        this.#instance.waitList.on('roomCreated', ({ player1, player2 }) => {
            this.#instance.handleNewRoom(player1, player2);
          });
    }
        return this.#instance;
    };

    private handleNewRoom(player1: Player, player2: Player) {
        new Room("remote", player1, player2);
    }


    public async getUsername(userId: number): Promise<string> {
        return new Promise((resolve, reject) => {
          this.fastify!.database.get(
            'SELECT username FROM user WHERE id = ?',
            [userId],
            (err: Error | null, row: any) => {
              if (err) {
                reject(new Error("Erreur lors de la récupération du username: " + err.message));
              } else if (!row || !row.username) {
                reject(new Error("Aucun utilisateur trouvé pour cet ID"));
              } else {
                resolve(row.username);
              }
            }
          );
        });
      }
      

      private configureSocketIO(server: FastifyInstance): void {
        server.ready().then(() => {
          server.io.on("connection", (socket) => {
            console.log("Nouvelle connexion socket.io");
      
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const rawSessionId = cookies.sessionId;
            if (!rawSessionId) {
              console.warn("Aucun cookie de session trouvé");
              return;
            }
      
            const sessionKey = rawSessionId.startsWith("s:")
              ? rawSessionId.slice(2).split('.')[0]
              : rawSessionId.split('.')[0];
      
            this.fastify?.database.get(
              `SELECT session FROM session WHERE sid = ?`,
              [sessionKey],
              async (err: Error | null, row: any) => {
                if (err) {
                  console.error("Erreur SQL lors de la récupération de la session :", err.message);
                  return;
                }
                if (!row) {
                  console.warn("Aucune session trouvée en base pour le SID :", sessionKey);
                  return;
                }
      
                try {
                    // ? pourquoi si j'utilise parse la j'ai toute ma session?
                  const sessionData = JSON.parse(row.session);
                  const userId = sessionData.userId;
      
                  if (!userId) {
                    console.warn("Session trouvée mais sans userId");
                    return;
                  }
      
                  // Appel async pour récupérer le username depuis la base
                  let username: string;
                  try {
                    username = await this.getUsername(userId);
                  } catch (e) {
                    console.warn("Impossible de récupérer le username, on utilise celui de la session si dispo");
                    username = sessionData.username || "Inconnu";
                  }
      
                  let player = this.mapPlayer.get(userId);
                  if (!player) {
                    player = {
                      session: sessionData,
                      socket: socket,
                      username: username,
                      online: true,
                    };
                    this.mapPlayer.set(userId, player);
                  } else {
                    player.socket = socket;
                    player.online = true;
                    player.session = sessionData;
                    player.username = username;
                  }
      
                  console.log("Connexion établie pour userId :", userId, "username :", username);
      
                  socket.on("disconnect", () => {
                    const p = this.mapPlayer.get(userId);
                    if (p) {
                      p.online = false;
                      p.socket = null;
                      console.log(`Déconnexion de ${p.username || userId}`);
                    }
                  });
      
                } catch (parseError) {
                  console.error("Erreur lors du parsing JSON de la session :", parseError);
                }
              }
            );
          });
        });
      }
      
      
    public async socketPlayerMatch(userSession: FastifySessionObject): Promise<Player | undefined> {
        // recuperer mon player: deja enregistré
        if (userSession.userId) {
            const value = this.mapPlayer.get(userSession.userId);
        if (!value) {
            console.log("Pas de session");
            return;
        }
        return value;
    }
    

    // DEBUG
    public listConnectedPlayers(): void {
        console.log("Liste des joueurs connectés :");
        this.mapPlayer.forEach((player, sessionKey) => {
            if(player.socket)
                console.log(`SessionKey: ${sessionKey}, username: ${player.username}, socket id: ${player.socket.id}`);
        });
    }

    public async addRoom(mode: string, userSession: FastifySessionObject) {
        const player = await this.socketPlayerMatch(userSession);
        if (!player) {
            console.error("Cannot find session with sessionID");
            return;
        }
    
        if (mode === "local") {
            this.createGuest((guest) => {
                if (!guest) return;
                const room = new Room(mode, player, guest);
                this.rooms.push(room);
            });
        }
    
        if (mode === "remote") {
            this.listConnectedPlayers(); 
            this.waitList.addRemote(player);
        }
    }

    private createGuest(callback: (guest: Player | null) => void): void {
        if (!this.fastify) {
            console.error("Fastify non initialisé.");
            callback(null);
            return;
        }
    
        this.fastify.database.get(
            `SELECT id, username FROM user WHERE username = ?`,
            ['guest'],
            (err: Error | null, row: any) => {
                if (err) {
                    console.error("Erreur SQL pour récupérer le guest :", err.message);
                    callback(null);
                    return;
                }
    
                if (!row) {
                    console.error("Aucun utilisateur 'guest' trouvé.");
                    callback(null);
                    return;
                }
    
                const guest: Player = {
                    session: { userId: row.id } as any,
                    socket: null,
                    username: row.username,
                    online: false,
                };
    
                callback(guest);
            }
        );
    }
    


    public checkRoomsStatus() : void {
        this.rooms.forEach(room => {
            if(room.isMatchActive() == false) {
                this.addInfoDb(room);
                this.rooms = this.rooms.filter(r => r !== room); // supprime le match
            }
    });
    }


    // ? enregister certaines infos des le debut ? 
    private addInfoDb(match: Room): void {
        const player1Id = match.players[0].session.userId;
        const player2Id = match.players[1].session.userId;
        const player1Score = match.gameLogic.player1Score;
        const player2Score = match.gameLogic.player2Score;
        const winnerId = match.winner.session.userId;
        const dateMatch = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
        if (this.fastify) {
            this.fastify.database.run(
                `INSERT INTO match (
                    player_1, score_player_1,
                    player_2, score_player_2,
                    winner, date
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [player1Id, player1Score, player2Id, player2Score, winnerId, dateMatch],
                function (err: Error | null) {
                    if (err) {
                        console.log({
                            player1Id,
                            player2Id,
                            player1Score,
                            player2Score,
                            winnerId,
                            dateMatch
                        });
                        console.error("Erreur insertion match:", err.message);
                    } else {
                        console.log("Match ajouté en base avec succès.");
                    }
                }
            );
        }
    }

    // ? generer le tournoi ici ? 
}


/*
! SessionId : id généré par fastifysession renvoyé par le cookie et retransmis via les websocket 
! pb : une fois le cookie expiré, sessionId est mort (comme la session)
*/
