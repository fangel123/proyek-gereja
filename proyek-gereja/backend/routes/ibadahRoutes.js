const express = require("express");
const router = express.Router();
const ibadahController = require("../controllers/ibadahController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router
  .route("/")
  .get(ibadahController.getAllIbadah)
  .post(ibadahController.createIbadah);

module.exports = router;
