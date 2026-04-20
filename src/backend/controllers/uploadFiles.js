import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db.js';
import { logger } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFile = (req, res) => {
	const userId = req.userId;

	if (!req.files || !req.files.userAvatar) {
		return res.status(400).json({ message: 'No files were uploaded' });
	}

	const userAvatar = req.files.userAvatar;

	if (userAvatar.size > 1024 * 1024 * 5) {
		return res.status(400).json({ message: 'File size exceeds 5MB' });
	}

	const fileExtension = path.extname(userAvatar.name);
	const fileName = `${userId}_avatar${fileExtension}`;

	const uploadPath = path.join(__dirname, '../../../public/images/avatars', fileName);

	userAvatar.mv(uploadPath, async (err) => {
		if (err) {
			logger.error(err.message);
			return res.status(500).json({ message: err.message });
		}

		const sql = 'UPDATE users SET avatar=? where id=?';

		try {
			await pool.query(sql, [fileName, userId]);
			res.status(200).json({ message: 'Plik dodany.' });
		} catch (dbErr) {
			logger.error(dbErr.message);
			return res.status(500).json({ message: 'Błąd zapisu pliku.' });
		}
	});
};

export default uploadFile;
