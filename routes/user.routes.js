// routes/user.routes.js
import { Router } from 'express';
import {
  ping,
  registro,
  login,
  transferir,
  saldo,
  cambiarPassword,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/ping', ping);
router.post('/registro', registro);
router.post('/login', login);
router.post('/transferir', verifyToken, transferir);

// 🟢 ruta protegida: ver saldo
router.get('/saldo', verifyToken, saldo);

// 🟢 ruta protegida: cambiar contraseña
router.put('/cambiar-contrasena', verifyToken, cambiarPassword);

export default router;
