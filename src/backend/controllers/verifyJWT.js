import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { logger } from '../logger.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
	const token = req.cookies['SESSID'];

	if (!token) {
		logger.error('Błąd uwierzytelniania');
		return res.status(401).send('Błąd uwierzytelniania. Brak dostępu.');
	}

	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			logger.error('Błąd autoryzacji:', err);
			return res.status(401).send('Dane uwierzytelniające nie prawidłowe.');
		}

		req.userId = decoded.id;
		next();
	});
};
