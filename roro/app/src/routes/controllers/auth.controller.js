"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 10;
//usual query
const insertuser = 'INSERT INTO user (username, email, password, created_at) VALUES (?, ?, ?, date(?))';
function register(fastify) {
    // add a new entry to the database user, at this point all checks for the credential
    // used should have been done
    return async function (request, reply) {
        const { username, email, password } = request.body;
        bcrypt_1.default.hash(password, saltRounds, function (err, hash) {
            if (err) {
                console.error(err);
            }
            else {
                fastify.database.prepare(insertuser).all([username, email, hash, Date()], (err) => console.error(err?.message));
                console.log("new user entry:\nusername:%s, email:%s, password:%s", username, email, hash);
            }
        });
        return reply.redirect("/");
    };
}
function login(fastify) {
    return async function (request, reply) {
        const { username, password } = request.body;
        console.log("request login for: %s, with password %s", username, password);
        const rows = await fastify.database.fetch_all('SELECT id, password FROM user WHERE username = ?', [username]);
        if (!rows || rows.length === 0) {
            console.error('query returned empty');
            return reply.redirect('/');
        }
        else {
            const user = rows[0];
            if (await bcrypt_1.default.compare(password, user.password)) {
                console.log("user %s logged", username);
                request.session.authenticated = true;
                request.session.userId = user.id;
            }
            else {
                console.log("wrong password");
            }
            return reply.redirect("/");
        }
    };
}
function logout(FastifyInstance) {
    return async function (request, reply) {
        request.session.authenticated = false;
        request.session.destroy(err => {
            return reply.redirect("/");
        });
    };
}
