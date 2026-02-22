const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/professeur.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Toutes les routes professeur → token requis + rôle "professeur"
router.use(protect, authorize("professeur"));

router.get("/dashboard", getDashboard);

module.exports = router;
