import fs from 'fs';
export async function navbar(fastify, request, html) {
    const username = await fastify.database.fetch_one('SELECT username from user where id = ?', [request.session.userId]);
    const isAuth = request.session.authenticated;
    // Inject dynamic buttons
    const rendered = html.replace(`<!-- Navigation -->`, isAuth
        ? fs.readFileSync("./public/navbar/logged.html", "utf8").replace("USERNAME", username.username)
        : fs.readFileSync("./public/navbar/default.html", "utf8"));
    return rendered;
}
export function getRoot(fastify) {
    return async function (request, reply) {
        let html = fs.readFileSync("./public/index.html", "utf8");
        const isAuth = request.session.authenticated;
        const username = await fastify.database.fetch_one('SELECT username from user where id = ?', [request.session.userId]);
        // Inject dynamic buttons
        html = await navbar(fastify, request, html);
        return reply.header("Content-Type", "text/html").send(html);
    };
}
export function getAccount(fastify) {
    return async function (request, reply) {
        if (!request.session.authenticated)
            reply.redirect("/");
        return reply.sendFile("account.html");
    };
}
export function getGame(fastify) {
    return async function (request, reply) {
        return reply.sendFile('pong.html');
    };
}
