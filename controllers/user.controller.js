// controllers/user.controller.js
import { registrarUsuario } from '../services/user.service.js';

// Ping solo para probar
export const ping = (req, res) => {
  console.log('👉 Entró a /ping desde controller');
  res.json({ ok: true, mensaje: 'Rutas de usuario funcionando 👌' });
};

// 🟢 Controller de registro
export const registro = async (req, res) => {
  try {
    const { nombre, email, alias, contrasena } = req.body;
    // si en el front lo mandás como "contraseña", cambiá el nombre acá

    // Validación básica
    if (!nombre || !email || !alias || !contrasena) {
      return res.status(400).json({
        error: 'Faltan campos: nombre, email, alias o contrasena',
      });
    }

    const usuario = await registrarUsuario({
      nombre,
      email,
      alias,
      contrasena,
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario,
    });
  } catch (err) {
    console.error('❌ Error en controller /registro:', err);
    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || 'Error interno del servidor',
    });
  }
};
