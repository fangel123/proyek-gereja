const pool = require("../db");
const { z } = require("zod");

const klasifikasiSchema = {
  create: z.object({
    nama: z
      .string()
      .min(1, { message: "Nama klasifikasi tidak boleh kosong" })
      .max(100, { message: "Nama klasifikasi maksimal 100 karakter" })
      .transform((nama) => nama.trim())
      .refine((nama) => !/[<>]/.test(nama), {
        message: "Nama mengandung karakter tidak aman",
      }),
  }),

  update: z.object({
    id: z
      .number()
      .int()
      .positive({ message: "ID harus bilangan bulat positif" }),
    nama: z
      .string()
      .min(1, { message: "Nama klasifikasi tidak boleh kosong" })
      .max(100, { message: "Nama klasifikasi maksimal 100 karakter" })
      .transform((nama) => nama.trim()),
  }),
};

exports.getAllKlasifikasi = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nama FROM klasifikasi ORDER BY id ASC"
    );

    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
    });
  } catch (err) {
    console.error("Error getAllKlasifikasi:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal mengambil data klasifikasi",
      },
    });
  }
};

exports.createKlasifikasi = async (req, res) => {
  const validation = klasifikasiSchema.create.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: validation.error.flatten(),
      },
    });
  }

  const { nama } = validation.data;

  try {
    const exists = await pool.query(
      "SELECT id FROM klasifikasi WHERE nama = $1",
      [nama]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_NAME",
          message: "Nama klasifikasi sudah ada",
        },
      });
    }

    const result = await pool.query(
      "INSERT INTO klasifikasi (nama) VALUES ($1) RETURNING id, nama",
      [nama]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Klasifikasi berhasil dibuat",
    });
  } catch (err) {
    console.error("Error createKlasifikasi:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal membuat klasifikasi baru",
      },
    });
  }
};

exports.updateKlasifikasi = async (req, res) => {
  const idValidation = z
    .number()
    .int()
    .positive()
    .safeParse(Number(req.params.id));

  const inputValidation = klasifikasiSchema.update.safeParse({
    ...req.body,
    id: Number(req.params.id),
  });

  if (!idValidation.success || !inputValidation.success) {
    const errors = {
      ...(idValidation.error ? { id: idValidation.error.flatten() } : {}),
      ...(inputValidation.error
        ? { input: inputValidation.error.flatten() }
        : {}),
    };

    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: errors,
      },
    });
  }

  const { id, nama } = inputValidation.data;

  try {
    const exists = await pool.query(
      "SELECT id FROM klasifikasi WHERE id = $1",
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Klasifikasi tidak ditemukan",
        },
      });
    }

    const nameExists = await pool.query(
      "SELECT id FROM klasifikasi WHERE nama = $1 AND id != $2",
      [nama, id]
    );

    if (nameExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_NAME",
          message: "Nama klasifikasi sudah digunakan oleh klasifikasi lain",
        },
      });
    }

    await pool.query("UPDATE klasifikasi SET nama = $1 WHERE id = $2", [
      nama,
      id,
    ]);

    res.json({
      success: true,
      message: "Klasifikasi berhasil diperbarui",
      data: { id, nama },
    });
  } catch (err) {
    console.error("Error updateKlasifikasi:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal memperbarui klasifikasi",
      },
    });
  }
};

exports.deleteKlasifikasi = async (req, res) => {
  const validation = z
    .number()
    .int()
    .positive()
    .safeParse(Number(req.params.id));

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "ID harus berupa angka positif",
        details: validation.error.flatten(),
      },
    });
  }

  const id = validation.data;

  try {
    const exists = await pool.query(
      "SELECT id FROM klasifikasi WHERE id = $1",
      [id]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Klasifikasi tidak ditemukan",
        },
      });
    }

    const hasReferences = await pool.query(
      "SELECT id FROM kehadiran WHERE klasifikasi_id = $1 LIMIT 1",
      [id]
    );

    if (hasReferences.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "REFERENCE_EXISTS",
          message:
            "Klasifikasi tidak dapat dihapus karena sudah digunakan di data kehadiran",
        },
      });
    }

    await pool.query("DELETE FROM klasifikasi WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Klasifikasi berhasil dihapus",
      deletedId: id,
    });
  } catch (err) {
    console.error("Error deleteKlasifikasi:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal menghapus klasifikasi",
      },
    });
  }
};
