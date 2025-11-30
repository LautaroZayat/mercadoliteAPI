// db.js
import 'dotenv/config';
import pkg from 'pg';

const { Client } = pkg;

// Usa primero las POSTGRES_ (tu .env local) y si no existen,
// usa las STORAGE_* que crea Vercel cuando conectás Neon.
const client = new Client({
  user:     process.env.POSTGRES_USER     || process.env.STORAGE_POSTGRES_USER,
  host:     process.env.POSTGRES_HOST     || process.env.STORAGE_POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE || process.env.STORAGE_POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD || process.env.STORAGE_POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT) || 5432,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => console.log('✅ Se conectó correctamente a la Base de Datos.'))
  .catch(err => console.error('❌ Error al conectar con la Base de Datos.', err));

export { client };
