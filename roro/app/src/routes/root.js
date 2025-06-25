import { getRoot, getGame, getAccount } from "./controllers/root.controller.js";
import { check_user } from "./controllers/api.controller.js";
import { register, login, logout } from "./controllers/auth.controller.js";
import { handle_game } from "./controllers/api.controller.js";
/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, options) {
    // dummy route
    fastify.get("/ping", async (request, reply) => {
        return { reply: "pong" };
    });
    // index.html
    fastify.get("/", getRoot(fastify));
    // game
    fastify.get("/game/pong", getGame(fastify));
    // account.html
    fastify.get("/account", getAccount(fastify));
}
async function auth(fastify, options) {
    //authentification routes
    fastify.post("/register", register(fastify));
    fastify.post("/login", login(fastify));
    fastify.get("/logout", logout(fastify));
}
async function api(fastify, options) {
    fastify.post("/api/check-username", check_user(fastify));
    fastify.post("/api/handle-game", handle_game(fastify));
}
export default { routes, api, auth };
