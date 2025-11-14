// services/user.service.js
import { query } from '../db.js';

// 🟢 Lógica de registro (solo DB y reglas de negocio)
export async function registrarUsuario({ nombre, email, alias, contrasena }) {
  // 1) ¿Email existente?
  const existeEmail = await query(
    'SELECT id FROM usuarios WHERE email = $1',
    [email]
  );
  if (existeEmail.length > 0) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  // 2) ¿Alias existente?
  const existeAlias = await query(
    'SELECT id FROM usuarios WHERE alias = $1',
    [alias]
  );
  if (existeAlias.length > 0) {
    const err = new Error('El alias ya está en uso');
    err.status = 409;
    throw err;
  }

  // 3) Insertar usuario
  //  - NO mandamos CBU → lo genera la DB
  //  - Sí mandamos saldo = 0 (por las dudas no tenga DEFAULT)
  //
  // ⚠️ IMPORTANTE:
  // Si tu columna se llama "contraseña" con ñ, cambiá contrasena por "contraseña":
  // INSERT INTO usuarios (nombre, email, alias, "contraseña", saldo)
  const rows = await query(
    `INSERT INTO usuarios (nombre, email, alias, "contraseña", saldo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, email, alias, cbu, saldo`,
    [nombre, email, alias, contrasena, 0]
  );

  return rows[0]; // usuario nuevo
}
