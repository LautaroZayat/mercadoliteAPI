// db.js
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Crea la conexión con Neon
const sql = neon(process.env.DATABASE_URL);

// Helper para hacer queries con o sin parámetros
export async function query(text, params = []) {
  try {
    let rows;

    if (!params || params.length === 0) {
      // Sin parámetros → solo el string
      rows = await sql(text);
    } else {
      // Con parámetros → string + array de valores
      rows = await sql(text, params);
    }

    // sql(...) devuelve directamente un array de filas
    return rows;
  } catch (err) {
    console.error('❌ Error en la query:', err);
    throw err;
  }
}

export default sql;
