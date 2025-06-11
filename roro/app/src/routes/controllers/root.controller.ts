import { FastifyReply, FastifyRequest } from "fastify";

export async function getroot(request: FastifyRequest, reply: FastifyReply) {
    return reply.sendFile('index.html');
}
