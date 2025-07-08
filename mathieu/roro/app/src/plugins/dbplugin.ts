// import fp from "fastify-plugin";
// import { FastifyInstance, FastifyPluginOptions } from "fastify";
// import sqlite3 from "sqlite3";
// import path from "path";
// import fs from "fs";

// export class Database extends sqlite3.Database {
//     async fetch_all(query: string, params: any[] = []) {
//         return new Promise<any[]>((resolve, reject) => {
//             this.prepare(query).all(...params, (err: Error, rows: string[]) => {
//                 if (err) {
//                     console.error(err);
//                     reject(err);
//                 }
//                 resolve(rows);
//             });
//         });
//     }

//     async fetch_one(query: string, params: any[] = []) {
//         return new Promise<any>((resolve, reject) => {
//             this.prepare(query).get(...params, (err: Error, row: any) => {
//                 if (err) {
//                     console.error(err);
//                     reject(err);
//                 }
//                 resolve(row);
//             });
//         });
//     }
// }

// //TODO: extend class database to a custom class SQLiteStore, bind it with fastity/session (save session and cookie in db instead of memory)
// export default fp(async function (
//     fastify: FastifyInstance,
//     options: FastifyPluginOptions,
// ) {
//     const db = new Database("src/db/db.sqlite3");
//     const __dirname = import.meta.dirname;
//     const schema = fs.readFileSync(
//         path.join(__dirname, "../db/schema.sql"),
//         "utf8",
//     );

//     db.exec(schema, (err) => {
//         if (err) {
//             fastify.log.error("Error initializing DB:", err.message);
//         } else {
//             fastify.log.info("Database initialized successfully.");
//         }
//     });
//     // fastify.database == db
//     fastify.decorate("database", db);
// });

import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export class Database extends sqlite3.Database {
    async fetch_all(query: string, params: any[] = []): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            this.prepare(query).all(...params, (err: Error, rows: any[]) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async fetch_one(query: string, params: any[] = []): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.prepare(query).get(...params, (err: Error, row: any) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
}

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default fp(async function (
    fastify: FastifyInstance,
    options: FastifyPluginOptions,
) {
    const dbPath = path.join(__dirname, "../db/db.sqlite3");
    const db = new Database(dbPath);

    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    db.exec(schema, (err) => {
        if (err) {
            fastify.log.error("Error initializing DB:", err.message);
        } else {
            fastify.log.info("Database initialized successfully.");
        }
    });

    fastify.decorate("database", db);
});