import { Socket } from "socket.io";
import { Database } from "../src/plugins/dbplugin";
import "fastify";
import { SessionStore } from "@fastify/session";

declare module "fastify" {
    interface FastifyInstance {
        database: Database;
        io: Socket;
    }

    interface Session {
        authenticated?: boolean;
        userId?: number;
        socketId?: string;
    }
}

interface Player {
    session: FastifySessionObject | undefined;
    socket: any;
    username: string | undefined;
}

declare module 'canvas-confetti' {
    const confetti: (options?: any) => void;
    export default confetti;
  }