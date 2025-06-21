const pool = require("../db");

exports.getAllKlasifikasi = async (req, res) => {
  try {
    const allKlasifikasi = await pool.query(
      "SELECT * FROM klasifikasi ORDER BY id ASC"
    );
    res.json(allKlasifikasi.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.createKlasifikasi = async (req, res) => {
  const { nama } = req.body;
  if (!nama) {
    return res.status(400).json({ message: "Nama klasifikasi harus diisi." });
  }
  try {
    const newKlasifikasi = await pool.query(
      "INSERT INTO klasifikasi (nama) VALUES ($1) RETURNING *",
      [nama]
    );
    res.status(201).json(newKlasifikasi.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === "23505") {
      return res.status(400).json({ message: "Nama klasifikasi sudah ada." });
    }
    res.status(500).send("Server Error");
  }
};

exports.updateKlasifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    await pool.query("UPDATE klasifikasi SET nama = $1 WHERE id = $2", [
      nama,
      id,
    ]);
    res.json({ message: "Klasifikasi berhasil diperbarui" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deleteKlasifikasi = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM klasifikasi WHERE id = $1", [id]);
    res.json({ message: "Klasifikasi berhasil dihapus" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
