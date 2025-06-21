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

// ... (Nanti kita tambahkan Update dan Delete)
