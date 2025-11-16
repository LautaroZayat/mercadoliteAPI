// controllers/historial.controller.js
import { obtenerHistorial } from '../services/historial.service.js';

export const historial = async (req, res) => {
  try {
    const idUsuario = req.userId; // viene del token (verifyToken)

    const movimientos = await obtenerHistorial(idUsuario);

    return res.json({
      historial: movimientos,
    });
  } catch (err) {
    console.error('❌ Error en /historial:', err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};
