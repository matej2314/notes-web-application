import { logger } from '../logger.js';

const notesErrorHandler = (error, status, logMessage, statusMessage, res) => {
	const detail = error && error.message != null ? String(error.message) : '';
	const body = detail ? `${statusMessage}: ${detail}` : statusMessage;
	logger.error(logMessage, detail);
	return res.status(status).send(body);
};

export default notesErrorHandler;