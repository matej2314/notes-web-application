import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { createLogger, format } = winston;
const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logDir = path.join(__dirname, '../logs');

export const logger = createLogger({
	format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
	transports: [
		new DailyRotateFile({
			filename: path.join(logDir, 'error-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			level: 'error',
			maxFiles: '3d', // max 3 days of storage
		}),
		new DailyRotateFile({
			filename: path.join(logDir, 'combined-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			maxFiles: '3d',
		}),
	],
});

