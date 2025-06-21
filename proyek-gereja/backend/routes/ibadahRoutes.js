const express = require("express");
const router = express.Router();
const ibadahController = require("../controllers/ibadahController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router
  .route("/")
  .get(ibadahController.getAllIbadah)
  .post(ibadahController.createIbadah);

router.route("/:id").get(ibadahController.getIbadahById);
router.route("/:id/kehadiran").put(ibadahController.updateKehadiran);

router.route("/:id/agenda").post(ibadahController.addAgenda);
router
  .route("/:id/agenda/:agenda_id")
  .delete(ibadahController.deleteAgenda)
  .put(ibadahController.updateAgenda); // <-- TAMBAHKAN INI

module.exports = router;
