import connection from '../db.js';
import { logger } from '../logger.js';

const sendAvatar = async (req, res) => {
	const userId = req.userId;

	const sqlQuery = 'SELECT avatar FROM users WHERE id=?';

	try {
		const [result] = await connection.query(sqlQuery, [userId]);

		if (result.length === 0) {
			return res.status(404).json({ message: 'Nie znaleziono użytkownika.' });
		}
		const avatar = result[0].avatar;

		return res.status(200).json({
			avatar: avatar,
		});
	} catch (err) {
		logger.error(err.message);
		return res.status(500).json({ message: 'Błąd serwera.' });
	}
};

export default sendAvatar;
