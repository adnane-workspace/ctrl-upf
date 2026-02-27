const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/club.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Routes pour le club
router.get("/dashboard", protect, authorize("president_club"), getDashboard);

module.exports = router;
