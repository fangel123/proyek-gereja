const PdfPrinter = require("pdfmake");
const path = require("path");
const pool = require("../db");

exports.exportAgendaToPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const ibadahRes = await pool.query("SELECT * FROM ibadah WHERE id = $1", [
      id,
    ]);
    if (ibadahRes.rows.length === 0) {
      return res.status(404).send("Ibadah tidak ditemukan.");
    }
    const agendaRes = await pool.query(
      "SELECT * FROM agenda WHERE ibadah_id = $1 ORDER BY urutan ASC",
      [id]
    );

    const ibadah = ibadahRes.rows[0];
    const agenda = agendaRes.rows;

    const fonts = {
      Roboto: {
        normal: path.join(
          __dirname,
          "..",
          "src",
          "modules",
          "pdf",
          "fonts",
          "Roboto-Regular.ttf"
        ),
        bold: path.join(
          __dirname,
          "..",
          "src",
          "modules",
          "pdf",
          "fonts",
          "Roboto-Bold.ttf"
        ),
        italics: path.join(
          __dirname,
          "..",
          "src",
          "modules",
          "pdf",
          "fonts",
          "Roboto-Italic.ttf"
        ),
        bolditalics: path.join(
          __dirname,
          "..",
          "src",
          "modules",
          "pdf",
          "fonts",
          "Roboto-BoldItalic.ttf"
        ),
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        { text: "GEREJA XYZ", style: "header", alignment: "center" },
        {
          text: "Susunan Acara Ibadah",
          style: "subheader",
          alignment: "center",
        },
        { text: `\n${ibadah.nama}`, style: "title", alignment: "center" },
        {
          text: `Tanggal: ${new Date(ibadah.tanggal).toLocaleDateString(
            "id-ID",
            { weekday: "long", year: "numeric", month: "long", day: "numeric" }
          )}`,
          alignment: "center",
          margin: [0, 0, 0, 20],
        },

        {
          style: "tableExample",
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
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 0, 0, 5] },
        title: { fontSize: 16, bold: true },
        tableExample: { margin: [0, 5, 0, 15] },
        tableHeader: { bold: true, fontSize: 13, color: "black" },
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
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
