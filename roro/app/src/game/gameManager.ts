
import { Room } from './room.js'
import fastifySession, { SessionStore } from "@fastify/session";
import { notStrictEqual } from "assert";
import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import cookie from "cookie";


//Singleton GameManager
export class GameManager {
    // tableau de room 
    private rooms: Room[] = [];
    private fastify: FastifyInstance | null = null;

    // enregsitrement des ws pour plus tard, apres une requete API relier une request.session avec une websocket
    private userSocketMap: Map<string, {socket: any, sessionId: string}> = new Map();

    static #instance: GameManager
    private constructor() {
        console.log("Game Manager crée");
    }

    public static getInstance(server: FastifyInstance) : GameManager {
    if(!this.#instance) {
        this.#instance = new GameManager();
        this.#instance.configureSocketIO(server);
    }
        return this.#instance;
    };

    private configureSocketIO(server: FastifyInstance): void {
        server.ready().then(() => {
            server.io.on("connection", (socket) => {
                console.log("je passe par configuresocketIO");
                console.log("Utilisateur connecté : ", socket.id);
                const cookies = cookie.parse(socket.handshake.headers.cookie);
                const sessionId = cookies.sessionId;
                console.log("websocket sessionID: ", sessionId);
                if(sessionId) {
                    const sessionKey = sessionId.split('.')[0];
                    console.log("Session ID = ", sessionKey);
                    // TODO : ajouter une clef pour retrouver facilement la session
                    this.userSocketMap.set(socket.id, sessionKey);
                }
                else {
                    console.log("Pas de session id. Fastify/session pas instancié");
                }
            });
        });
    }

    //Implementation de GameManager
    public addRoom(mode: string, session: SessionStore) {
    }

}



/*
SessionId : id généré par fastifysession renvoyé par le cookie et retransmis via les websocket 
! pb : une fois le cookie expiré, sessionId est mort (comme la session)
*/