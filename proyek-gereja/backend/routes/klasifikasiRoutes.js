const express = require("express");
const router = express.Router();
const klasifikasiController = require("../controllers/klasifikasiController");
const authMiddleware = require("../middleware/authMiddleware"); // <-- IMPORT PENJAGA GERBANG

router.get("/", authMiddleware, klasifikasiController.getAllKlasifikasi);

router.post("/", authMiddleware, klasifikasiController.createKlasifikasi);

module.exports = router;
