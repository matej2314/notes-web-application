export const notesQueries = {
	saveNote: 'INSERT INTO notes (id, user_id, title, note, weight, date) VALUES(?,?,?,?,?,?)',
	getNote: 'SELECT * FROM notes WHERE id = ? AND user_id = ? ',
	getAllNotes: 'SELECT * FROM notes WHERE user_id=?',
	updateNote: 'UPDATE notes SET title = ?, note = ?, weight = ? WHERE id = ? AND user_id = ?',
	deleteNote: `DELETE FROM notes WHERE id=? AND user_id=?`,
};
