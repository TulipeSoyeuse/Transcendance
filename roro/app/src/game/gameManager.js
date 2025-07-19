var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _GameManager_instance;
import { Room } from './room.js';
import cookie from "cookie";
//Singleton GameManager
export class GameManager {
    constructor() {
        // tableau de room 
        this.rooms = [];
        this.fastify = null;
        this.mapPlayer = new Map();
        console.log("Game Manager crée");
    }
    static getInstance(server) {
        if (!__classPrivateFieldGet(this, _a, "f", _GameManager_instance)) {
            __classPrivateFieldSet(this, _a, new _a(), "f", _GameManager_instance);
            __classPrivateFieldGet(this, _a, "f", _GameManager_instance).configureSocketIO(server);
            __classPrivateFieldGet(this, _a, "f", _GameManager_instance).fastify = server;
        }
        return __classPrivateFieldGet(this, _a, "f", _GameManager_instance);
    }
    ;
    //TODO : la connection se deconnecte une fois que on sort de la page game.ts (trouver une solution pour ce souci de connexion socket + fastifysession)
    configureSocketIO(server) {
        server.ready().then(() => {
            server.io.on("connection", (socket) => {
                socket.on("ping_check", (start) => {
                    socket.emit("pong_check", start);
                });
                const cookies = cookie.parse(socket.handshake.headers.cookie || "");
                const sessionId = cookies.sessionId;
                if (sessionId) {
                    const sessionKey = sessionId.split('.')[0];
                    // Vérifie si le joueur est déjà présent dans ma map           
                    let player = this.mapPlayer.get(sessionKey);
                    if (!player) {
                        player = {
                            session: undefined,
                            socket: socket,
                            username: undefined,
                            online: true,
                        };
                        this.mapPlayer.set(sessionKey, player);
                    }
                    else {
                        player.socket = socket;
                        player.online = true;
                    }
                    console.log(`Player with session ${sessionKey} is now online.`);
                    // Gestion de la déconnexion
                    socket.on("disconnect", (reason) => {
                        console.log(`Player with session ${sessionKey} disconnected: ${reason}`);
                        const p = this.mapPlayer.get(sessionKey);
                        if (p) {
                            p.online = false;
                            p.socket = null;
                        }
                    });
                }
                else {
                    console.log("Pas de sessionId dans les cookies, impossible d'identifier le joueur.");
                }
            });
        });
    }
    async socketPlayerMatch(userSession) {
        const value = this.mapPlayer.get(userSession.sessionId);
        if (!value) {
            console.log("Pas de session");
            return;
        }
        value.session = userSession;
        const userId = userSession.userId;
        if (!this.fastify)
            return value;
        const username = await new Promise((resolve, reject) => {
            this.fastify.database.get('SELECT username FROM user WHERE id = ?', [userId], (err, row) => {
                if (err || !row) {
                    reject(err || new Error("No row"));
                }
                else {
                    resolve(row.username);
                }
            });
        });
        value.username = username;
        console.log("Username :", username);
        console.log("profile player completed!");
        return value;
    }
    // DEBUG
    listConnectedPlayers() {
        console.log("Liste des joueurs connectés :");
        this.mapPlayer.forEach((player, sessionKey) => {
            console.log(`SessionKey: ${sessionKey}, username: ${player.username}, socket id: ${player.socket.id}`);
        });
    }
    async addRoom(mode, userSession) {
        const player = await this.socketPlayerMatch(userSession);
        if (!player) {
            console.error("Cannot find session with sessionID");
            return;
        }
        if (mode === "local") {
            this.createGuest((guest) => {
                if (!guest)
                    return;
                const room = new Room(mode, player, guest);
                this.rooms.push(room);
            });
        }
        if (mode === "remote") {
            this.listConnectedPlayers();
            //appel de la waitlist ici : soit mise en attente d'une connexion soit creation direct de la room 
        }
    }
    createGuest(callback) {
        if (!this.fastify) {
            console.error("Fastify non initialisé.");
            callback(null);
            return;
        }
        this.fastify.database.get(`SELECT id, username FROM user WHERE username = ?`, ['guest'], (err, row) => {
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
            const guest = {
                session: { userId: row.id },
                socket: null,
                username: row.username,
                online: false,
            };
            callback(guest);
        });
    }
    checkRoomsStatus() {
        this.rooms.forEach(room => {
            if (room.isMatchActive() == false) {
                this.addInfoDb(room);
                this.rooms = this.rooms.filter(r => r !== room); // supprime le match
            }
        });
    }
    // ? enregister certaines infos des le debut ? 
    addInfoDb(match) {
        const player1Id = match.players[0].session.userId;
        const player2Id = match.players[1].session.userId;
        const player1Score = match.gameLogic.player1Score;
        const player2Score = match.gameLogic.player2Score;
        const winnerId = match.winner.session.userId;
        const dateMatch = new Date().toISOString().slice(0, 19).replace('T', ' ');
        if (this.fastify) {
            this.fastify.database.run(`INSERT INTO match (
                    player_1, score_player_1,
                    player_2, score_player_2,
                    winner, date
                ) VALUES (?, ?, ?, ?, ?, ?)`, [player1Id, player1Score, player2Id, player2Score, winnerId, dateMatch], function (err) {
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
                }
                else {
                    console.log("Match ajouté en base avec succès.");
                }
            });
        }
    }
}
_a = GameManager;
_GameManager_instance = { value: void 0 };
/*
! SessionId : id généré par fastifysession renvoyé par le cookie et retransmis via les websocket
! pb : une fois le cookie expiré, sessionId est mort (comme la session)
*/
