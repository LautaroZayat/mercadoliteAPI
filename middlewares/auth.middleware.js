// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    // Guardamos el id del usuario en el request
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('❌ Error verificando token:', err);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
