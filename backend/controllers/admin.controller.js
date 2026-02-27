const Club = require("../models/Club"); // AJOUT
const Evenement = require("../models/Evenement"); // AJOUT

const getDashboard = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Bienvenue Admin"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getClubs = async (req, res) => {
    try {
        const clubs = await Club.find().lean(); // AJOUT

        const clubsWithCounts = await Promise.all( // AJOUT
            clubs.map(async (club) => {
                const eventsCount = await Evenement.countDocuments({ club: club._id }); // AJOUT
                return { ...club, eventsCount }; // AJOUT
            })
        ); // AJOUT

        res.json({ success: true, clubs: clubsWithCounts }); // AJOUT
    } catch (err) {
        res.status(500).json({ success: false, message: err.message }); // AJOUT
    }
}; // AJOUT

const getClubById = async (req, res) => {
    try {
        const { id } = req.params; // AJOUT
        const club = await Club.findById(id); // AJOUT

        if (!club) { // AJOUT
            return res.status(404).json({ success: false, message: "Club non trouvé" }); // AJOUT
        } // AJOUT

        const evenements = await Evenement.find({ club: id }).sort({ date: 1 }); // AJOUT

        res.json({ success: true, club, evenements }); // AJOUT
    } catch (err) {
        res.status(500).json({ success: false, message: err.message }); // AJOUT
    }
}; // AJOUT

// ──── CRÉER UN CLUB ─────────────────────────────────────────
const createClub = async (req, res) => {
    try {
        const { nom, description, responsable } = req.body;

        if (!nom) {
            return res.status(400).json({ success: false, message: "Le nom du club est obligatoire" });
        }

        // Vérifier si un club avec ce nom existe déjà
        const existingClub = await Club.findOne({ nom });
        if (existingClub) {
            return res.status(400).json({ success: false, message: "Un club avec ce nom existe déjà" });
        }

        // Construire l'URL du logo
        const logoUrl = req.file ? `/uploads/clubs/${req.file.filename}` : "";

        const newClub = await Club.create({
            nom,
            description: description || "",
            logo: logoUrl,
            responsable: responsable || null,
        });

        res.status(201).json({ success: true, club: newClub });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ──── MODIFIER UN CLUB ──────────────────────────────────────
const updateClub = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description, responsable } = req.body;

        // Vérifier que le club existe
        const club = await Club.findById(id);
        if (!club) {
            return res.status(404).json({ success: false, message: "Club non trouvé" });
        }

        // Si un nouveau logo est fourni, l'utiliser ; sinon, garder l'ancien
        const logoUrl = req.file ? `/uploads/clubs/${req.file.filename}` : club.logo;

        const updatedClub = await Club.findByIdAndUpdate(
            id,
            {
                nom: nom || club.nom,
                description: description !== undefined ? description : club.description,
                logo: logoUrl,
                responsable: responsable !== undefined ? responsable : club.responsable,
            },
            { new: true }
        );

        res.json({ success: true, club: updatedClub });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createEvenement = async (req, res) => {
    try {
        const { titre, details, date, heure, lieu, clubId } = req.body; // AJOUT

        if (!titre || !date || !heure || !lieu || !clubId) { // AJOUT
            return res.status(400).json({ success: false, message: "Tous les champs obligatoires doivent être remplis" }); // AJOUT
        } // AJOUT

        const photoUrl = req.file // AJOUT
            ? `/uploads/events/${req.file.filename}` // AJOUT
            : req.body.photo || ""; // AJOUT (fallback base64 / URL directe)

        const evenement = await Evenement.create({ // AJOUT
            titre,
            description: details || "",
            details: details || "",
            date,
            heure,
            lieu,
            photo: photoUrl,
            club: clubId,
            placesDisponibles: req.body.placesDisponibles || 0,
        }); // AJOUT

        res.status(201).json({ success: true, evenement }); // AJOUT
    } catch (err) {
        res.status(500).json({ success: false, message: err.message }); // AJOUT
    }
}; // AJOUT

const getEvenements = async (req, res) => {
    try {
        const { clubId } = req.query; // AJOUT
        const filter = {}; // AJOUT
        if (clubId) { // AJOUT
            filter.club = clubId; // AJOUT
        } // AJOUT

        const evenements = await Evenement.find(filter)
            .populate("club")
            .sort({ date: 1, heure: 1 }); // AJOUT

        res.json({ success: true, evenements }); // AJOUT
    } catch (err) {
        res.status(500).json({ success: false, message: err.message }); // AJOUT
    }
}; // AJOUT

module.exports = {
    getDashboard,
    getClubs, // AJOUT
    getClubById, // AJOUT
    createClub, // NOUVEAU
    updateClub, // NOUVEAU
    createEvenement, // AJOUT
    getEvenements, // AJOUT
};
