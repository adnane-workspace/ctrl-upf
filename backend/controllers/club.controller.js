const getDashboard = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Bienvenue le president du club"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getDashboard };
