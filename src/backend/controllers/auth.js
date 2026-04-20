import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import pool, { withTransaction } from '../db.js';
import { isValidPassword, isValidEmail, isValidUsername } from '../lib/validation/validationUtils.js';
import notesErrorHandler from '../lib/notesErrorHandler.js';
import jwtCookieOptions from '../lib/jwtCookieOptions.js';
import { authQueries } from '../lib/queries/authQueries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
	try {
		const { reg_username, reg_email, reg_password } = req.body;

		if (!reg_username || !reg_email || !reg_password) {
			notesErrorHandler(null, 400, 'Proszę uzupełnić wszystkie pola!', 'Proszę uzupełnić wszystkie pola!', res);
			return;
		}

		if (!isValidUsername(reg_username)) {
			notesErrorHandler(
				null,
				400,
				'Nieprawidłowa nazwa użytkownika! (minimum 5 znaków, tylko litery i cyfry)',
				'Nieprawidłowa nazwa użytkownika! (minimum 5 znaków, tylko litery i cyfry)',
				res
			);
			return;
		}

		if (!isValidEmail(reg_email)) {
			notesErrorHandler(null, 400, 'Podaj prawidłowy adres e-mail!', 'Podaj prawidłowy adres e-mail!', res);
			return;
		}

		if (!isValidPassword(reg_password)) {
			notesErrorHandler(
				null,
				400,
				'Wpisz prawidłowe hasło! (od 10 do 30 znaków, przynajmniej jedna duża litera, cyfra i znak specjalny: *#!^)',
				'Wpisz prawidłowe hasło! (od 10 do 30 znaków, przynajmniej jedna duża litera, cyfra i znak specjalny: *#!^)',
				res
			);
			return;
		}

		let userId;
		try {
			userId = await withTransaction(async (conn) => {
				const [existing] = await conn.query(authQueries.checkEmailExists, [reg_email]);
				if (existing.length > 0) {
					const err = new Error('Ten adres e-mail jest już zarejestrowany!');
					err.statusCode = 400;
					throw err;
				}
				const id = uuidv4();
				const hashedPasswd = await bcrypt.hash(reg_password, 10);
				await conn.query(authQueries.registerUser, {
					id,
					name: reg_username,
					email: reg_email,
					password: hashedPasswd,
				});
				return id;
			});
		} catch (err) {
			if (err.statusCode === 400) {
				return res.status(400).send(err.message);
			}
			notesErrorHandler(err, 500, err.message, 'Błąd serwera', res);
			return;
		}

		const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
		res.cookie('SESSID', token, jwtCookieOptions);

		res.status(200).json({ message: 'Użytkownik zarejestrowany pomyślnie. Możesz się zalogować!' });
	} catch (err) {
		notesErrorHandler(err, 500, err.message, 'Błąd serwera', res);
		return;
	}
};

const loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Proszę uzupełnić wszystkie pola.' });
	}

	try {
		const [results] = await pool.query(authQueries.loginUser, [email]);

		if (results.length === 0) {
			return res.status(400).json({ message: 'Niepoprawne dane logowania.' });
		}

		const user = results[0];

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(400).json({ message: 'Niepoprawny login lub hasło.' });
		}

		const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });

		res.cookie('SESSID', token, jwtCookieOptions);

		res.status(200).json({ message: 'Zalogowano pomyślnie.', username: user.name, redirectUrl: '/main' });
	} catch (error) {
		notesErrorHandler(error, 500, error.message, 'Błąd serwera', res);
	}
};

const logoutUser = (req, res) => {
	res.clearCookie('SESSID', { httpOnly: true, secure: false });
	res.status(200).json({ message: 'Wylogowano poprawnie.' });
};

const changeEmail = async (req, res) => {
	const userId = req.userId;
	const { username, email, newEmail } = req.body;

	if (!userId || !newEmail || !username || !email) {
		return res.status(400).send('Podaj prawidłowe dane');
	}

	try {
		await withTransaction(async (conn) => {
			const [emailTaken] = await conn.query(authQueries.checkUserExists, [newEmail, userId]);
			if (emailTaken.length > 0) {
				const err = new Error('Ten adres e-mail jest już zarejestrowany!');
				err.statusCode = 400;
				throw err;
			}

			const [userRows] = await conn.query(authQueries.checkUserData, [userId, username, email]);
			if (userRows.length === 0) {
				const err = new Error('Podano nieprawidłowe dane użytkownika');
				err.statusCode = 400;
				throw err;
			}

			const [updateResult] = await conn.query(authQueries.updateEmail, [newEmail, userId]);
			if (updateResult.affectedRows === 0) {
				const err = new Error('Nie udało się zmienić adresu e-mail');
				err.statusCode = 400;
				throw err;
			}
		});
		return res.status(200).json({ message: 'Adres e-mail zmieniony pomyślnie' });
	} catch (error) {
		if (error.statusCode === 400) {
			return res.status(400).json({ message: error.message });
		}
		notesErrorHandler(error, 500, error.message, 'Błąd serwera', res);
		return;
	}
};

const changePass = async (req, res) => {
	const userId = req.userId;
	const { userName, oldPass, newPass } = req.body;

	if (!userId || !userName || !oldPass || !newPass) {
		return res.status(400).json({ message: 'Brak wymaganych danych.' });
	}

	try {
		await withTransaction(async (conn) => {
			const [rows] = await conn.query(authQueries.checkPassword, [userId, userName]);

			if (rows.length === 0) {
				const err = new Error('Nieprawidłowe dane użytkownika.');
				err.statusCode = 400;
				throw err;
			}

			const row = rows[0];
			const isMatch = await bcrypt.compare(oldPass, row.password);

			if (!isMatch) {
				const err = new Error('Podaj poprawne obecne hasło.');
				err.statusCode = 400;
				throw err;
			}

			const hashedPasswd = await bcrypt.hash(newPass, 10);

			const [updateResult] = await conn.query(authQueries.updatePassword, [hashedPasswd, userId]);
			if (updateResult.affectedRows === 0) {
				const err = new Error('Nie udało się zmienić hasła');
				err.statusCode = 400;
				throw err;
			}
		});

		return res.status(200).json({ message: 'Hasło zostało zmienione.' });
	} catch (error) {
		if (error.statusCode === 400) {
			return res.status(400).json({ message: error.message });
		}
		notesErrorHandler(error, 500, error.message, 'Błąd serwera', res);
		return;
	}
};

const authController = {
	registerUser,
	loginUser,
	logoutUser,
	changeEmail,
	changePass,
};

export default authController;
