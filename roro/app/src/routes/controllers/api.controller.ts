import fastifySession from "@fastify/session";
import { notStrictEqual } from "assert";
import { FastifyReply, FastifyRequest, FastifyInstance } from "fastify";
import { GameManager } from "../../game/gameManager.js";

export function check_user(fastify: FastifyInstance) {
    // return the async function needed by the get handler
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const username = (request.body as { username: string }).username;
        fastify.database.get('SELECT id FROM users WHERE username = ?', username, (err: Error, row: any[]) => {
            if (err) {
                console.error(err)
                return reply.status(500).send({ error: 'no user found', exists: 0 });
            }

            reply.send({ exists: 1 });
        });
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
  