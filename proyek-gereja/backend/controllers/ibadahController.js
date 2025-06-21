const pool = require("../db");

exports.getAllIbadah = async (req, res) => {
  try {
    const allIbadah = await pool.query(
      "SELECT * FROM ibadah ORDER BY tanggal DESC"
    );
    res.json(allIbadah.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.createIbadah = async (req, res) => {
  const { nama, tanggal, waktu, deskripsi } = req.body;
  try {
    const existingIbadah = await pool.query(
      "SELECT COUNT(*) FROM ibadah WHERE tanggal = $1",
      [tanggal]
    );
    if (parseInt(existingIbadah.rows[0].count) >= 3) {
      return res
        .status(400)
        .json({ message: "Batas ibadah harian (3) telah tercapai." });
    }

    const newIbadah = await pool.query(
      "INSERT INTO ibadah (nama, tanggal, waktu, deskripsi) VALUES ($1, $2, $3, $4) RETURNING *",
      [nama, tanggal, waktu, deskripsi]
    );
    res.status(201).json(newIbadah.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getIbadahById = async (req, res) => {
  try {
    const { id } = req.params;
    const ibadahRes = await pool.query("SELECT * FROM ibadah WHERE id = $1", [
      id,
    ]);
    if (ibadahRes.rows.length === 0) {
      return res.status(404).json({ message: "Ibadah tidak ditemukan." });
    }
    const agendaRes = await pool.query(
      "SELECT * FROM agenda WHERE ibadah_id = $1 ORDER BY urutan ASC",
      [id]
    );
    const kehadiranRes = await pool.query(
      `SELECT k.id as klasifikasi_id, k.nama, COALESCE(h.jumlah_hadir, 0) as jumlah_hadir
             FROM klasifikasi k
             LEFT JOIN kehadiran h ON k.id = h.klasifikasi_id AND h.ibadah_id = $1
             ORDER BY k.id`,
      [id]
    );

    const ibadahDetail = {
      ...ibadahRes.rows[0],
      agenda: agendaRes.rows,
      kehadiran: kehadiranRes.rows,
    };

    res.json(ibadahDetail);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.updateKehadiran = async (req, res) => {
  const { id } = req.params;
  const { kehadiran } = req.body;

  try {
    await pool.query("BEGIN");
    for (const item of kehadiran) {
      await pool.query(
        `INSERT INTO kehadiran (ibadah_id, klasifikasi_id, jumlah_hadir)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (ibadah_id, klasifikasi_id)
                 DO UPDATE SET jumlah_hadir = EXCLUDED.jumlah_hadir`,
        [id, item.klasifikasi_id, item.jumlah_hadir]
      );
    }
    await pool.query("COMMIT");
    res.json({ message: "Data kehadiran berhasil disimpan." });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
