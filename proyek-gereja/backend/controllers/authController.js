const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password harus diisi." });
  }

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );

    res.status(201).json({
      message: "Registrasi berhasil!",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password harus diisi." });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    // Cek jika user tidak ditemukan
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Kredensial tidak valid" }); // Pesan umum agar aman
    }

    const user = userResult.rows[0];

    // 2. Bandingkan password yang dikirim dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Kredensial tidak valid" }); // Pesan yang sama
    }

    // 3. Jika cocok, buat JWT Token
    const payload = {
      user: {
        id: user.id,
        email: user.email, // Kamu bisa tambahkan info lain jika perlu
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Ambil kunci rahasia dari .env
      { expiresIn: "1h" }, // Token akan kadaluarsa dalam 1 jam
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Kirim token ke client
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
