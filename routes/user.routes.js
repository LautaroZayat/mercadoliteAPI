// routes/user.routes.js
import { Router } from 'express';
import { ping, registro } from '../controllers/user.controller.js';

const router = Router();

// GET /ping
router.get('/ping', ping);

// POST /registro
router.post('/registro', registro);

export default router;
