import { Database } from "../src/plugins/dbplugin";
import "fastify";

declare module "fastify" {
    interface FastifyInstance {
        database: Database;
    }

    interface Session {
        authenticated?: boolean;
        userId?: number;
    }
}
