// db.js
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Creamos la conexión usando la variable del .env
const sql = neon(process.env.DATABASE_URL);

// Función para ejecutar queries fácilmente
export async function query(text, params = []) {
  try {
    // Si no hay parámetros, ejecuta directo
    if (params.length === 0) {
      return await sql`${text}`;
    } else {
      // Si hay parámetros, usa modo unsafe (seguro igual)
      const result = await sql.unsafe(text, params);
      return result;
    }
  } catch (err) {
    console.error('❌ Error en la query:', err);
    throw err;
  }
}

export default sql;

