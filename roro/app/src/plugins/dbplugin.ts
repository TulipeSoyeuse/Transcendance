import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

//TODO: Create a custom class SQLiteStore, bind it with fastity/session (save session and cookie in db instead of memory)
export default fp(async function (fastify: FastifyInstance, options: FastifyPluginOptions) {
    let db = new sqlite3.Database('src/db/db.sqlite3');
    const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');

    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing DB:', err.message);
        } else {
            console.log('Database initialized successfully.');
        }
    });

    db.fetch_all = async function (query: string, params: any[]) {
        return new Promise<any[]>((resolve, reject) => {
            this.prepare(query).all(...params, (err: Error, rows: string[]) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            })
        })
    }

    db.fetch_one = async function (query: string, params: any[]) {
        return new Promise<any>((resolve, reject) => {
            this.prepare(query).all(...params, (err: Error, row: any) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            })
        })
    }

    fastify.decorate('database', db);
});
