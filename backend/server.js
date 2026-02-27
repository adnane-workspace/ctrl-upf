const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ─── CORS ────────────────────────────────────────────────────
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── SERVEUR DE FICHIERS STATIQUES ───────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/photos", express.static(path.join(__dirname, "..", "photos")));

// ─── CONNEXION MONGODB ───────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI manquant dans le fichier .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connecté avec succès"))
  .catch((err) => {
    console.error("Erreur de connexion MongoDB :", err.message);
    process.exit(1);
  });

// ─── ROUTES ─────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/professeur", require("./routes/professeur.routes"));
app.use("/api/etudiant", require("./routes/etudiant.routes"));
app.use("/api/club", require("./routes/club.routes"));

// Route de test
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Serveur opérationnel", timestamp: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

// ─── GESTION DES ERREURS GLOBALES ────────────────────────────
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);
  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

// ─── DÉMARRAGE ───────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));