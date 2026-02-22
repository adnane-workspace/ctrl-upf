const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 🔐 Middleware : Vérifie que le token JWT est valide
 * À utiliser sur toutes les routes protégées
 */
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Accès refusé — Aucun token fourni. Veuillez vous connecter.",
            });
        }

        const token = authHeader.split(" ")[1]; 

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Token invalide — Utilisateur introuvable.",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Session expirée — Veuillez vous reconnecter.",
            });
        }
        return res.status(401).json({
            success: false,
            message: "Token invalide.",
        });
    }
};


const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès interdit — Cette ressource requiert le rôle : ${roles.join(" ou ")}.`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
