import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import bcrypt from 'bcrypt';
const saltRounds = 10;


interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

export function register(fastify: FastifyInstance) {
    // add a new entry to the database user, at this point all checks for the credential
    // used should have been done
    return async function (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
        const insert = fastify.database.prepare('INSERT INTO user (username, email, password) VALUES (?, ?, ?)')
        const { username, email, password } = request.body;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) {
                console.error(err)
            }
            else {
                insert.run([username, email, hash], (err) => console.error(err?.message))
                console.log("new user entry:\n username:%s, email:%s, password:%s", username, email, hash)
            }
        })
    }
}

export function login(fastify: FastifyInstance) {
    // TODO: check credentials and return cookie + user index page
    return async function (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) { return reply.sendFile('index.html') }
}
