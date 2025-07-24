// ! tmp
async function runInsertTest(fastify) {
    return new Promise((resolve, reject) => {
        fastify.database.run(`INSERT INTO match (player_1, score_player_1, player_2, score_player_2, winner, date)
		VALUES (?, ?, ?, ?, ?, '2025-07-24 15:30:00')`, [1, 5, 2, 3, 1], function (err) {
            if (err) {
                console.error("Failed to insert blocked user:", err.message);
                reject(err);
            }
            resolve();
        });
    });
}
// GET /api/dashboard/gamehistory
export function getGameHistory(fastify) {
    return async function (request, reply) {
        try {
            await runInsertTest(fastify);
            const currentUserId = request.session.userId;
            const allGames = await fastify.database.fetch_all(`SELECT
				m.id AS game_id,
				m.player_1 AS id_player1,
				m.player_2 AS id_player2,
				m.score_player_1,
				m.score_player_2,
				m.winner,
				m.date AS created_at,
				u1.username AS username_player1,
				u2.username AS username_player2,
				CASE WHEN m.player_1 = ? THEN 1 ELSE 0 END AS current_is_player1
				FROM match m
				INNER JOIN user u1 ON m.player_1 = u1.id
				INNER JOIN user u2 ON m.player_2 = u2.id
				WHERE (m.player_1 = ? OR m.player_2 = ?)
				ORDER BY m.id ASC`, [currentUserId, currentUserId, currentUserId]);
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
/*
reply.send({
  currentUsername: user.username,
  games: allGames
});

const { currentUsername, games } = await fetch('/matches').then(r => r.json());

*/ 
