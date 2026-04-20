import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import connection from '../db.js';
import { logger } from '../logger.js';
import { isValidPassword, isValidEmail, isValidUsername } from '../lib/validation/validationUtils.js';
import notesErrorHandler from '../lib/notesErrorHandler.js';
import jwtCookieOptions from '../lib/jwtCookieOptions.js';

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

		const [existing] = await connection.query('SELECT email FROM users WHERE email = ?', [reg_email]);
		if (existing.length > 0) {
			return res.status(400).send('Ten adres e-mail jest już zarejestrowany!');
		}

		const hashedPasswd = await bcrypt.hash(reg_password, 10);
		const userId = uuidv4();

		await connection.query('INSERT INTO users SET ?', {
			id: userId,
			name: reg_username,
			email: reg_email,
			password: hashedPasswd,
		});

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
		const [results] = await connection.query('SELECT id, name, email, password FROM users WHERE email = ?', [email]);

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
		const [emailTaken] = await connection.query('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, userId]);
		if (emailTaken.length > 0) {
			return res.status(400).json({ message: 'Ten adres e-mail jest już zarejestrowany!' });
		}

		const [userRows] = await connection.query('SELECT id FROM users WHERE id = ? AND name = ? AND email = ?', [userId, username, email]);
		if (userRows.length === 0) {
			return res.status(400).json({ message: 'Podano nieprawidłowe dane użytkownika' });
		}

		const [updateResult] = await connection.query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);
		if (updateResult.affectedRows === 0) {
			return res.status(400).json({ message: 'Nie udało się zmienić adresu e-mail' });
		}
		return res.status(200).json({ message: 'Adres e-mail zmieniony pomyślnie' });
	} catch (error) {
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
		const [rows] = await connection.query('SELECT password FROM users WHERE id = ? AND name = ?', [userId, userName]);

		if (rows.length === 0) {
			return res.status(400).json({ message: 'Nieprawidłowe dane użytkownika.' });
		}

		const row = rows[0];
		const isMatch = await bcrypt.compare(oldPass, row.password);

		if (!isMatch) {
			return res.status(400).json({ message: 'Podaj poprawne obecne hasło.' });
		}

		const hashedPasswd = await bcrypt.hash(newPass, 10);

		const [updateResult] = await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPasswd, userId]);
		if (updateResult.affectedRows === 0) {
			return res.status(400).json({ message: 'Nie udało się zmienić hasła' });
		}

		return res.status(200).json({ message: 'Hasło zostało zmienione.' });
	} catch (error) {
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
