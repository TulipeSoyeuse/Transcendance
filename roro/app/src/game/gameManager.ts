
import { Room } from './room.js'
import fastifySession, { FastifySessionObject, SessionStore } from "@fastify/session";
import { notStrictEqual } from "assert";
import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import cookie from "cookie";
import { Player } from "../../includes/custom.js";


//Singleton GameManager
export class GameManager {
    // tableau de room 
    private rooms: Room[] = [];
    private fastify: FastifyInstance | null = null;
    private mapPlayer: Map<string, Player> = new Map<string, Player>();


    static #instance: GameManager
    private constructor() {
        console.log("Game Manager crée");
    }

    public static getInstance(server: FastifyInstance) : GameManager {
    if(!this.#instance) {
        this.#instance = new GameManager();
        this.#instance.configureSocketIO(server);
        this.#instance.fastify = server;
    }
        return this.#instance;
    };

    private configureSocketIO(server: FastifyInstance): void {
        server.ready().then(() => {
            server.io.on("connection", (socket) => {
                socket.on("ping_check", (start: any) => {
                    socket.emit("pong_check", start); 
                  });
                const cookies = cookie.parse(socket.handshake.headers.cookie);
                const sessionId = cookies.sessionId;
                if(sessionId) {
                    const sessionKey = sessionId.split('.')[0];

                    // ? acceder a sessionstore et get ma session grace a ce sessionID serzit bcp plus simple
                    console.log("Session ID = ", sessionKey);
                    const player: Player = {
                        session: undefined,  
                        socket: socket,              
                        username: undefined,
                      };
                      
                      this.mapPlayer.set(sessionKey, player);

                }
                else {
                    console.log("Pas de session id. Fastify/session pas instancié");
                }
            });
        });
    }


    public socketPlayerMatch(userSession: FastifySessionObject) : Player | undefined {
        const value = this.mapPlayer.get(userSession.sessionId);
        if (!value) {
            console.log("Pas de session");
            return ;
        }
        value.session = userSession;
        const userId = userSession.userId;
    
        if (this.fastify) {
            this.fastify.database.get(
                'SELECT username FROM user WHERE id = ?',
                [userId],
                (err: Error | null, row: any) => {
                    if (err) {
                        console.error('Erreur lors de la requête SQL :', err);
                        return;
                    }
    
                    if (!row) {
                        console.log('Aucun utilisateur trouvé');
                        return;
                    }
    
                    console.log('Username :', row.username);
    
                    if (value) {
                        value.username = row.username;
                    }
                }
            );
        }
        console.log("profile player completed!");
        return value;
    }

    public addRoom(mode: string, userSession: FastifySessionObject) {
        const player = this.socketPlayerMatch(userSession);
        if(player === undefined) {
            console.error("Cannot find session with sessionID");
            return ;
        }
        if(mode == "local") {
            this.createGuest((guest) => {
                if (!guest) {
                    console.log("Pas de guest trouvé.");
                    return;
                }
                console.log("Guest récupéré :", guest.username);
                const room = new Room(mode, player, guest);
                this.rooms.push(room);
            });
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
    // TODO : gerer les socket en cas de disconnect 
}


/*
! SessionId : id généré par fastifysession renvoyé par le cookie et retransmis via les websocket 
! pb : une fois le cookie expiré, sessionId est mort (comme la session)
*/
