// index.js
import express from 'express';
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const app = express();
app.use(express.json());

// Conexión Neon
const sql = neon(process.env.DATABASE_URL);

// Endpoint de prueba DB
app.get('/test-db', async (req, res) => {
  try {
    const r = await sql`SELECT NOW() as now`;
    res.json({ conectado: true, now: r[0].now });
  } catch (e) {
    console.error('DB error:', e);
    res.status(500).json({ conectado: false, error: e.message });
  }
});

// Levantar server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API escuchando en http://localhost:${PORT}`));
