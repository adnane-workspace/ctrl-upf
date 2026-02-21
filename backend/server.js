const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI manquant dans le fichier .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connecté avec succès"))
  .catch((err) => {
    console.error("Erreur de connexion MongoDB :", err.message);
    process.exit(1);
  });

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Communication OK ",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route non trouvée" });
});

app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);
  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
);