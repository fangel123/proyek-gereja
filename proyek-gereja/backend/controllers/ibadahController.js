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

exports.addAgenda = async (req, res) => {
  const { id } = req.params; // id ibadah
  const { urutan, nama_agenda, penanggung_jawab } = req.body;

  try {
    const newAgenda = await pool.query(
      `INSERT INTO agenda (ibadah_id, urutan, nama_agenda, penanggung_jawab)
             VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, urutan, nama_agenda, penanggung_jawab]
    );
    res.status(201).json(newAgenda.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deleteAgenda = async (req, res) => {
  try {
    const { agenda_id } = req.params;
    await pool.query("DELETE FROM agenda WHERE id = $1", [agenda_id]);
    res.json({ message: "Agenda berhasil dihapus." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.updateAgenda = async (req, res) => {
  const { agenda_id } = req.params;
  const { urutan, nama_agenda, penanggung_jawab } = req.body;
  try {
    await pool.query(
      `UPDATE agenda SET urutan = $1, nama_agenda = $2, penanggung_jawab = $3
             WHERE id = $4`,
      [urutan, nama_agenda, penanggung_jawab, agenda_id]
    );
    res.json({ message: "Agenda berhasil diperbarui." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
