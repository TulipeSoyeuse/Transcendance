import { GameManager } from "../../game/gameManager.js";
export function check_user(fastify) {
    // return the async function needed by the get handler
    return async function (request, reply) {
        const username = request.body.username;
        fastify.database.get('SELECT id FROM users WHERE username = ?', username, (err, row) => {
            if (err) {
                console.error(err);
                return reply.status(500).send({ error: 'no user found', exists: 0 });
            }
            reply.send({ exists: 1 });
        });
    };
}
export function handle_game(fastify) {
    return async function (request, reply) {
        const gm = GameManager.getInstance();
        console.log("session : ", request.session);
        console.log("REQUÊTE REÇUE !");
        console.log("Body :", request.body);
        const mode = request.body.mode;
        console.log("Mode :", mode);
        if (mode === "local" || mode === "remote") {
            console.log("Appel de Game Manager");
        }
        else {
            console.error("Erreur : mode invalide", mode);
        }
        //reply.send({ status: "ok" });
    };
}
