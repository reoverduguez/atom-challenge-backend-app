import express from 'express';

import { authenticate, registerAndAuthenticate } from '../controllers/auth.controller';

const router = express.Router();

router.post('/', authenticate);
router.post('/register', registerAndAuthenticate);

export default router;
