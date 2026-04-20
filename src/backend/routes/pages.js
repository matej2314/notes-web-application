import express from 'express';

import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { verifyToken } from '../controllers/verifyJWT.js';
import uploadFile from '../controllers/uploadFiles.js';
import sendAvatar from '../controllers/sendAvatar.js';

const router = express.Router();

const verifyJWT = verifyToken;

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use(express.static(path.join(__dirname, 'public')));

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../../public/html', 'index.html'));
});

router.get('/main', verifyJWT, (req, res) => {
	res.sendFile(path.join(__dirname, '../../../public/html', 'main_page.html'));
});

router.post('/upload', verifyJWT, uploadFile);
router.get('/avatar', verifyJWT, sendAvatar);

export default router;
