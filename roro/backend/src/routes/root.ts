import { request } from "http";
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { getroot } from "./controllers/root.controller";
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

    fastify.get('/', getroot)  
}

export default routes;
