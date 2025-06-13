import sqlite3 from 'sqlite3';

declare module 'sqlite3' {
    interface Database {
        fetch_all: Function
        fetch_one: Function
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        database: sqlite3.Database;
    }

    interface Session {
        authenticated?: boolean;
        userId?: number;
    }
}
