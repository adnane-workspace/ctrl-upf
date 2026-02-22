const getDashboard = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Bienvenue Étudiant"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getDashboard };
