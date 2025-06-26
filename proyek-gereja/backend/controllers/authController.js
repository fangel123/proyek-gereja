const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const authSchema = {
  register: z.object({
    email: z
      .string()
      .min(1, { message: "Email tidak boleh kosong" })
      .email({ message: "Format email tidak valid" })
      .max(255, { message: "Email maksimal 255 karakter" })
      .transform((email) => email.trim().toLowerCase())
      .refine((email) => !/[<>]/.test(email), {
        message: "Email mengandung karakter tidak aman",
      }),
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter" })
      .max(255, { message: "Password maksimal 255 karakter" })
      .regex(/[A-Z]/, { message: "Harus mengandung minimal 1 huruf kapital" })
      .regex(/[0-9]/, { message: "Harus mengandung minimal 1 angka" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Harus mengandung minimal 1 simbol",
      }),
  }),

  login: z.object({
    email: z
      .string()
      .min(1, { message: "Email tidak boleh kosong" })
      .email({ message: "Format email tidak valid" }),
    password: z.string().min(1, { message: "Password tidak boleh kosong" }),
  }),
};

exports.register = async (req, res) => {
  const result = authSchema.register.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      },
    });
  }

  const { email, password } = result.data;

  try {
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "EMAIL_EXISTS",
          message: "Email sudah terdaftar",
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, created_at) 
       VALUES ($1, $2, NOW()) 
       RETURNING id, email, created_at`,
      [email, passwordHash]
    );

    res.status(201).json({
      success: true,
      data: {
        user: newUser.rows[0],
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Terjadi kesalahan pada server saat pendaftaran",
      },
    });
  }
};

exports.login = async (req, res) => {
  const result = authSchema.login.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      },
    });
  }

  const { email, password } = result.data;

  try {
    const userResult = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email atau password salah",
        },
      });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Email atau password salah",
        },
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Terjadi kesalahan pada server saat login",
      },
    });
  }
};
