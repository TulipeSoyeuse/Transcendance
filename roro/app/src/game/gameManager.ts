
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
            const room = new Room(mode, player);
        }
        
    }
}


// Mesurer la latence toutes les 5 secondes



/*
SessionId : id généré par fastifysession renvoyé par le cookie et retransmis via les websocket 
! pb : une fois le cookie expiré, sessionId est mort (comme la session)
diff entre 


*/