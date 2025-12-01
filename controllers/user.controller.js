// controllers/user.controller.js
import jwt from 'jsonwebtoken';
import {
  registrarUsuario,
  verificarLogin,
  transferirSaldo,
  obtenerSaldo,
  obtenerUsuarioPorId,
  cambiarContraseña,
} from '../services/user.service.js';

export const ping = (req, res) => {
  res.json({ ok: true });
};

// REGISTRO
export const registro = async (req, res) => {
  try {
    const { nombre, email, alias, contraseña } = req.body;

    if (!nombre || !email || !alias || !contraseña) {
      return res.status(400).json({
        error: 'Faltan campos: nombre, email, alias, contraseña',
      });
    }

    const usuario = await registrarUsuario({
      nombre,
      email,
      alias,
      contraseña,
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado',
      usuario,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({
        error: 'Faltan campos: email, contraseña',
      });
    }

    const usuario = await verificarLogin(email, contraseña);

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET || 'dev',
      { expiresIn: '1h' }
    );

    return res.json({
      mensaje: 'Login exitoso',
      token,
      usuario,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

// TRANSFERIR
export const transferir = async (req, res) => {
  try {
    const { aliasDestino, monto } = req.body;

    if (!aliasDestino || monto === undefined) {
      return res.status(400).json({
        error: 'Faltan datos: aliasDestino o monto',
      });
    }

    const origenId = req.userId;

    const resultado = await transferirSaldo({
      origenId,
      destinoAlias: aliasDestino,
      monto,
    });

    return res.json({
      mensaje: 'Transferencia realizada',
      ...resultado,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

// SALDO
export const saldo = async (req, res) => {
  try {
    const idUsuario = req.userId; // viene del token (verifyToken)

    const saldoActual = await obtenerSaldo(idUsuario);
    const usuario = await obtenerUsuarioPorId(idUsuario);
    
    return res.json({
      saldo: saldoActual,
      nombre: usuario.nombre,
      email: usuario.email,
      cbu: usuario.cbu,
      alias: usuario.alias
    });
  } catch (err) {
    console.error('❌ Error en /saldo:', err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};

// CAMBIAR CONTRASEÑA
export const cambiarPassword = async (req, res) => {
  try {
    const idUsuario = req.userId; // viene del token
    const { contraseñaActual, contraseñaNueva } = req.body;

    if (!contraseñaActual || !contraseñaNueva) {
      return res.status(400).json({
        error: 'Faltan campos: contraseñaActual y contraseñaNueva',
      });
    }

    const usuarioActualizado = await cambiarContraseña(
      idUsuario,
      contraseñaActual,
      contraseñaNueva
    );

    return res.json({
      mensaje: 'Contraseña actualizada correctamente',
      usuario: usuarioActualizado,
    });
  } catch (err) {
    console.error('❌ Error en /cambiar-contraseña:', err);
    return res.status(err.status || 500).json({ error: err.message });
  }
};
