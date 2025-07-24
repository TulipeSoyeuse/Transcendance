import fastifySession from "@fastify/session";
import { notStrictEqual } from "assert";
import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { GameManager } from "../../game/gameManager.js";

export function check_user(fastify: FastifyInstance) {
    // return the async function needed by the get handler
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const username = (request.body as { username: string | null }).username;
        if (!username) {
            return reply.send({ error: "no username submitted" })
        }
        const user = await fastify.database.fetch_one('SELECT username, email from user where username = ?', username)
        console.log(username)
        console.log(user)
        if (user)
            return reply.send({ exists: true });
        else {
            return reply.send({ exists: false });
        }
    }
};

export function is_logged(fastify: FastifyInstance) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        if (request.session.authenticated) {
            let user = await fastify.database.fetch_one('SELECT username, email from user where id = ?', request.session.userId)
            return {
                "autenticated": true,
                "username": user.username,
                "email": user.email,
            };
        } else {
            return { "autenticated": false };
        }
    }
}

export function handle_game(fastify: FastifyInstance) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      const gm = GameManager.getInstance(fastify);
      setInterval(() => {
        gm.checkRoomsStatus();
      }, 5000);
      const mode = (request.body as { mode: string }).mode;
      if (mode === "local" || mode === "remote") {
        gm.addRoom(mode, request.session)
      }  else {
        console.error("Erreur : mode invalide", mode);
      }
    };
  }
  