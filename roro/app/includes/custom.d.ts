import sqlite3 from 'sqlite3';

declare module 'fastify' {
    interface FastifyInstance {
        database: sqlite3.Database;
    }
}
