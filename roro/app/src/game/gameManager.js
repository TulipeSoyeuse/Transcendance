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
import cookie from "cookie";
//Singleton GameManager
export class GameManager {
    constructor() {
        // tableau de room 
        this.rooms = [];
        this.fastify = null;
        this.userSocketMap = new Map();
        console.log("Game Manager crée");
    }
    static getInstance(server) {
        if (!__classPrivateFieldGet(this, _a, "f", _GameManager_instance)) {
            __classPrivateFieldSet(this, _a, new _a(), "f", _GameManager_instance);
            __classPrivateFieldGet(this, _a, "f", _GameManager_instance).configureSocketIO(server);
        }
        return __classPrivateFieldGet(this, _a, "f", _GameManager_instance);
    }
    ;
    configureSocketIO(server) {
        server.ready().then(() => {
            server.io.on("connection", (socket) => {
                console.log("je passe par configuresocketIO");
                console.log("Utilisateur connecté : ", socket.id);
                const cookies = cookie.parse(socket.handshake.headers.cookie);
                const sessionId = cookies.sessionId;
                console.log("websocket sessionID: ", sessionId);
                if (sessionId) {
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
    addRoom(mode, session) {
    }
}
_a = GameManager;
_GameManager_instance = { value: void 0 };
