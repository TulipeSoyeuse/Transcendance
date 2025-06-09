"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const root_controller_1 = require("./controllers/root.controller");
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
    fastify.get('/', root_controller_1.getroot);
}
exports.default = routes;
