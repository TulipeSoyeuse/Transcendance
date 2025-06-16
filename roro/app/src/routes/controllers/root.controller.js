"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.navbar = navbar;
exports.getroot = getroot;
exports.getgame = getgame;
const fs_1 = __importDefault(require("fs"));
async function navbar(fastify, request, html) {
    const username = await fastify.database.fetch_one('SELECT username from user where id = ?', [request.session.userId]);
    const isAuth = request.session.authenticated;
    // Inject dynamic buttons
    const rendered = html.replace(`<!-- NAV_HEADER -->`, isAuth
        ? `<span class="text-gray-700 mr-4">${username.username}</span>
             <a href="/logout"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
               Logout
             </a>`
        : `<button onclick="openLogin()"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Login
            </button>
            <button onclick="openRegister()"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Register
            </button>`);
    return rendered;
}
function getroot(fastify) {
    return async function (request, reply) {
        let html = fs_1.default.readFileSync("./public/index.html", "utf8");
        const isAuth = request.session.authenticated;
        const username = await fastify.database.fetch_one('SELECT username from user where id = ?', [request.session.userId]);
        // Inject dynamic buttons
        html = await navbar(fastify, request, html);
        reply.header("Content-Type", "text/html").send(html);
    };
}
function getgame(fastify) {
    return async function (request, reply) {
        return reply.sendFile('pong.html');
    };
}
