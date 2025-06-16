"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class Database extends sqlite3_1.default.Database {
    async fetch_all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.prepare(query).all(...params, (err, rows) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(rows);
            });
        });
    }
    async fetch_one(query, params = []) {
        return new Promise((resolve, reject) => {
            this.prepare(query).get(...params, (err, row) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(row);
            });
        });
    }
}
exports.Database = Database;
//TODO: extend class database to a custom class SQLiteStore, bind it with fastity/session (save session and cookie in db instead of memory)
exports.default = (0, fastify_plugin_1.default)(async function (fastify, options) {
    const db = new Database('src/db/db.sqlite3');
    const schema = fs_1.default.readFileSync(path_1.default.join(__dirname, '../db/schema.sql'), 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing DB:', err.message);
        }
        else {
            console.log('Database initialized successfully.');
        }
    });
    // fastify.database == db
    fastify.decorate('database', db);
});
