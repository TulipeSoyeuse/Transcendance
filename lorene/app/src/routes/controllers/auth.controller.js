import bcrypt from 'bcrypt';
const saltRounds = 10;
//usual query
const insertuser = 'INSERT INTO user (username, email, password, created_at) VALUES (?, ?, ?, date())';
export function register(fastify) {
    // add a new entry to the database user, at this point all checks for the credential
    // used should have been done
    return async function (request, reply) {
        const { username, email, password } = request.body;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) {
                console.error(err);
            }
            else {
                fastify.database.prepare(insertuser).all([username, email, hash], (err) => console.error(err?.message));
                fastify.log.info("new user entry:\nusername:%s, email:%s, password:%s", username, email, hash);
            }
        });
        return reply.redirect("/");
    };
}
export function login(fastify) {
    return async function (request, reply) {
        const { username, password } = request.body;
        fastify.log.info("request login for: %s, with password %s", username, password);
        const rows = await fastify.database.fetch_all('SELECT id, password FROM user WHERE username = ?', [username]);
        if (!rows || rows.length === 0) {
            fastify.log.error('query returned empty');
            return reply.redirect('/');
        }
        else {
            const user = rows[0];
            if (await bcrypt.compare(password, user.password)) {
                fastify.log.info("user %s logged", username);
                request.session.authenticated = true;
                request.session.userId = user.id;
            }
            else {
                fastify.log.info("wrong password");
            }
            return reply.redirect("/");
        }
    };
}
export function logout(FastifyInstance) {
    return async function (request, reply) {
        request.session.authenticated = false;
        request.session.destroy(err => {
            return reply.redirect("/");
        });
    };
}
