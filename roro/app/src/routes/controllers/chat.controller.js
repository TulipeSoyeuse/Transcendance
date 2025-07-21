// GET /api/chat/conversation?target=1
export function getConversation(fastify) {
    return async function (request, reply) {
        const { target } = request.query;
        try {
            let user1 = request.session.userId;
            let user2 = parseInt(target);
            [user1, user2] = [user1, user2].sort((a, b) => a - b);
            const convId = await fastify.database.fetch_one(`SELECT id FROM conversations 
             WHERE (user1_id = ? AND user2_id = ?)`, [user1, user2]);
            if (!convId)
                return (reply.status(404).send({ message: "New conversation" }));
            return (reply.send(convId));
        }
        catch (err) {
            console.error("Failed to fetch conversation", err);
            reply.status(500).send({ error: "Database error" });
        }
    };
}
// GET /api/chat/:conversationId/messages
export function getMessages(fastify) {
    return async function (request, reply) {
        const { conversationId } = request.params;
        try {
            const convId = parseInt(conversationId);
            const messages = await fastify.database.fetch_all(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC`, [convId]);
            return (reply.send(messages));
        }
        catch (err) {
            console.error("Failed to fetch messages", err);
            reply.status(500).send({ error: "Database error" });
        }
    };
}
// GET /api/chat/blocked
export function getBlocked(fastify) {
    return async function (request, reply) {
        try {
            const blockerId = request.session.userId;
            const blockedUsers = await fastify.database.fetch_all(`SELECT blocked_id FROM blocks WHERE blocker_id = ?`, [blockerId]);
            if (!blockedUsers)
                return (reply.status(404).send({ message: "No blocked users" }));
            // console.log("Blocked users:", blockedUsers); // ! DEBUG
            return (reply.send(blockedUsers));
        }
        catch (err) {
            console.error("Failed to fetch blocked users", err);
            reply.status(500).send({ error: "Database error" });
        }
    };
}
