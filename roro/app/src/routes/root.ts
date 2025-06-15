import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { getroot, getgame } from "./controllers/root.controller";
import { check_user } from "./controllers/api.controller";
import { register, login, logout } from "./controllers/auth.controller";

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
    fastify.get('/', getroot(fastify));
    fastify.get('/game/pong', getgame(fastify));

}

async function auth(fastify: FastifyInstance, options: FastifyPluginOptions) {
    //authentification routes
    fastify.post('/register', register(fastify))
    fastify.post('/login', login(fastify))
    fastify.get("/logout", logout(fastify));
}

async function api(fastify: FastifyInstance, options: FastifyPluginOptions) {
    // api/user-check
    fastify.post('/api/check-username', check_user(fastify))
};

export default { routes, api, auth };
