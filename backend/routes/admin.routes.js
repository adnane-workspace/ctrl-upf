const express = require("express");
const router = express.Router();
const { 
  getDashboard,
  getClubs,
  getClubById,
  createClub,
  updateClub,
  createEvenement,
  getEvenements,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const { uploadLogo, uploadPhoto } = require("../config/multer");

// Protéger uniquement les routes sensibles (création / gestion)
router.get("/dashboard", protect, authorize("admin"), getDashboard);

// Routes publiques pour consultation des clubs et événements
router.get("/clubs", getClubs);
router.get("/clubs/:id", getClubById);
router.get("/evenements", getEvenements);

// Routes protégées pour créer et modifier les clubs
router.post("/clubs", protect, authorize("admin"), uploadLogo.single("logo"), createClub);
router.put("/clubs/:id", protect, authorize("admin"), uploadLogo.single("logo"), updateClub);

// Routes protégées pour les événements
router.post("/evenements", protect, authorize("admin"), uploadPhoto.single("photo"), createEvenement);

module.exports = router;
