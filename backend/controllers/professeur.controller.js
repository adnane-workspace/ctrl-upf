const Professeur = require("../models/Professeur");
const Cours = require("../models/Cours");
const Seance = require("../models/Seance");
const Absence = require("../models/Absence");
const Etudiant = require("../models/Etudiant");
const User = require("../models/User");
const Departement = require("../models/Departement");
const Salle = require("../models/Salle");
const Devoir = require("../models/Devoir");

// ─── HELPER : trouver le profil Professeur lié au user connecté ───────────────
const getProfesseurProfile = async (userId) => {
    return await Professeur.findOne({ user: userId }).populate("user", "nom email");
};

// ─── GET /dashboard ───────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
    try {
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil professeur introuvable." });

        // Cours assignés à ce professeur
        const cours = await Cours.find({ professeur: prof._id }).populate("departement", "nom");

        // Séances passées et futures
        const now = new Date();
        const seancesAll = await Seance.find({ cours: { $in: cours.map(c => c._id) } })
            .populate({ path: "cours", select: "nom codeModule semestre" })
            .populate({ path: "salle", select: "numero type" })
            .sort({ date: 1, heureDebut: 1 });

        const seancesPassees = seancesAll.filter(s => new Date(s.date) < now);
        const seancesRestantes = seancesAll.filter(s => new Date(s.date) >= now);

        // Étudiants uniques via absences (approximation : tous les étudiants des filières liées)
        const absences = await Absence.find({
            seance: { $in: seancesAll.map(s => s._id) }
        }).populate({ path: "etudiant", select: "filiere matricule" });

        // Total étudiants distincts ayant eu une séance avec ce prof
        const etudiantIds = [...new Set(absences.map(a => a.etudiant?._id?.toString()).filter(Boolean))];

        // Taux de présence global
        const totalSeancesAbsences = absences.length;
        const seancesEffectuees = seancesPassees.length;
        let tauxPresence = 100;
        if (seancesEffectuees > 0 && etudiantIds.length > 0) {
            const totalPossible = seancesPassees.length * Math.max(etudiantIds.length, 1);
            tauxPresence = Math.round(((totalPossible - totalSeancesAbsences) / totalPossible) * 100);
        }

        // Séances du jour
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const seancesAujourdhui = seancesAll.filter(s => {
            const d = new Date(s.date);
            return d >= today && d < tomorrow;
        });

        // Séances de la semaine
        const debutSemaine = new Date(today);
        debutSemaine.setDate(today.getDate() - today.getDay() + 1);
        const finSemaine = new Date(debutSemaine);
        finSemaine.setDate(debutSemaine.getDate() + 6);
        const seancesSemaine = seancesAll.filter(s => {
            const d = new Date(s.date);
            return d >= debutSemaine && d <= finSemaine;
        });

        // Absences récentes (5 dernières)
        const absencesRecentes = await Absence.find({
            seance: { $in: seancesAll.map(s => s._id) }
        })
            .sort({ date: -1 })
            .limit(5)
            .populate({ path: "etudiant", populate: { path: "user", select: "nom" } })
            .populate({ path: "seance", populate: { path: "cours", select: "nom" } });

        res.json({
            success: true,
            data: {
                professeur: {
                    nom: req.user.nom,
                    email: req.user.email,
                    specialite: prof.specialite,
                    bureau: prof.bureau,
                    matricule: prof.matriculeEmploye,
                },
                stats: {
                    coursAssignes: cours.length,
                    etudiantsTotaux: etudiantIds.length || 0,
                    seancesEffectuees: seancesPassees.length,
                    tauxPresence: tauxPresence,
                    seancesRestantes: seancesRestantes.length,
                },
                seancesAujourdhui,
                seancesSemaine,
                absencesRecentes,
                cours,
            },
        });
    } catch (err) {
        console.error("Erreur getDashboard professeur:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /cours ───────────────────────────────────────────────────────────────
const getMesCours = async (req, res) => {
    try {
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil professeur introuvable." });

        const cours = await Cours.find({ professeur: prof._id })
            .populate("departement", "nom")
            .sort({ semestre: 1, nom: 1 });

        res.json({ success: true, data: cours });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /seances ─────────────────────────────────────────────────────────────
const getMesSeances = async (req, res) => {
    try {
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil professeur introuvable." });

        const cours = await Cours.find({ professeur: prof._id });
        const { vue = "semaine", date } = req.query;

        let dateRef = date ? new Date(date) : new Date();
        let debut, fin;

        if (vue === "jour") {
            debut = new Date(dateRef);
            debut.setHours(0, 0, 0, 0);
            fin = new Date(dateRef);
            fin.setHours(23, 59, 59, 999);
        } else {
            // semaine
            debut = new Date(dateRef);
            const day = debut.getDay();
            const diff = debut.getDate() - day + (day === 0 ? -6 : 1);
            debut.setDate(diff);
            debut.setHours(0, 0, 0, 0);
            fin = new Date(debut);
            fin.setDate(debut.getDate() + 6);
            fin.setHours(23, 59, 59, 999);
        }

        const seances = await Seance.find({
            cours: { $in: cours.map(c => c._id) },
            date: { $gte: debut, $lte: fin },
        })
            .populate({ path: "cours", select: "nom codeModule semestre" })
            .populate({ path: "salle", select: "numero type" })
            .sort({ date: 1, heureDebut: 1 });

        res.json({ success: true, data: seances });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /absences ────────────────────────────────────────────────────────────
const getMesAbsences = async (req, res) => {
    try {
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil professeur introuvable." });

        const cours = await Cours.find({ professeur: prof._id });
        const seances = await Seance.find({ cours: { $in: cours.map(c => c._id) } });

        const { seanceId, coursId } = req.query;
        let filter = { seance: { $in: seances.map(s => s._id) } };
        if (seanceId) filter.seance = seanceId;
        if (coursId) {
            const seancesDuCours = seances.filter(s => s.cours.toString() === coursId);
            filter.seance = { $in: seancesDuCours.map(s => s._id) };
        }

        const absences = await Absence.find(filter)
            .populate({ path: "etudiant", populate: { path: "user", select: "nom email" } })
            .populate({ path: "seance", populate: { path: "cours", select: "nom codeModule" } })
            .sort({ date: -1 });

        res.json({ success: true, data: absences });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /absences ───────────────────────────────────────────────────────────
const signalerAbsence = async (req, res) => {
    try {
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil introuvable." });

        const { etudiantId, seanceId, motif, estJustifiee } = req.body;
        if (!etudiantId || !seanceId) {
            return res.status(400).json({ success: false, message: "etudiantId et seanceId sont requis." });
        }

        // Vérifier que la séance appartient bien à ce prof
        const seance = await Seance.findById(seanceId).populate("cours");
        if (!seance || seance.cours.professeur.toString() !== prof._id.toString()) {
            return res.status(403).json({ success: false, message: "Séance non autorisée." });
        }

        const absence = await Absence.create({
            etudiant: etudiantId,
            seance: seanceId,
            date: seance.date,
            estJustifiee: estJustifiee || false,
            motif: motif || "",
        });

        const absencePopulated = await Absence.findById(absence._id)
            .populate({ path: "etudiant", populate: { path: "user", select: "nom email" } })
            .populate({ path: "seance", populate: { path: "cours", select: "nom codeModule" } });

        res.status(201).json({ success: true, data: absencePopulated });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: "Cette absence est déjà enregistrée." });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /absences/:id ──────────────────────────────────────────────────────
const updateAbsence = async (req, res) => {
    try {
        const { id } = req.params;
        const { estJustifiee, motif } = req.body;

        const absence = await Absence.findByIdAndUpdate(
            id,
            { estJustifiee, motif },
            { new: true }
        )
            .populate({ path: "etudiant", populate: { path: "user", select: "nom email" } })
            .populate({ path: "seance", populate: { path: "cours", select: "nom codeModule" } });

        if (!absence) return res.status(404).json({ success: false, message: "Absence introuvable." });

        res.json({ success: true, data: absence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE /absences/:id ─────────────────────────────────────────────────────
const supprimerAbsence = async (req, res) => {
    try {
        const absence = await Absence.findByIdAndDelete(req.params.id);
        if (!absence) return res.status(404).json({ success: false, message: "Absence introuvable." });
        res.json({ success: true, message: "Absence supprimée." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /etudiants-par-cours/:coursId ────────────────────────────────────────
const getEtudiantsParCours = async (req, res) => {
    try {
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil introuvable." });

        const cours = await Cours.findById(req.params.coursId);
        if (!cours || cours.professeur.toString() !== prof._id.toString()) {
            return res.status(403).json({ success: false, message: "Cours non autorisé." });
        }

        // On cherche tous les étudiants de la même filière/année que le cours
        // Pour simplifier, on retourne tous les étudiants
        const etudiants = await Etudiant.find({}).populate("user", "nom email");

        res.json({ success: true, data: etudiants });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /notes ───────────────────────────────────────────────────────────────
// Les notes sont basées sur les Devoirs
const getMesNotes = async (req, res) => {
    try {
        const Devoir = require("../models/Devoir");
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil introuvable." });

        const cours = await Cours.find({ professeur: prof._id });
        const { coursId } = req.query;

        let filter = { cours: { $in: cours.map(c => c._id) } };
        if (coursId) filter.cours = coursId;

        const devoirs = await Devoir.find(filter)
            .populate({ path: "cours", select: "nom codeModule semestre" })
            .populate({ path: "etudiant", populate: { path: "user", select: "nom email" } })
            .sort({ dateLimite: -1 });

        res.json({ success: true, data: devoirs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /notes ─────────────────────────────────────────────────────────────
const ajouterNote = async (req, res) => {
    try {
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil introuvable." });

        const { titre, coursId, etudiantId, dateLimite, note, commentaire, statut } = req.body;

        console.log("📥 ajouterNote reçu:", { titre, coursId, etudiantId, dateLimite, note });

        if (!titre || !coursId || !etudiantId || !dateLimite) {
            return res.status(400).json({ success: false, message: "Champs obligatoires manquants (titre, coursId, etudiantId, dateLimite)." });
        }

        // Vérifier que le cours appartient à ce prof
        const cours = await Cours.findById(coursId);
        if (!cours) {
            return res.status(404).json({ success: false, message: "Cours introuvable." });
        }
        if (cours.professeur.toString() !== prof._id.toString()) {
            return res.status(403).json({ success: false, message: "Cours non autorisé — ce cours ne vous appartient pas." });
        }

        // Vérifier que l'étudiant existe
        const etudiant = await Etudiant.findById(etudiantId);
        if (!etudiant) {
            return res.status(404).json({ success: false, message: "Étudiant introuvable." });
        }

        const noteValue = (note !== undefined && note !== null && note !== "") ? parseFloat(note) : null;
        const statutValue = noteValue !== null ? "corrige" : (statut || "en_attente");

        const devoir = await Devoir.create({
            titre,
            cours: coursId,
            etudiant: etudiantId,
            dateLimite: new Date(dateLimite),
            statut: statutValue,
            note: noteValue,
            commentaire: commentaire || "",
        });

        const devoirPopulated = await Devoir.findById(devoir._id)
            .populate({ path: "cours", select: "nom codeModule semestre" })
            .populate({ path: "etudiant", populate: { path: "user", select: "nom email" } });

        console.log("✅ Note créée:", devoir._id);
        res.status(201).json({ success: true, data: devoirPopulated });
    } catch (err) {
        console.error("❌ Erreur ajouterNote:", err.message);
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── PATCH /notes/:id ─────────────────────────────────────────────────────────
const updateNote = async (req, res) => {
    try {
        const Devoir = require("../models/Devoir");
        const { note, commentaire, statut, titre, dateLimite } = req.body;

        const devoir = await Devoir.findByIdAndUpdate(
            req.params.id,
            { note, commentaire, statut, titre, dateLimite },
            { new: true }
        )
            .populate({ path: "cours", select: "nom codeModule semestre" })
            .populate({ path: "etudiant", populate: { path: "user", select: "nom email" } });

        if (!devoir) return res.status(404).json({ success: false, message: "Devoir introuvable." });

        res.json({ success: true, data: devoir });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── DELETE /notes/:id ────────────────────────────────────────────────────────
const supprimerNote = async (req, res) => {
    try {
        const Devoir = require("../models/Devoir");
        const devoir = await Devoir.findByIdAndDelete(req.params.id);
        if (!devoir) return res.status(404).json({ success: false, message: "Devoir introuvable." });
        res.json({ success: true, message: "Note supprimée." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /notes/batch ────────────────────────────────────────────────────────
const batchAjouterNotes = async (req, res) => {
    try {
        const { notes } = req.body;

        console.log("📥 Requête batchAjouterNotes reçue :", notes?.length, "notes");

        if (!Array.isArray(notes) || notes.length === 0) {
            return res.status(400).json({ success: false, message: "Données invalides : tableau 'notes' vide ou manquant." });
        }

        // Récupérer le profil professeur pour vérifier l'autorisation
        const prof = await getProfesseurProfile(req.user._id);
        if (!prof) return res.status(404).json({ success: false, message: "Profil introuvable." });

        // Vérifier que le coursId du premier item appartient bien à ce prof (tous ont le même coursId)
        const coursId = notes[0].coursId;
        const cours = await Cours.findById(coursId);
        if (!cours) {
            return res.status(404).json({ success: false, message: "Cours introuvable." });
        }
        if (cours.professeur.toString() !== prof._id.toString()) {
            return res.status(403).json({ success: false, message: "Cours non autorisé." });
        }

        const devoirs = await Promise.all(notes.map(async (item) => {
            try {
                return await Devoir.create({
                    etudiant: item.etudiantId,
                    cours: item.coursId,
                    titre: item.titre,
                    note: parseFloat(item.note),
                    commentaire: item.commentaire || "",
                    dateLimite: item.dateLimite ? new Date(item.dateLimite) : new Date(),
                    statut: "corrige"
                });
            } catch (err) {
                console.error("❌ Erreur création note pour étudiant", item.etudiantId, ":", err.message);
                throw err;
            }
        }));

        console.log("✅ Batch terminé:", devoirs.length, "notes créées.");
        res.status(201).json({ success: true, count: devoirs.length, message: `${devoirs.length} note(s) enregistrée(s) avec succès.` });
    } catch (err) {
        console.error("💥 Erreur globale batchAjouterNotes :", err.message);
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

const getTousEtudiants = async (req, res) => {
    try {
        const etudiants = await Etudiant.find({}).populate("user", "nom email");
        res.json({ success: true, data: etudiants });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
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
};
