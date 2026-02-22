const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect, authorize("admin"));
router.get("/dashboard", getDashboard);

module.exports = router;
