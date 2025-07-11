export async function navbar(request, reply) {
    if (request.session.authenticated)
        return reply.sendFile('/navbar/logged.html');
    else {
        return reply.sendFile('/navbar/default.html');
    }
}
export function getRoot(fastify) {
    return async function (request, reply) {
        return reply.sendFile("index.html");
    };
}
export function getAccount(fastify) {
    return async function (request, reply) {
        // if (!request.session.authenticated) reply.redirect("/");
        // else {
        //     const query = `Select m.id, u1.username as player_1, m.score_player_1, u2.username as player_2, m.score_player_2, w.username as winner from "match" m
        //         INNER JOIN user u1 ON m.player_1 = u1.id
        //         INNER JOIN user u2 ON m.player_2 = u2.id
        //         INNER JOIN user w ON m.winner = w.id
        //         WHERE m.player_1 == ? OR m.player_2 == ?;`;
        //     const balise = "<!-- HISTORY -->";
        //     const games = (await fastify.database.fetch_all(query, [
        //         request.session.userId,
        //         request.session.userId,
        //     ])) as any[];
        //     let match_history = "";
        //     games.forEach((row: GameRow) => {
        //         match_history += `
        //             <tr class="hover:bg-gray-100">
        //             <td class="py-2 px-4 border-b border-gray-300">${row.player_1}</td>
        //             <td class="py-2 px-4 border-b border-gray-300">${row.player_2}</td>
        //             <td class="py-2 px-4 border-b border-gray-300">${row.score_player_1} / ${row.score_player_2}</td>
        //             <td class="py-2 px-4 border-b border-gray-300">${row.winner}</td>
        //         </tr>`;
        //     });
        //     const html = fs
        //         .readFileSync("./public/account.html")
        //         .toString()
        //         .replace("<!-- HISTORY -->", match_history);
        //     return reply
        //         .header("Content-Type", "text/html")
        //         .send(await navbar(fastify, request, html));
        // }
        return reply.sendFile("index.html");
    };
}
export function getGame(fastify) {
    return async function (request, reply) {
        return reply.sendFile("pong.html");
    };
}
