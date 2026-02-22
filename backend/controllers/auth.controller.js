const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email et mot de passe sont obligatoires.",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Email ou mot de passe incorrect.",
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Connexion réussie.",
            token,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl,
            },
        });
    } catch (err) {
        console.error("Erreur login :", err.message);
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
};

const getMe = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
};

module.exports = { login, getMe };
