require("dotenv").config();
const express = require("express");
const cors = require("cors");
const exportController = require("./controllers/exportController");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/klasifikasi", require("./routes/klasifikasiRoutes"));
app.use("/api/ibadah", require("./routes/ibadahRoutes"));
app.get(
  "/api/export/ibadah/:id/pdf",
  authMiddleware,
  exportController.exportAgendaToPdf
);
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.get(
  "/api/export/kehadiran/excel",
  authMiddleware,
  exportController.exportKehadiranToExcel
);

app.get("/", (_req, res) => {
  res.send("Halo dari Backend Sistem Gereja!");
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
