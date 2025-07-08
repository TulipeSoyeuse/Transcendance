import { FastifyInstance } from "fastify";

export async function authConfigRoutes(fastify: FastifyInstance) {
    fastify.get("/api/auth/google-client-id", async (request, reply) => {
      return { clientId: process.env.GOOGLE_CLIENT_ID };
    });
}
