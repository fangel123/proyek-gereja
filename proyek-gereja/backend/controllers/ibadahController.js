const pool = require("../db");
const { z } = require("zod");

const ibadahSchema = {
  create: z.object({
    nama: z
      .string()
      .min(1, { message: "Nama ibadah tidak boleh kosong" })
      .max(150, { message: "Nama ibadah maksimal 150 karakter" })
      .transform((nama) => nama.trim()),
    tanggal: z
      .string()
      .min(1, { message: "Tanggal tidak boleh kosong" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Format tanggal harus YYYY-MM-DD",
      }),
    waktu: z
      .string()
      .max(50, { message: "Waktu maksimal 50 karakter" })
      .optional(),
    deskripsi: z.string().optional(),
  }),

  updateKehadiran: z.array(
    z.object({
      klasifikasi_id: z
        .number()
        .int()
        .positive({ message: "ID klasifikasi harus bilangan bulat positif" }),
      jumlah_hadir: z
        .number()
        .int()
        .nonnegative({ message: "Jumlah hadir harus angka positif" }),
    })
  ),

  agenda: z.object({
    urutan: z
      .number()
      .int()
      .positive({ message: "Urutan harus bilangan bulat positif" }),
    nama_agenda: z
      .string()
      .min(1, { message: "Nama agenda tidak boleh kosong" })
      .max(255, { message: "Nama agenda maksimal 255 karakter" }),
    penanggung_jawab: z
      .string()
      .max(150, { message: "Nama penanggung jawab maksimal 150 karakter" })
      .optional(),
  }),
};

exports.getAllIbadah = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nama, tanggal, waktu, deskripsi, created_at FROM ibadah ORDER BY tanggal DESC, created_at DESC"
    );

    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount,
    });
  } catch (err) {
    console.error("Error getAllIbadah:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal mengambil data ibadah",
      },
    });
  }
};

exports.createIbadah = async (req, res) => {
  const validation = ibadahSchema.create.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: validation.error.flatten(),
      },
    });
  }

  const { nama, tanggal, waktu, deskripsi } = validation.data;

  try {
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM ibadah WHERE tanggal = $1",
      [tanggal]
    );
    const count = parseInt(countResult.rows[0].count);

    if (count >= 3) {
      return res.status(400).json({
        success: false,
        error: {
          code: "DAILY_LIMIT_REACHED",
          message: "Batas maksimal ibadah per hari (3) telah tercapai",
        },
      });
    }

    const newIbadah = await pool.query(
      `INSERT INTO ibadah (nama, tanggal, waktu, deskripsi)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nama, tanggal, waktu, deskripsi, created_at`,
      [nama, tanggal, waktu, deskripsi]
    );

    res.status(201).json({
      success: true,
      data: newIbadah.rows[0],
      message: "Ibadah berhasil dibuat",
    });
  } catch (err) {
    console.error("Error createIbadah:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal membuat ibadah baru",
      },
    });
  }
};

exports.getIbadahById = async (req, res) => {
  const idValidation = z
    .number()
    .int()
    .positive()
    .safeParse(Number(req.params.id));

  if (!idValidation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "ID ibadah harus berupa angka positif",
        details: idValidation.error.flatten(),
      },
    });
  }

  const id = idValidation.data;

  try {
    const ibadahResult = await pool.query(
      "SELECT id, nama, tanggal, waktu, deskripsi, created_at FROM ibadah WHERE id = $1",
      [id]
    );

    if (ibadahResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Ibadah tidak ditemukan",
        },
      });
    }

    const agendaResult = await pool.query(
      "SELECT id, urutan, nama_agenda, penanggung_jawab FROM agenda WHERE ibadah_id = $1 ORDER BY urutan ASC",
      [id]
    );

    const kehadiranResult = await pool.query(
      `SELECT k.id as klasifikasi_id, k.nama, COALESCE(h.jumlah_hadir, 0) as jumlah_hadir
       FROM klasifikasi k
       LEFT JOIN kehadiran h ON k.id = h.klasifikasi_id AND h.ibadah_id = $1
       ORDER BY k.id`,
      [id]
    );

    const response = {
      success: true,
      data: {
        ...ibadahResult.rows[0],
        agenda: agendaResult.rows,
        kehadiran: kehadiranResult.rows,
      },
    };

    res.json(response);
  } catch (err) {
    console.error("Error getIbadahById:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal mengambil detail ibadah",
      },
    });
  }
};

exports.updateKehadiran = async (req, res) => {
  const idValidation = z
    .number()
    .int()
    .positive()
    .safeParse(Number(req.params.id));
  const dataValidation = ibadahSchema.updateKehadiran.safeParse(
    req.body.kehadiran
  );

  if (!idValidation.success || !dataValidation.success) {
    const errors = {
      ...(idValidation.error ? { id: idValidation.error.flatten() } : {}),
      ...(dataValidation.error
        ? { kehadiran: dataValidation.error.flatten() }
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

  const id = idValidation.data;
  const kehadiran = dataValidation.data;

  try {
    const ibadahExists = await pool.query(
      "SELECT id FROM ibadah WHERE id = $1",
      [id]
    );

    if (ibadahExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Ibadah tidak ditemukan",
        },
      });
    }

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

    res.json({
      success: true,
      message: "Data kehadiran berhasil diperbarui",
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error updateKehadiran:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal memperbarui data kehadiran",
      },
    });
  }
};

exports.addAgenda = async (req, res) => {
  const idValidation = z
    .number()
    .int()
    .positive()
    .safeParse(Number(req.params.id));
  const dataValidation = ibadahSchema.agenda.safeParse(req.body);

  if (!idValidation.success || !dataValidation.success) {
    const errors = {
      ...(idValidation.error ? { id: idValidation.error.flatten() } : {}),
      ...(dataValidation.error
        ? { agenda: dataValidation.error.flatten() }
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

  const ibadahId = idValidation.data;
  const { urutan, nama_agenda, penanggung_jawab } = dataValidation.data;

  try {
    const ibadahExists = await pool.query(
      "SELECT id FROM ibadah WHERE id = $1",
      [ibadahId]
    );

    if (ibadahExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Ibadah tidak ditemukan",
        },
      });
    }

    const newAgenda = await pool.query(
      `INSERT INTO agenda (ibadah_id, urutan, nama_agenda, penanggung_jawab)
       VALUES ($1, $2, $3, $4)
       RETURNING id, urutan, nama_agenda, penanggung_jawab`,
      [ibadahId, urutan, nama_agenda, penanggung_jawab]
    );

    res.status(201).json({
      success: true,
      data: newAgenda.rows[0],
      message: "Agenda berhasil ditambahkan",
    });
  } catch (err) {
    console.error("Error addAgenda:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal menambahkan agenda",
      },
    });
  }
};

exports.deleteAgenda = async (req, res) => {
  const validation = z
    .number()
    .int()
    .positive()
    .safeParse(Number(req.params.agenda_id));

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: "ID agenda harus berupa angka positif",
        details: validation.error.flatten(),
      },
    });
  }

  const agendaId = validation.data;

  try {
    const agendaExists = await pool.query(
      "SELECT id FROM agenda WHERE id = $1",
      [agendaId]
    );

    if (agendaExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Agenda tidak ditemukan",
        },
      });
    }

    await pool.query("DELETE FROM agenda WHERE id = $1", [agendaId]);

    res.json({
      success: true,
      message: "Agenda berhasil dihapus",
      deletedId: agendaId,
    });
  } catch (err) {
    console.error("Error deleteAgenda:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal menghapus agenda",
      },
    });
  }
};

exports.updateAgenda = async (req, res) => {
  const idValidation = z
    .number()
    .int()
    .positive()
    .safeParse(Number(req.params.agenda_id));
  const dataValidation = ibadahSchema.agenda.safeParse(req.body);

  if (!idValidation.success || !dataValidation.success) {
    const errors = {
      ...(idValidation.error ? { id: idValidation.error.flatten() } : {}),
      ...(dataValidation.error
        ? { agenda: dataValidation.error.flatten() }
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

  const agendaId = idValidation.data;
  const { urutan, nama_agenda, penanggung_jawab } = dataValidation.data;

  try {
    const agendaExists = await pool.query(
      "SELECT id FROM agenda WHERE id = $1",
      [agendaId]
    );

    if (agendaExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Agenda tidak ditemukan",
        },
      });
    }

    await pool.query(
      `UPDATE agenda 
       SET urutan = $1, nama_agenda = $2, penanggung_jawab = $3
       WHERE id = $4`,
      [urutan, nama_agenda, penanggung_jawab, agendaId]
    );

    const updatedAgenda = await pool.query(
      "SELECT id, urutan, nama_agenda, penanggung_jawab FROM agenda WHERE id = $1",
      [agendaId]
    );

    res.json({
      success: true,
      data: updatedAgenda.rows[0],
      message: "Agenda berhasil diperbarui",
    });
  } catch (err) {
    console.error("Error updateAgenda:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal memperbarui agenda",
      },
    });
  }
};
