const PdfPrinter = require("pdfmake");
const path = require("path");
const pool = require("../db");
const ExcelJS = require("exceljs");
const { z } = require("zod");

const exportSchema = {
  exportAgendaToPdf: z.object({
    id: z
      .number()
      .int()
      .positive({ message: "ID ibadah harus bilangan bulat positif" }),
  }),
};

exports.exportAgendaToPdf = async (req, res) => {
  const validation = exportSchema.exportAgendaToPdf.safeParse({
    id: Number(req.params.id),
  });

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: validation.error.flatten(),
      },
    });
  }

  const { id } = validation.data;

  try {
    const ibadahRes = await pool.query(
      "SELECT id, nama, tanggal FROM ibadah WHERE id = $1",
      [id]
    );

    if (ibadahRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Ibadah tidak ditemukan",
        },
      });
    }

    const agendaRes = await pool.query(
      "SELECT urutan, nama_agenda, penanggung_jawab FROM agenda WHERE ibadah_id = $1 ORDER BY urutan ASC",
      [id]
    );

    const ibadah = ibadahRes.rows[0];
    const agenda = agendaRes.rows;

    const fonts = {
      Roboto: {
        normal: path.join(
          __dirname,
          "..",
          "public",
          "fonts",
          "Roboto-Regular.ttf"
        ),
        bold: path.join(__dirname, "..", "public", "fonts", "Roboto-Bold.ttf"),
        italics: path.join(
          __dirname,
          "..",
          "public",
          "fonts",
          "Roboto-Italic.ttf"
        ),
        bolditalics: path.join(
          __dirname,
          "..",
          "public",
          "fonts",
          "Roboto-BoldItalic.ttf"
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = new Date(ibadah.tanggal).toLocaleDateString(
      "id-ID",
      options
    );

    const docDefinition = {
      content: [
        { text: "GEREJA XYZ", style: "header", alignment: "center" },
        {
          text: "Susunan Acara Ibadah",
          style: "subheader",
          alignment: "center",
        },
        { text: ibadah.nama, style: "title", alignment: "center" },
        {
          text: `Tanggal: ${formattedDate}`,
          alignment: "center",
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            widths: ["auto", "*", "auto"],
            body: [
              [
                { text: "No.", style: "tableHeader" },
                { text: "Agenda", style: "tableHeader" },
                { text: "Penanggung Jawab", style: "tableHeader" },
              ],
              ...agenda.map((item) => [
                item.urutan,
                item.nama_agenda,
                item.penanggung_jawab || "-",
              ]),
            ],
          },
          layout: {
            hLineWidth: (i, node) =>
              i === 0 || i === node.table.body.length ? 1 : 0.5,
            vLineWidth: (i, node) => 0.5,
            hLineColor: (i, node) => "#aaaaaa",
            vLineColor: (i, node) => "#aaaaaa",
            paddingLeft: (i, node) => 4,
            paddingRight: (i, node) => 4,
            paddingTop: (i, node) => 2,
            paddingBottom: (i, node) => 2,
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 0, 0, 5] },
        title: { fontSize: 16, bold: true },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
          fillColor: "#f5f5f5",
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=agenda-ibadah-${id}.pdf`
    );

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.error("Error exportAgendaToPdf:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal mengekspor agenda ke PDF",
      },
    });
  }
};

exports.exportKehadiranToExcel = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        i.id AS ibadah_id,
        i.nama AS nama_ibadah,
        i.tanggal,
        k.id AS klasifikasi_id,
        k.nama AS nama_klasifikasi,
        h.jumlah_hadir
      FROM kehadiran h
      JOIN ibadah i ON h.ibadah_id = i.id
      JOIN klasifikasi k ON h.klasifikasi_id = k.id
      ORDER BY i.tanggal DESC, k.nama ASC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Kehadiran");

    worksheet.columns = [
      { header: "ID Ibadah", key: "ibadah_id", width: 10 },
      { header: "Nama Ibadah", key: "nama_ibadah", width: 30 },
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "ID Klasifikasi", key: "klasifikasi_id", width: 15 },
      { header: "Klasifikasi Jemaat", key: "nama_klasifikasi", width: 25 },
      { header: "Jumlah Hadir", key: "jumlah_hadir", width: 15 },
    ];

    worksheet.getColumn("tanggal").numFmt = "dd-mm-yyyy";

    worksheet.addRows(rows);

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=laporan-kehadiran.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exportKehadiranToExcel:", err.message);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Gagal mengekspor data kehadiran ke Excel",
      },
    });
  }
};
