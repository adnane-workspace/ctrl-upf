const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/etudiant.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Toutes les routes étudiant → token requis + rôle "etudiant"
router.use(protect, authorize("etudiant"));

router.get("/dashboard", getDashboard);

module.exports = router;
