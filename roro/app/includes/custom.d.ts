import 'fastify'
import { Database } from '../src/plugins/dbplugin';
import { sqlite3 } from 'sqlite3';
import type { Logger } from 'pino'

declare module 'fastify' {
    interface FastifyInstance {
        database: Database;
    }

    interface Session {
        authenticated?: boolean;
        userId?: number;
    }
}
