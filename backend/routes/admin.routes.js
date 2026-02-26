const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/admin.controller");
const {
  getClubs,
  getClubById,
  createEvenement,
  getEvenements,
} = require("../controllers/admin.controller"); // AJOUT
const { protect, authorize } = require("../middleware/auth.middleware");
const multer = require("multer"); // AJOUT
const path = require("path"); // AJOUT

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
}); // AJOUT

// Protéger uniquement les routes sensibles (création / gestion)
router.get("/dashboard", protect, authorize("admin"), getDashboard);

// Routes publiques pour consultation des clubs et événements
router.get("/clubs", getClubs); // AJOUT
router.get("/clubs/:id", getClubById); // AJOUT
router.get("/evenements", getEvenements); // AJOUT

// Routes protégées pour les actions qui modifient les données
router.post("/evenements", protect, authorize("admin"), upload.single("photo"), createEvenement); // AJOUT

module.exports = router;
