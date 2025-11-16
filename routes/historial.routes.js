// routes/historial.routes.js
import { Router } from 'express';
import { historial } from '../controllers/historial.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /historial (protegida)
router.get('/historial', verifyToken, historial);

export default router;
