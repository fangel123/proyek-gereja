const express = require("express");
const router = express.Router();
const klasifikasiController = require("../controllers/klasifikasiController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router
  .route("/")
  .get(klasifikasiController.getAllKlasifikasi)
  .post(klasifikasiController.createKlasifikasi);

router
  .route("/:id")
  .put(klasifikasiController.updateKlasifikasi)
  .delete(klasifikasiController.deleteKlasifikasi);

module.exports = router;
