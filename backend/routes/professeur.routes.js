const express = require("express");
const router = express.Router();
const {
    getDashboard,
    getMesCours,
    getMesSeances,
    getMesAbsences,
    signalerAbsence,
    updateAbsence,
    supprimerAbsence,
    getEtudiantsParCours,
    getMesNotes,
    ajouterNote,
    batchAjouterNotes,
    updateNote,
    supprimerNote,
    getTousEtudiants,
} = require("../controllers/professeur.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Toutes les routes professeur → token requis + rôle "professeur"
router.use(protect, authorize("professeur"));

// ─── DASHBOARD ────────────────────────────────────────────
router.get("/dashboard", getDashboard);

// ─── COURS ────────────────────────────────────────────────
router.get("/cours", getMesCours);

// ─── SÉANCES / EMPLOI DU TEMPS ────────────────────────────
router.get("/seances", getMesSeances);

// ─── ABSENCES ─────────────────────────────────────────────
router.get("/absences", getMesAbsences);
router.post("/absences", signalerAbsence);
router.patch("/absences/:id", updateAbsence);
router.delete("/absences/:id", supprimerAbsence);

// ─── NOTES / DEVOIRS ──────────────────────────────────────
router.get("/notes", getMesNotes);
router.post("/notes", ajouterNote);
router.post("/notes/batch", batchAjouterNotes);
router.patch("/notes/:id", updateNote);
router.delete("/notes/:id", supprimerNote);

// ─── ÉTUDIANTS ────────────────────────────────────────────
router.get("/etudiants", getTousEtudiants);
router.get("/etudiants-par-cours/:coursId", getEtudiantsParCours);

module.exports = router;
