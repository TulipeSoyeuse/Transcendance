"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const root_controller_1 = require("./controllers/root.controller");
const api_controller_1 = require("./controllers/api.controller");
const auth_controller_1 = require("./controllers/auth.controller");
/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify, options) {
    // dummy route
    fastify.get('/ping', async (request, reply) => {
        return { reply: "pong" };
    });
    // index.html
    fastify.get('/', (0, root_controller_1.getroot)(fastify));
    fastify.get('/game/pong', (0, root_controller_1.getgame)(fastify));
}
async function auth(fastify, options) {
    //authentification routes
    fastify.post('/register', (0, auth_controller_1.register)(fastify));
    fastify.post('/login', (0, auth_controller_1.login)(fastify));
    fastify.get("/logout", (0, auth_controller_1.logout)(fastify));
}
async function api(fastify, options) {
    // api/user-check
    fastify.post('/api/check-username', (0, api_controller_1.check_user)(fastify));
}
;
exports.default = { routes, api, auth };
