// index.js
import express from 'express';
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import userRoutes from './routes/user.routes.js';
import historialRoutes from './routes/historial.routes.js'; // 👈 nuevo

const app = express();
app.use(express.json());

// const sql = neon(process.env.DATABASE_URL);

// app.get('/test-db', async (req, res) => {
//   try {
//     const r = await sql`SELECT NOW() as now`;
//     res.json({ conectado: true, now: r[0].now });
//   } catch (e) {
//     console.error('DB error:', e);
//     res.status(500).json({ conectado: false, error: e.message });
//   }
// }); INTENTO DE QUE FUNCIONE LA DB

import { client } from './db.js'; // o la ruta donde tengas el Client

app.get('/test-db', async (req, res) => {
  try {
    const result = await client.query("SELECT NOW() as now");
    res.json({ conectado: true, now: result.rows[0].now });
  } catch (e) {
    console.error('DB error:', e);
    res.status(500).json({ conectado: false, error: e.message });
  }
});

// Montamos ambas "familias" de rutas
app.use('/user', userRoutes);
app.use('/historial', historialRoutes); // 👈 esto agrega /historial

app.get('/', (req, res) => {
  res.send('MercadoLiteAPI funcionando correctamente!');
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () =>
//   console.log(`🚀 API escuchando en http://localhost:${PORT}`)
// );

export default app;