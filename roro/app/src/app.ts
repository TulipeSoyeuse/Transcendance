import * as path from "path";
import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import root from "./routes/root.js";
import dbPlugin from "./plugins/dbplugin.js";
import formbody from "@fastify/formbody";
import fastifySession from "@fastify/session";
import fastifyCookie from "@fastify/cookie";
import Store from "./db/store.js";
import fastifyIO from "fastify-socket.io";
import fastifySocketIO from "fastify-socket.io";
import { GameManager } from "./game/gameManager.js";
import cookie from "cookie";

const __dirname = import.meta.dirname;

const server = fastify({
    logger: {
        level: "error",
    },
});
// PLUGINS (register plugins first or problems)
let db = server.register(dbPlugin);
server.register(formbody);
server.register(fastifyCookie);
server.register(fastifySocketIO.default, {});
await db; // db needed for session

const sessionStore = new Store.SessionStore(server.database, server.log);
server.register(fastifySession, {
    cookieName: "sessionId",
    //TODO: secret should be in .ENV file
    secret: "2c8c3c1549e14bfc7f124ed4a8dbbb94",
    cookie: { maxAge: 1800000, secure: "auto" },
    store: sessionStore,
});
server.register(fastifyStatic, {
    root: path.join(__dirname, "..", "public"),
    prefix: "/",
});

//all user endpoint here
server.register(root.routes);

//all api routes (and hooks ?) here
server.register(root.api);

//all request linked to authentification (and sessions managment ?) here
server.register(root.auth);

const gm = GameManager.getInstance(server); 



server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});


/*

Client           Serveur

HTTP Request --> (création session + cookie sessionId=xyz) --> Stockage session dans store

WebSocket (socket.io) connexion --> cookie sessionId=xyz envoyé dans handshake

Serveur :
    - Parse cookie sessionId
    - Cherche session dans store avec sessionId
    - Ajoute socket.id dans session

Serveur peut maintenant associer un utilisateur (via sa session) à son socket.id
*/


//fuser -k 8080/tcp