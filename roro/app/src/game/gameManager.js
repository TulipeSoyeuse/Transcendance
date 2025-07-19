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
    configureSocketIO(server) {
        server.ready().then(() => {
            server.io.on("connection", (socket) => {
                socket.on("ping_check", (start) => {
                    socket.emit("pong_check", start);
                });
                const cookies = cookie.parse(socket.handshake.headers.cookie);
                const sessionId = cookies.sessionId;
                if (sessionId) {
                    const sessionKey = sessionId.split('.')[0];
                    // ? acceder a sessionstore et get ma session grace a ce sessionID serzit bcp plus simple
                    console.log("Session ID = ", sessionKey);
                    const player = {
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
    socketPlayerMatch(userSession) {
        const value = this.mapPlayer.get(userSession.sessionId);
        if (!value) {
            console.log("Pas de session");
            return;
        }
        value.session = userSession;
        const userId = userSession.userId;
        if (this.fastify) {
            this.fastify.database.get('SELECT username FROM user WHERE id = ?', [userId], (err, row) => {
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
            });
        }
        console.log("profile player completed!");
        return value;
    }
    addRoom(mode, userSession) {
        const player = this.socketPlayerMatch(userSession);
        if (player === undefined) {
            console.error("Cannot find session with sessionID");
            return;
        }
        if (mode == "local") {
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
