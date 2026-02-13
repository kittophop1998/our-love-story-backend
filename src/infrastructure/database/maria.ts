import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2';
import { Database } from './schema';
import { config } from "../config";

const configDb = new MysqlDialect({
    pool: createPool({
        database: config.database.name,
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        port: config.database.port,
        connectionLimit: 10,
        timezone: '+07:00',
    })
});

export const db = new Kysely<Database>({
    dialect: configDb
});