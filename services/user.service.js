// services/user.service.js
import { client } from '../db.js';

// 🟢 Registro con "contraseña"
export async function registrarUsuario({ nombre, email, alias, contraseña }) {
  // Verificar email existente
  const existeEmail = await client.query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );
  if (existeEmail.rows.length > 0) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  // Verificar alias existente
  const existeAlias = await client.query(
    'SELECT id FROM usuarios WHERE alias = $1',
    [alias]
  );
  if (existeAlias.rows.length > 0) {
    const err = new Error('El alias ya está en uso');
    err.status = 409;
    throw err;
  }

  // Insertar usuario → columna: "contraseña"
  const rows = await client.query(
    `INSERT INTO usuarios (nombre, email, alias, "contraseña", saldo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, email, alias, cbu, saldo`,
    [nombre, email, alias, contraseña, 10000]
  );

  return rows.rows[0];
}

// 🟢 Login con "contraseña"
export async function verificarLogin(email, contraseña) {
  const result = await client.query(
    `SELECT id, nombre, email, alias, cbu, saldo, "contraseña"
     FROM usuarios
     WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    const err = new Error('Email o contraseña incorrectos');
    err.status = 401;
    throw err;
  }

  const usuario = result.rows[0];

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
  const destinoResult = await client.query(
    'SELECT id, saldo FROM usuarios WHERE alias = $1',
    [destinoAlias]
  );

  if (destinoResult.rows.length === 0) {
    const err = new Error('El usuario destino no existe');
    err.status = 404;
    throw err;
  }

  const destinoId = destinoResult.rows[0].id;

  if (destinoId === origenId) {
    const err = new Error('No podés transferirte a vos mismo');
    err.status = 400;
    throw err;
  }

  // Debitar del origen solo si alcanza el saldo
  const debitoResult = await client.query(
    `UPDATE usuarios
     SET saldo = saldo - $2
     WHERE id = $1 AND saldo >= $2
     RETURNING id, saldo`,
    [origenId, montoNum]
  );

  if (debitoResult.rows.length === 0) {
    const err = new Error('Saldo insuficiente');
    err.status = 400;
    throw err;
  }

  const origenActualizado = debitoResult.rows[0];

  // Acreditar en destino
  const creditoResult = await client.query(
    `UPDATE usuarios
     SET saldo = saldo + $2
     WHERE id = $1
     RETURNING id, saldo`,
    [destinoId, montoNum]
  );

  const destinoActualizado = creditoResult.rows[0];

  // Registrar transferencia (si tenés la tabla)
  let transferencia = null;
  try {
    const transferResult = await client.query(
      `INSERT INTO transferencias (emisor_id, receptor_id, monto, fecha)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, emisor_id, receptor_id, monto, fecha`,
      [origenId, destinoId, montoNum]
    );
    transferencia = transferResult.rows[0];
  } catch (e) {
    console.log('⚠ No se registró en transferencias (schema distinto)');
  }

  return {
    origen: origenActualizado,
    destino: destinoActualizado,
    transferencia,
  };
}

//INGRESAR DINERO
export async function ingresarDinero(idUsuario, monto) {
  const montoNum = Number(monto);
  if (isNaN(montoNum) || montoNum <= 0) {
    const err = new Error('El monto debe ser mayor a 0');
    err.status = 400;
    throw err;
  }

  const result = await client.query(
    'UPDATE usuarios SET saldo = saldo + $2 WHERE id = $1 RETURNING id, saldo',
    [idUsuario, montoNum]
  );

  if (result.rows.length === 0) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

// 🟢 SALDO
export async function obtenerSaldo(idUsuario) {
  const result = await client.query(
    'SELECT saldo FROM usuarios WHERE id = $1',
    [idUsuario]
  );

  if (result.rows.length === 0) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  return result.rows[0].saldo;
}

export const obtenerUsuarioPorId = async (id) => {
  const res = await client.query(
    'SELECT nombre, email, alias, cbu FROM usuarios WHERE id=$1',
    [id]
  );
  return res.rows[0];
};

// 🟢 CAMBIAR CONTRASEÑA
export async function cambiarContraseña(idUsuario, contraseñaActual, contraseñaNueva) {
  // 1) Traer contraseña actual de la DB
  const result = await client.query(
    `SELECT "contraseña" FROM usuarios WHERE id = $1`,
    [idUsuario]
  );

  if (result.rows.length === 0) {
    const err = new Error('Usuario no encontrado');
    err.status = 404;
    throw err;
  }

  const contraseñaBD = result.rows[0]['contraseña'];

  if (contraseñaBD !== contraseñaActual) {
    const err = new Error('La contraseña actual es incorrecta');
    err.status = 401;
    throw err;
  }

  // 2) Actualizar contraseña
  const updateResult = await client.query(
    `UPDATE usuarios
     SET "contraseña" = $2
     WHERE id = $1
     RETURNING id, nombre, email, alias, cbu, saldo`,
    [idUsuario, contraseñaNueva]
  );

  return updateResult.rows[0];
}
