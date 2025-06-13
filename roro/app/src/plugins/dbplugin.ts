import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
    const db = new sqlite3.Database('src/db/db.sqlite3')
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing DB:', err.message);
        } else {
            console.log('Database initialized successfully.');
        }
    });

    fastify.decorate('database', db);
});
