// GET /api/dashboard/gamehistory
export function getGameHistory(fastify) {
    return async function (request, reply) {
        try {
            const allGames = await fastify.database.fetch_all(`SELECT * FROM match
			WHERE (player_1 = ? OR player_2 = ?)
			ORDER BY id ASC`, [request.session.userId]);
            if (!allGames)
                return (reply.status(404).send({ message: "No games played" }));
            return (reply.send(allGames));
        }
        catch (err) {
            console.error("Failed to fetch conversation", err);
            reply.status(500).send({ error: "Database error" });
        }
    };
}
// !!!!! User inner join and return usernames
// ! handle seeing other users' profile - fetch all data ? 
