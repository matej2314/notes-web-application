import { formDate } from './formFunctions.js';
import { divNoteStyle } from './divNote_handler.js';

('use strict');

export const showNotes = function (notes) {
	const divNotes = document.getElementById('divNotes');

	notes.notes.forEach(note => {
		const newDate = formDate(new Date(note.date));

		const div = document.createElement('div');
		div.className = 'note-container';

		const backgroundColor = note.weight < 2 ? '#ffffa2' : '#ff7ecd';
		div.setAttribute('style', `background-color: ${backgroundColor}; height: fit-content; width: 25%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 15px; margin: 15px 0 0 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);`);

		const h2Title = document.createElement('h2');
		h2Title.setAttribute('style', 'width: 100%; font-family: "Shantell Sans", cursive; text-align: center; text-decoration: underline;');
		h2Title.textContent = note.title;

		const dateheader = document.createElement('h2');
		dateheader.setAttribute('style', 'width: 100%; font-family: "Shantell Sans"; text-align: center; margin-bottom: 2px;');
		dateheader.textContent = `Utworzona dnia: ${newDate}`;

		const h4Weight = document.createElement('h4');
		h4Weight.setAttribute('style', 'width: 100%; font-family: "Roboto", sans-serif; font-size: 0.875rem; text-align: center; margin-bottom: 2px;');
		h4Weight.textContent = `Priorytet: ${note.weight}`;

		const pNote = document.createElement('p');
		pNote.setAttribute('style', 'width: 100%; font-family: Shantell Sans", cursive; font-size: 1rem; margin-left: 0.5rem; text-align: left; text-wrap: wrap;');
		pNote.textContent = note.note;

		const iconsContainer = document.createElement('div');
		iconsContainer.setAttribute('style', 'width: 100%; display: flex; justify-content: flex-end; margin-top: 1rem;');

		const pdfBtn = document.createElement('button');
		pdfBtn.classList.add('pdf_note--btn');
		pdfBtn.setAttribute('data-noteId', note.id);
		pdfBtn.setAttribute('data-noteTitle', note.title);
		pdfBtn.setAttribute('data-notedate', newDate);
		pdfBtn.setAttribute('data-noteText', note.note);
		const pdfImg = document.createElement('img');
		pdfImg.src = '../images/pdf-file.png';
		pdfImg.alt = 'generate-pdf-file';
		pdfBtn.appendChild(pdfImg);

		const editBtn = document.createElement('button');
		editBtn.classList.add('edit_note--btn');
		editBtn.setAttribute('data-noteId', note.id);
		editBtn.setAttribute('data-noteTitle', note.title);
		editBtn.setAttribute('data-noteWeight', note.weight);
		editBtn.setAttribute('data-noteText', note.note);

		const editImg = document.createElement('img');
		editImg.src = '../images/edit.png';
		editImg.alt = 'edit your note';
		editImg.setAttribute('style', 'margin-left: 1rem;');
		editBtn.appendChild(editImg);

		const deleteBtn = document.createElement('button');
		deleteBtn.classList.add('del_note--btn');
		deleteBtn.setAttribute('data-noteId', note.id);
		const deleteImg = document.createElement('img');
		deleteImg.src = '../images/bin.png';
		deleteImg.alt = 'delete your note';
		deleteImg.setAttribute('style', 'margin-left: 1rem; ');
		deleteBtn.appendChild(deleteImg);

		iconsContainer.appendChild(pdfBtn);
		iconsContainer.appendChild(editBtn);
		iconsContainer.appendChild(deleteBtn);

		div.appendChild(h2Title);
		div.appendChild(dateheader);
		div.appendChild(h4Weight);
		div.appendChild(pNote);
		div.appendChild(iconsContainer);

		divNotes.appendChild(div);
	});
};

divNoteStyle();

export const updateNote = async function (noteId, noteTitle, noteContent, noteWeight) {
	try {
		const response = await fetch('http://localhost:8088/notes/edit', {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ noteId: noteId, noteTitle: noteTitle, noteText: noteContent, noteWeight: noteWeight }),
		});

		if (!response.ok) {
			console.log('Wystąpił błąd podczas aktualizacji notatki:', response.statusText);
			alert('Błąd podczas aktualizacji notatki.');
			return;
		}

		const updatedNote = await response.json();
		return updatedNote;
	} catch (error) {
		if (error) {
			console.log('Błąd aktualizacji notatki:', error.message);
		}
	}
};

export const deleteNote = async function (noteId, noteElement) {
	console.log(noteId, noteElement);
	try {
		const response = await fetch(`http://localhost:8088/notes/delete`, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ noteId }),
		});

		if (!response.ok) {
			console.log('Wystąpił błąd podczas wysyłania danych:', response.statusText);
			alert('Błąd podczas usuwania notatki.');
			return;
		}

		noteElement.remove();
		alert('Notatka została usunięta');
	} catch (error) {
		if (error) {
			console.log('Wystąpił błąd:', error.message);
			alert('Nie udało się usunąć notatki');
		}
	}
};
