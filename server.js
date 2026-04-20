import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './.env' });
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
const app = express();
const port = process.env.SERV_PORT || 8088;
import favicon from 'serve-favicon';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { logger } from './src/backend/logger.js';

app.use(cookieParser());
app.use(express.json());

app.use(
	cors({
		origin: (origin, callback) => {
			const allowedOrigins = [`http://localhost:8088`, `http://127.0.0.1:8088`];
			if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
	})
);

app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(favicon(path.join(__dirname, './public/images', 'favicon.ico')));

import indexRoutes from './src/backend/routes/pages.js';
import notesRoutes from './src/backend/routes/notesRoutes.js';
import authRoutes from './src/backend/routes/auth.js';

app.use('/notes', notesRoutes);
app.use('/', indexRoutes);
app.use('/', authRoutes);

app.listen(port, () => {
	logger.info(`SERVER LISTENING ON PORT ${port}`);
});
