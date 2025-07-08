export async function authConfigRoutes(fastify) {
    fastify.get("/api/auth/google-client-id", async (request, reply) => {
        return { clientId: process.env.GOOGLE_CLIENT_ID };
    });
}
