import fastify, { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import fs from 'fs'

export function getroot(fastify: FastifyInstance) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const html = fs.readFileSync("./public/index.html", "utf8");
    const isAuth = request.session.authenticated;
    const username = await fastify.database.fetch_one('SELECT username from user where id = ?', [request.session.userId]);
    // Inject dynamic buttons
    const rendered = html.replace(
      `<!-- AUTH_BUTTONS -->`,
      isAuth
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
            </button>`
    );
    return reply.header("Content-Type", "text/html").send(rendered)
  }
}

export function getgame(fastify: FastifyInstance) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('pong.html')
  }
}
