import 'fastify'
import { Database } from '../src/plugins/dbplugin';

// declare module 'Database' {
//     interface Database {
//         async fetch_all(query: string, params?: any[]): Promise<any[]>;
//         async fetch_one(query: string, params?: any[]): Promise<any>;
//     }
// }

declare module 'fastify' {
    interface FastifyInstance {
        database: Database;
    }

    interface Session {
        authenticated?: boolean;
        userId?: number;
    }
}
