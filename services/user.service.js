// services/user.service.js
import { query } from '../db.js';

// 🟢 Registro con "contraseña"
export async function registrarUsuario({ nombre, email, alias, contraseña }) {
  // Verificar email existente
  const existeEmail = await query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );
  if (existeEmail.length > 0) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  // Verificar alias existente
  const existeAlias = await query(
    'SELECT id FROM usuarios WHERE alias = $1',
    [alias]
  );
  if (existeAlias.length > 0) {
    const err = new Error('El alias ya está en uso');
    err.status = 409;
    throw err;
  }

  // Insertar usuario → columna: "contraseña"
  const rows = await query(
    `INSERT INTO usuarios (nombre, email, alias, "contraseña", saldo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, email, alias, cbu, saldo`,
    [nombre, email, alias, contraseña, 10000]
  );

  return rows[0];
}

// 🟢 Login con "contraseña"
export async function verificarLogin(email, contraseña) {
  const rows = await query(
    `SELECT id, nombre, email, alias, cbu, saldo, "contraseña"
     FROM usuarios
     WHERE email = $1`,
    [email]
  );

  if (rows.length === 0) {
    const err = new Error('Email o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  const usuario = rows[0];

  if (usuario['contraseña'] !== contraseña) {
    const err = new Error('Email o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  delete usuario['contraseña'];

  return usuario;
}

// 🟢 Transferencias (función completa usando "contraseña")
export async function transferirSaldo({ origenId, destinoAlias, monto }) {
  const montoNum = Number(monto);

  if (isNaN(montoNum) || montoNum <= 0) {
    const err = new Error('El monto debe ser mayor a 0');
    err.status = 400;
    throw err;
  }

  // Encontrar destino
  const destinoRows = await query(
    'SELECT id, saldo FROM usuarios WHERE alias = $1',
    [destinoAlias]
  );

  if (destinoRows.length === 0) {
    const err = new Error('El usuario destino no existe');
    err.status = 404;
    throw err;
  }

  const destinoId = destinoRows[0].id;

  if (destinoId === origenId) {
    const err = new Error('No podés transferirte a vos mismo');
    err.status = 400;
    throw err;
  }

  // Debitar del origen solo si alcanza el saldo
  const debitoRows = await query(
    `UPDATE usuarios
     SET saldo = saldo - $2
     WHERE id = $1 AND saldo >= $2
     RETURNING id, saldo`,
    [origenId, montoNum]
  );

  if (debitoRows.length === 0) {
    const err = new Error('Saldo insuficiente');
    err.status = 400;
    throw err;
  }

  const origenActualizado = debitoRows[0];

  // Acreditar en destino
  const creditoRows = await query(
    `UPDATE usuarios
     SET saldo = saldo + $2
     WHERE id = $1
     RETURNING id, saldo`,
    [destinoId, montoNum]
  );

  const destinoActualizado = creditoRows[0];

  // Registrar transferencia (si tenés la tabla)
  let transferencia = null;
  try {
    const rows = await query(
      `INSERT INTO transferencias (emisor_id, receptor_id, monto, fecha)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, emisor_id, receptor_id, monto, fecha`,
      [origenId, destinoId, montoNum]
    );
    transferencia = rows[0];
  } catch (e) {
    console.log('⚠ No se registró en transferencias (schema distinto)');
  }

  return {
    origen: origenActualizado,
    destino: destinoActualizado,
    transferencia,
  };
}
// services/user.service.js
// ...

export async function obtenerSaldo(idUsuario) {
  const rows = await query(
    'SELECT saldo FROM usuarios WHERE id = $1',
    [idUsuario]
  );

  if (rows.length === 0) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  return rows[0].saldo;
}

