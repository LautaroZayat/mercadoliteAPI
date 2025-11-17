// services/historial.service.js
import { client } from '../db.js';

export async function obtenerHistorial(idUsuario) {
  const rows = await client(
    `SELECT 
        h.id,
        h.transferencia_id,
        h.emisor_id,
        ue.alias AS alias_emisor,
        h.receptor_id,
        ur.alias AS alias_receptor,
        h.monto,
        h.fecha
     FROM historial h
     JOIN usuarios ue ON h.emisor_id = ue.id
     JOIN usuarios ur ON h.receptor_id = ur.id
     WHERE h.emisor_id = $1 OR h.receptor_id = $1
     ORDER BY h.fecha DESC`,
    [idUsuario]
  );

  const idNum = Number(idUsuario);

  return rows.map((h) => {
    const esSalida = Number(h.emisor_id) === idNum;

    return {
      id: h.id,
      transferencia_id: h.transferencia_id,
      monto: h.monto,
      fecha: h.fecha,
      emisor: {
        id: h.emisor_id,
        alias: h.alias_emisor,
      },
      receptor: {
        id: h.receptor_id,
        alias: h.alias_receptor,
      },
      tipo: esSalida ? 'enviada' : 'recibida',
      signo: esSalida ? '-' : '+',
    };
  });
}
