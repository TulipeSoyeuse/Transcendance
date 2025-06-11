import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { getroot } from "./controllers/root.controller";
import { check_user } from "./controllers/api.controller";
import { request } from 'http';
import { REPL_MODE_SLOPPY } from 'repl';

/**
 * A plugin that provide encapsulated routes
 * @param {FastifyInstance} fastify encapsulated fastify instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    // dummy route
    fastify.get('/ping', async (request, reply) => {
        return { reply: "pong" }
    })

    // index.html
    fastify.get('/', getroot);
}

async function api(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // api/user-check
    fastify.post('/api/check-username', check_user(fastify))
};

export default { routes, api };
