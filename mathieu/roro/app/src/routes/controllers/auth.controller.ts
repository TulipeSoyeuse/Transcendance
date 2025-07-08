import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { OAuth2Client } from "google-auth-library";
import bcrypt from 'bcrypt';
const saltRounds = 10;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

interface LoginBody {
    username: string;
    password: string;
}

//usual query
const insertuser = 'INSERT INTO user (username, email, password, created_at) VALUES (?, ?, ?, date())'

export function register(fastify: FastifyInstance) {
    // add a new entry to the database user, at this point all checks for the credential
    // used should have been done
    return async function (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
        const { username, email, password } = request.body;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) {
                console.error(err)
            }
            else {
                fastify.database.prepare(insertuser).all([username, email, hash], (err: Error) => console.error(err?.message))
                fastify.log.info("new user entry:\nusername:%s, email:%s, password:%s", username, email, hash)
            }
        })
        return reply.redirect("/")
    }
}

export function login(fastify: FastifyInstance) {
    return async function (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
        const { username, password } = request.body;
        fastify.log.info("request login for: %s, with password %s", username, password);
        const rows = await fastify.database.fetch_all('SELECT id, password FROM user WHERE username = ?', [username])
        if (!rows || rows.length === 0) {
            fastify.log.error('query returned empty');
            return reply.redirect('/');
        }
        else {
            const user = rows[0]
            if (await bcrypt.compare(password, user.password)) {
                fastify.log.info("user %s logged", username);
                request.session.authenticated = true;
                request.session.userId = user.id;
                request.session.isAdmin = !!user.is_admin;
            }
            else {
                fastify.log.info("wrong password");
            }
            return reply.redirect("/");
        }
    }
}

export function logout(FastifyInstance: FastifyInstance) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        request.session.authenticated = false;
        request.session.destroy(err => {
            return reply.redirect("/");
        })
    }
}

export async function googleAuthCallback(fastify: FastifyInstance) {
    fastify.post('/auth/google/callback', async (request, reply) => {
        const { token } = request.body;

        try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return reply.status(401).send({ error: 'Invalid Google token payload' });
        }

        const { email, name, sub: googleId, given_name } = payload;

        // Check if user already exists by google_id
        let user = await fastify.database.fetch_one(
            'SELECT * FROM user WHERE google_id = ?', [googleId]
        );

        if (!user) {
            const username = given_name?.toLowerCase() || 'user';

            await fastify.database.run(`INSERT INTO user (username, email, created_at, google_id) VALUES (?, ?, datetime('now'), ?)`, [username, email, googleId]);

            user = await fastify.database.fetch_one('SELECT * FROM user WHERE google_id = ?', [googleId]);
        }

        // Create session
        request.session.authenticated = true;
        request.session.userId = user.id;

        return reply.send({ success: true, user });
        } catch (err) {
            fastify.log.error(err);
            return reply.status(401).send({ error: 'Invalid Google token' });
        }
    });
}



export function whoami(fastify: FastifyInstance) {
    return async function (
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        if (!request.session.authenticated) {
            return reply.status(401).send({ error: "Not authenticated" });
        }

        try {
            const rows = await fastify.database.fetch_all(
                "SELECT id, username, email, is_admin FROM user WHERE id = ?",
                [request.session.userId]
            );

            if (!rows.length) {
                return reply.status(404).send({ error: "User not found" });
            }

            const user = rows[0];
            return reply.send({
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: !!user.is_admin
            });
        } catch (err) {
            fastify.log.error("Fetch /me failed: %s", err);
            return reply.status(500).send({ error: "Server error" });
        }
    };
}