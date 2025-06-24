const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/kehadiran", analyticsController.getKehadiranAnalytics);
router.get("/klasifikasi", analyticsController.getAllKlasifikasi);
router.get("/dashboard", analyticsController.getDashboardSummary);

module.exports = router;
