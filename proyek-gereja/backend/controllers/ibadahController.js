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
