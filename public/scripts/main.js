import { showNotes, updateNote } from '../JS_modules/main_page_functions.js';
import { logOut, changeEmailFr, changePassFr } from '../JS_modules/user_functions.js';
import { showAddForm, closeAddForm, closeEditForm, MailForm, changePassForm } from '../JS_modules/formFunctions.js';
import { showAvatarForm, getAvatar, createAvatarHandler, uploadAvatar, closeAvatarForm } from '../JS_modules/avatar_functions.js';
import { divNoteHandler } from '../JS_modules/divNote_handler.js';

const logOutBtns = document.querySelectorAll('.logOutBtn');
const addNoteBtns = document.querySelectorAll('.addnote');
const noteTitle = document.getElementById('input_noteTitle');
const noteWeight = document.getElementById('input_noteWeight');
const noteText = document.getElementById('input_noteText');
const saveNoteBtn = document.getElementById('sendNote--btn');
const editModal = document.getElementById('editNote--form');
const updatedNoteBtn = document.getElementById('sendNewNote--btn');
const fromNewestBtn = document.getElementById('fromNewest--btn');
const fromOldestBtn = document.getElementById('fromOldest--btn');
const changeEmailBtn = document.getElementById('sendNewEmail--btn');
const changePassBtn = document.getElementById('changePass--btn');

const addNote = async function () {
	const noteTitleValue = noteTitle.value;
	const noteTextValue = noteText.value;
	const noteWeightValue = noteWeight.value;

	try {
		const response = await fetch('http://localhost:8088/notes', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				noteTitle: noteTitleValue,
				noteText: noteTextValue,
				noteWeight: noteWeightValue,
			}),
			credentials: 'include',
		});

		if (!response.ok) {
			console.log('Wystąpił błąd podczas wysyłania danych:', response.statusText);
			alert('Błąd pobierania danych');
			return;
		}

		const addedNote = await response.json();

		if (addedNote && addedNote.noteId) {
			alert(`Dodano notatkę o ID: ${addedNote.noteId}`);
			location.reload();
		}
	} catch (error) {
		console.log('Wystąpił błąd podczas wysyłania danych:', error.message);
		alert('Wystąpił błąd. Spróbuj ponownie.');
	}
};

saveNoteBtn.addEventListener('click', function (e) {
	e.preventDefault();
	addNote();
	closeAddForm();
});

document.addEventListener('DOMContentLoaded', function () {
	const getAllNotes = async function () {
		try {
			const response = await fetch('http://localhost:8088/notes/all', {
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Nie udało się pobrać notatek', response.statusText);
			}

			const notes = await response.json();
			return notes;
		} catch (error) {
			console.log('Wystąpił błąd podczas pobierania notatek:', error.message);
			alert('Nie udało się pobrać notatek');
			return null;
		}
	};

	let currentNotes = [];

	const sortNotes = (notes, order) => {
		return notes.sort((a, b) => new Date(order === 'newest' ? b.date : a.date) - new Date(order === 'newest' ? a.date : b.date));
	};

	const loadNotes = async () => {
		const notes = await getAllNotes();
		if (notes) {
			currentNotes = notes.notes;
			showNotes({ notes: sortNotes(currentNotes, 'newest') });
		}
	};

	loadNotes();

	const updateNotes = order => {
		clearNotes();
		showNotes({ notes: sortNotes(currentNotes, order) });
	};

	fromOldestBtn.addEventListener('click', () => updateNotes('oldest'));
	fromNewestBtn.addEventListener('click', () => updateNotes('newest'));

	const clearNotes = () => {
		while (divNotes.firstChild) {
			divNotes.removeChild(divNotes.firstChild);
		}
	};

	divNoteHandler();
	getAvatar();
	createAvatarHandler();
	showAvatarForm();
	uploadAvatar();
	closeAddForm();
	closeEditForm();
	MailForm();
	changePassForm();
	closeAvatarForm();
});

updatedNoteBtn.addEventListener('click', function (e) {
	e.preventDefault();
	const noteTitle = document.getElementById('input_editTitle').value;
	const noteWeight = document.getElementById('input_editWeight').value;
	const noteContent = document.getElementById('input_editNoteText').value;
	const noteId = updatedNoteBtn.getAttribute('data-noteId');

	updateNote(noteId, noteTitle, noteContent, noteWeight);

	updatedNoteBtn.removeAttribute('data-noteId');
	editModal.classList.remove('visible');
	editModal.classList.add('invisible');

	location.reload();
});

changeEmailBtn.addEventListener('click', function (e) {
	e.preventDefault();
	changeEmailFr();
});
changePassBtn.addEventListener('click', function (e) {
	e.preventDefault();
	changePassFr();
});

logOutBtns.forEach(btn => btn.addEventListener('click', logOut));

addNoteBtns.forEach(btn => btn.addEventListener('click', showAddForm));
