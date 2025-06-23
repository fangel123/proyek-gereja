const pool = require("../db");
const ExcelJS = require("exceljs");

exports.getKehadiranAnalytics = async (req, res) => {
  try {
    const query = `
            SELECT 
                i.tanggal, 
                SUM(h.jumlah_hadir) AS total_kehadiran
            FROM kehadiran h
            JOIN ibadah i ON h.ibadah_id = i.id
            GROUP BY i.tanggal
            ORDER BY i.tanggal ASC;
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const totalMingguIniRes = await pool.query(`
            SELECT COALESCE(SUM(jumlah_hadir), 0) as total
            FROM kehadiran
            WHERE ibadah_id IN (
                SELECT id FROM ibadah WHERE tanggal BETWEEN date_trunc('week', NOW()) AND date_trunc('week', NOW()) + interval '6 days'
            )
        `);

    const ibadahTeramaiRes = await pool.query(`
            SELECT i.nama, SUM(h.jumlah_hadir) as total
            FROM kehadiran h
            JOIN ibadah i ON h.ibadah_id = i.id
            GROUP BY i.id, i.nama
            ORDER BY total DESC
            LIMIT 1;
        `);

    const klasifikasiTeramaiRes = await pool.query(`
            SELECT k.nama, SUM(h.jumlah_hadir) as total
            FROM kehadiran h
            JOIN klasifikasi k ON h.klasifikasi_id = k.id
            GROUP BY k.id, k.nama
            ORDER BY total DESC
            LIMIT 1;
        `);

    res.json({
      totalJemaatMingguIni: totalMingguIniRes.rows[0].total,
      ibadahTeramai: ibadahTeramaiRes.rows[0] || { nama: "-", total: 0 },
      klasifikasiTeramai: klasifikasiTeramaiRes.rows[0] || {
        nama: "-",
        total: 0,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
