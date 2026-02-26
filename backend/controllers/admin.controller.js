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

const createEvenement = async (req, res) => {
    try {
        const { titre, details, date, heure, lieu, clubId } = req.body; // AJOUT

        if (!titre || !date || !heure || !lieu || !clubId) { // AJOUT
            return res.status(400).json({ success: false, message: "Tous les champs obligatoires doivent être remplis" }); // AJOUT
        } // AJOUT

        const photoUrl = req.file // AJOUT
            ? `/uploads/${req.file.filename}` // AJOUT
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
    createEvenement, // AJOUT
    getEvenements, // AJOUT
};
