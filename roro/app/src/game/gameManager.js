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
import { WaitList } from "./waitList.js";
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
            __classPrivateFieldGet(this, _a, "f", _GameManager_instance).waitList = new WaitList();
            __classPrivateFieldGet(this, _a, "f", _GameManager_instance).waitList.on('roomCreated', ({ player1, player2 }) => {
                __classPrivateFieldGet(this, _a, "f", _GameManager_instance).handleNewRoom(player1, player2);
            });
        }
        return __classPrivateFieldGet(this, _a, "f", _GameManager_instance);
    }
    ;
    handleNewRoom(player1, player2) {
        new Room("remote", player1, player2);
    }
    async getUsername(userId) {
        return new Promise((resolve, reject) => {
            this.fastify.database.get('SELECT username FROM user WHERE id = ?', [userId], (err, row) => {
                if (err) {
                    reject(new Error("Erreur lors de la récupération du username: " + err.message));
                }
                else if (!row || !row.username) {
                    reject(new Error("Aucun utilisateur trouvé pour cet ID"));
                }
                else {
                    resolve(row.username);
                }
            });
        });
    }
    configureSocketIO(server) {
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
                this.fastify?.database.get(`SELECT session FROM session WHERE sid = ?`, [sessionKey], async (err, row) => {
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
                        let username;
                        try {
                            username = await this.getUsername(userId);
                        }
                        catch (e) {
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
                        }
                        else {
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
                    }
                    catch (parseError) {
                        console.error("Erreur lors du parsing JSON de la session :", parseError);
                    }
                });
            });
        });
    }
    async socketPlayerMatch(userSession) {
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
    }
    // DEBUG
    listConnectedPlayers() {
        console.log("Liste des joueurs connectés :");
        this.mapPlayer.forEach((player, sessionKey) => {
            if (player.socket)
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
            this.waitList.addRemote(player);
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
