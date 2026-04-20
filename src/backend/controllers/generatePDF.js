'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { logger } from '../logger.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datetime = new Date().toLocaleString('pl');

const generatePDF = async (req, res) => {
	const userId = req.userId;
	const noteId = req.body.noteId;
	const noteTitle = req.body.noteTitle;
	const noteContent = req.body.noteText;
	const noteDate = req.body.noteDate;

	if (!userId || !noteId || !noteTitle || !noteContent || !noteDate) {
		logger.error('Brak danych do PDF');
		return res.status(400).json({ message: 'Brak danych do PDF.' });
	}

	const doc = new PDFDocument();
	const filePath = path.join(__dirname, `note-${userId}-${uuidv4()}.pdf`);
	const fileStream = fs.createWriteStream(filePath);
	doc.pipe(fileStream);

	doc.font(path.join(__dirname, '../../fonts/Roboto/Roboto-Regular.ttf'));

	doc.rect(0, 0, doc.page.width, doc.page.height).fill('white');
	doc.y = 8;

	doc.fillColor('black');
	doc.lineGap(5);
	doc.fontSize(16);
	doc.text(`Notatka: ${noteTitle}`, { underline: true, align: 'center' });
	doc.moveDown();
	doc.text(`Utworzona dnia ${noteDate}`, { align: 'center' });
	doc.text(`ID: ${noteId}`, { align: 'center' });
	doc.moveDown();
	doc.text(`Treść:  ${noteContent}`);
	doc.moveDown();
	doc.text(`Wygenerowano dnia:  ${datetime}`);
	doc.end();

	fileStream.on('finish', () => {
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', 'attachment; filename="notatka.pdf"');
		res.sendFile(filePath, err => {
			if (err) {
				logger.error('Wystąpił błąd podczas wysyłania pliku:', err.message);
				res.status(500).json({ message: 'Błąd pobierania pliku PDF' });
				return;
			} else {
				console.log('Plik PDF został wysłany');

				fs.unlink(filePath, err => {
					if (err) {
						console.log('Wystąpił błąd:', err.message);
						return;
					} else {
						console.log('Plik PDF został usunięty z serwera.');
						return;
					}
				});
			}
		});
	});
};

export default generatePDF;
