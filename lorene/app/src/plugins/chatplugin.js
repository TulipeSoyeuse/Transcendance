import fp from "fastify-plugin";
import { parse } from "cookie";
// Verify session before connection & link session to socket
function setupSocketAuth(io, fastify) {
    io.use(async (socket, next) => {
        const cookies = parse(socket.request.headers.cookie || "");
        const signedSessionId = cookies.sessionId;
        if (!signedSessionId)
            return (next(new Error("No session Id found")));
        const sessionId = signedSessionId.split(".")[0];
        fastify.sessionStore.get(sessionId, (err, session) => {
            if (err || !session || !session.authenticated)
                return (next(new Error("Unauthorized connection")));
            socket.session = session; // ! Extend socket type in interface
            session.socketId = socket.id; // ! Extend session type in interface
            fastify.sessionStore.set(sessionId, session, (e) => {
                if (e)
                    return (next(new Error("No session Id found")));
                console.log("Session user ID = ", socket.session.userId);
                next();
            });
        });
    });
}
// Handle messages & db interaction
function handleConnection(fastify, socket, io) {
    console.log(`User connected:`, socket.id);
    socket.on("message", async (msg) => {
        let res;
        try {
            res = await fastify.database.run('INSERT INTO messages (content) VALUES (?)', msg);
        }
        catch (e) {
            console.error("Failed to insert message in database: ", e); // TODO handle failure
        }
        const data = { senderId: socket.id, msg, serverOffset: res.lastId };
        io.emit("message", data);
    });
}
// Handle message recovery after disconnection
async function handleRecovery(socket, fastify) {
    if (!socket.recovered) {
        try {
            await fastify.database.each('SELECT id, content FROM messages WHERE id > ?', // ! change this when changing db table
            [socket.handshake.auth.serverOffset || 0], (_err, row) => {
                socket.emit('message', { senderId: 'server', msg: row.content, serverOffset: row.id });
            });
        }
        catch (e) {
            console.error("Failed to recover messages: ", e);
        }
    }
}
const chatPlugin = async (fastify) => {
    const io = fastify.io;
    // const userSockets = new Map<number, string>();       // ! Attach user ID to socket for later use
    setupSocketAuth(io, fastify);
    io.on("connection", (socket) => {
        handleConnection(fastify, socket, io);
        // userSockets.set(socket.session.user.id, socket.id); // ! 1 tab = 1 session (if multiple tabs : Map<userId, Set<socket.id>>)
        handleRecovery(socket, fastify);
    });
};
export default fp(chatPlugin);
/*
interface Session {
  user?: { id: number; username: string };
  authenticated?: boolean;
  socketId?: string;
}

interface Socket {
  session?: MySession;
  userId?: number;
}
*/ 
