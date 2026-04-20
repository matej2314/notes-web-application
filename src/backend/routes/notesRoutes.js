import express from 'express';
const router = express.Router();
import pool from '../db.js';
import bodyParser from 'body-parser';
import generatePDF from '../controllers/generatePDF.js';
import { verifyToken } from '../controllers/verifyJWT.js';
import { v4 as uuidv4 } from 'uuid';
import formattedDate from '../backend_modules/formattedDate.js';
import { notesQueries } from '../lib/queries/notesQueries.js';
import notesErrorHandler from '../lib/notesErrorHandler.js';

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const verifyJWT = verifyToken;

router.post('/', verifyJWT, async (req, res) => {
	const userId = req.userId;
	const noteTitle = req.body.noteTitle;
	const noteContent = req.body.noteText;
	const noteWeight = req.body.noteWeight;

	if (!userId || !noteContent || !noteTitle || noteContent.trim() === '') {
		return res.status(400).send('Prześlij poprawne dane!');
	}

	const id = uuidv4();
	const date = formattedDate(new Date());

	const sqlQuery = notesQueries.saveNote;

	try {
		await pool.query(sqlQuery, [id, userId, noteTitle, noteContent, noteWeight, date]);
		res.status(201).json({
			message: 'Notatka dodana pomyślnie!',
			noteId: id,
		});
	} catch (err) {
		notesErrorHandler(err, 500, 'Błąd podczas dodawania notatki:', `Błąd serwera: ${err.message}`, res);
	}
});

router.get('/all', verifyJWT, async (req, res) => {
	const userId = req.userId;

	if (!userId) {
		return res.status(400).send('Brak danych');
	}

	const sqlQuery = notesQueries.getAllNotes;

	try {
		const [rows] = await pool.query(sqlQuery, [userId]);
		if (rows.length === 0) {
			return res.status(200).json({ notes: [] });
		}

		res.status(200).json({
			notes: rows,
		});
	} catch (err) {
		notesErrorHandler(err, 500, 'Błąd podczas pobierania danych:', `Błąd serwera: ${err.message}`, res);
	}
});

router.get('/:noteId', verifyJWT, async (req, res) => {
	const userId = req.userId;
	const noteId = req.params.noteId;

	if (!userId || !noteId) {
		return res.status(400).send('Prześlij poprawne dane!');
	}

	const sqlQuery = notesQueries.getNote;

	try {
		const [result] = await pool.query(sqlQuery, [noteId, userId]);

		if (result.length === 0) {
			return res.status(200).json({
				message: 'Notatka nie została znaleziona',
				id: noteId,
				userId: userId,
				noteTitle: null,
				noteText: null,
				noteWeight: null,
				date: null,
			});
		}

		const note = result[0];
		res.status(200).json({
			id: note.id,
			userId: note.user_id,
			noteTitle: note.title,
			noteText: note.note,
			noteWeight: note.weight,
			date: note.date,
		});
	} catch (err) {
		notesErrorHandler(err, 500, 'Błąd pobierania danych:', `Błąd serwera: ${err.message}`, res);
	}
});

router.put('/edit', verifyJWT, async (req, res) => {
	const noteId = req.body.noteId;
	const noteTitle = req.body.noteTitle;
	const noteContent = req.body.noteText;
	const noteWeight = req.body.noteWeight;
	const userId = req.userId;

	if (!noteId || !noteContent || noteContent.trim() === '') {
		return res.status(400).json({ message: 'Niepoprawne dane' });
	}

	const sqlQuery = notesQueries.updateNote;

	try {
		await pool.query(sqlQuery, [noteTitle, noteContent, noteWeight, noteId, userId]);
		return res.status(200).json({ message: 'Notatka zaktualizowana' });
	} catch (err) {
		notesErrorHandler(err, 500, 'Błąd podczas aktualizacji notatki:', `Błąd serwera: ${err.message}`, res);
	}
});

router.delete('/delete', verifyJWT, async (req, res) => {
	const userId = req.userId;
	const noteId = req.body.noteId;

	if (!userId || !noteId) {
		return res.status(400).send('Dane niepoprawne');
	}

	const sqlQuery = notesQueries.deleteNote;

	try {
		const [result] = await pool.query(sqlQuery, [noteId, userId]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: 'Notatka nie została znaleziona' });
		}
		return res.status(200).json({ message: 'Notatka usunięta pomyślnie' });
	} catch (err) {
		notesErrorHandler(err, 500, 'Błąd podczas usuwania danych:', `Błąd serwera: ${err.message}`, res);
	}
});

router.post('/generate-pdf', verifyJWT, generatePDF);

export default router;
