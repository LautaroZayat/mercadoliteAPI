// // db.js
// import 'dotenv/config';
// import { neon } from '@neondatabase/serverless';

// // Crea la conexión con Neon
// const sql = neon(process.env.DATABASE_URL);

// // Helper para hacer queries con o sin parámetros
// export async function query(text, params = []) {
//   try {
//     let rows;

//     if (!params || params.length === 0) {
//       // Sin parámetros → solo el string
//       rows = await sql(text);
//     } else {
//       // Con parámetros → string + array de valores
//       rows = await sql(text, params);
//     }

//     // sql(...) devuelve directamente un array de filas
//     return rows;
//   } catch (err) {
//     console.error('❌ Error en la query:', err);
//     throw err;
//   }
// }

// export default sql;

import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Client } = pkg;

export const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    ssl:{
        rejectUnauthorized: false
        }
});

client.connect()
    .then(() => console.log('Se conectó correctamente a la Base de Datos.'))
    .catch(err => console.error('Error al conectar con la Base de Datos.', err));