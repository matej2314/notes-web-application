import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredDbEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
function validateDbEnv() {
	const missing = requiredDbEnv.filter((key) => !process.env[key]?.trim());
	if (missing.length) {
		throw new Error(
			`Brak wymaganych zmiennych środowiskowych bazy: ${missing.join(', ')}`,
		);
	}
	const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error(
			`Nieprawidłowy DB_PORT: "${process.env.DB_PORT}" (oczekiwano 1–65535).`,
		);
	}
	return {
		host: process.env.DB_HOST.trim(),
		port,
		user: process.env.DB_USER.trim(),
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME.trim(),
	};
}
dotenv.config({ path: path.join(__dirname, '../../.env') });
const dbConfig = validateDbEnv();

const pool = mysql.createPool({
	host: dbConfig.host,
	port: dbConfig.port,
	user: dbConfig.user,
	password: dbConfig.password,
	database: dbConfig.database,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

pool.on('connection', (connection) => {
	logger.log('New DB Connection established.');
});

export default pool;
