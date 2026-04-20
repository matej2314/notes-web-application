import express from 'express';
const router = express.Router();
import authController from '../controllers/auth.js';
import { verifyToken } from '../controllers/verifyJWT.js';

const verifyJWT = verifyToken;

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/usermail', verifyJWT, authController.changeEmail);
router.post('/userpass', verifyJWT, authController.changePass);
router.post('/logout', authController.logoutUser);

export default router;
