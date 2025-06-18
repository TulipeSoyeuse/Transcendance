"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.navbar = navbar;
exports.getRoot = getRoot;
exports.getAccount = getAccount;
exports.getGame = getGame;
const fs_1 = __importDefault(require("fs"));
async function navbar(fastify, request, html) {
    const username = await fastify.database.fetch_one('SELECT username from user where id = ?', [request.session.userId]);
    const isAuth = request.session.authenticated;
    // Inject dynamic buttons
    const rendered = html.replace(`<!-- Navigation -->`, isAuth
        ? fs_1.default.readFileSync("./public/navbar/logged.html", "utf8").replace("USERNAME", username.username)
        : fs_1.default.readFileSync("./public/navbar/default.html", "utf8"));
    return rendered;
}
function getRoot(fastify) {
    return async function (request, reply) {
        let html = fs_1.default.readFileSync("./public/index.html", "utf8");
        const isAuth = request.session.authenticated;
        const username = await fastify.database.fetch_one('SELECT username from user where id = ?', [request.session.userId]);
        // Inject dynamic buttons
        html = await navbar(fastify, request, html);
        return reply.header("Content-Type", "text/html").send(html);
    };
}
function getAccount(fastify) {
    return async function (request, reply) {
        if (!request.session.authenticated)
            reply.redirect("/");
        return reply.sendFile("account.html");
    };
}
function getGame(fastify) {
    return async function (request, reply) {
        return reply.sendFile('pong.html');
    };
}
