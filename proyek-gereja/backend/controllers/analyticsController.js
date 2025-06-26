const pool = require("../db");
const { z } = require("zod");

const analyticsSchema = {
  getKehadiranAnalytics: z
    .object({
      startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Format tanggal harus YYYY-MM-DD",
        })
        .optional(),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Format tanggal harus YYYY-MM-DD",
        })
        .optional(),
      klasifikasiId: z
        .string()
        .regex(/^\d+$/, { message: "ID klasifikasi harus angka" })
        .transform(Number)
        .optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && !data.endDate) return false;
        if (!data.startDate && data.endDate) return false;
        if (data.startDate && data.endDate && data.startDate > data.endDate)
          return false;
        return true;
      },
      {
        message: "Tanggal mulai harus sebelum tanggal akhir",
        path: ["dateRange"],
      }
    ),
};

exports.getKehadiranAnalytics = async (req, res) => {
  const validation = analyticsSchema.getKehadiranAnalytics.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: validation.error.flatten(),
      },
    });
  }

  const { startDate, endDate, klasifikasiId } = validation.data;

  try {
    let query = `
      SELECT 
        i.tanggal, 
        k.nama as klasifikasi,
        SUM(h.jumlah_hadir) AS total_kehadiran
      FROM kehadiran h
      JOIN ibadah i ON h.ibadah_id = i.id
      JOIN klasifikasi k ON h.klasifikasi_id = k.id
    `;

    const params = [];
    const whereClauses = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      whereClauses.push(
        `i.tanggal BETWEEN $${paramIndex++} AND $${paramIndex++}`
      );
      params.push(startDate, endDate);
    }

    if (klasifikasiId) {
      whereClauses.push(`h.klasifikasi_id = $${paramIndex++}`);
      params.push(klasifikasiId);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    query += `
      GROUP BY i.tanggal, k.nama
      ORDER BY i.tanggal ASC;
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        startDate,
        endDate,
        klasifikasiId,
        totalRecords: result.rowCount,
      },
    });
  } catch (err) {
    console.error("Error getKehadiranAnalytics:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal mengambil data analitik kehadiran",
      },
    });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const [totalMingguIniRes, ibadahTeramaiRes, klasifikasiTeramaiRes] =
      await Promise.all([
        pool.query(
          `SELECT COALESCE(SUM(jumlah_hadir), 0) as total 
           FROM kehadiran 
           WHERE ibadah_id IN (
             SELECT id FROM ibadah 
             WHERE tanggal BETWEEN date_trunc('week', NOW()) AND date_trunc('week', NOW()) + interval '6 days'
           )`
        ),
        pool.query(
          `SELECT i.id, i.nama, i.tanggal, SUM(h.jumlah_hadir) as total 
           FROM kehadiran h 
           JOIN ibadah i ON h.ibadah_id = i.id 
           GROUP BY i.id, i.nama, i.tanggal 
           ORDER BY total DESC 
           LIMIT 1`
        ),
        pool.query(
          `SELECT k.id, k.nama, SUM(h.jumlah_hadir) as total 
           FROM kehadiran h 
           JOIN klasifikasi k ON h.klasifikasi_id = k.id 
           GROUP BY k.id, k.nama 
           ORDER BY total DESC 
           LIMIT 1`
        ),
      ]);

    res.json({
      success: true,
      data: {
        total_jemaat_minggu_ini: totalMingguIniRes.rows[0]?.total || 0,
        ibadah_teramai: ibadahTeramaiRes.rows[0] || null,
        klasifikasi_teramai: klasifikasiTeramaiRes.rows[0] || null,
      },
    });
  } catch (err) {
    console.error("Error getDashboardSummary:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal mengambil ringkasan dashboard",
      },
    });
  }
};

exports.getAllKlasifikasi = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nama FROM klasifikasi ORDER BY nama ASC"
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
