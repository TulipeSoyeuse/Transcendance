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


declare interface Player {
    session: SessionStore;
    socketId: string;
}