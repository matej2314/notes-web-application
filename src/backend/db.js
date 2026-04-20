import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const poolConfig = {
	host: process.env.DB_HOST,
	...(process.env.DB_PORT && { port: Number(process.env.DB_PORT) }),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
};

const pool = mysql.createPool(poolConfig);

logger.info('DB pool ready.');

/**
 * Runs callback with one pool connection inside a transaction (commit/rollback + release).
 * Use for multiple related queries; single-query handlers can use pool.query directly.
 */
export async function withTransaction(callback) {
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		const result = await callback(conn);
		await conn.commit();
		return result;
	} catch (err) {
		await conn.rollback();
		throw err;
	} finally {
		conn.release();
	}
}

export default pool;
