const mongoose = require("mongoose");

const devoirSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre du devoir est obligatoire"],
      trim: true,
    },
    cours: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cours",
      required: [true, "Le cours associé est obligatoire"],
    },
    dateLimite: {
      type: Date,
      required: [true, "La date limite est obligatoire"],
    },
    fichier: {
      type: String,
      default: "",
    },
    statut: {
      type: String,
      enum: ["en_attente", "rendu", "corrige"],
      default: "en_attente",
    },
    etudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Etudiant",
      required: [true, "L'étudiant est obligatoire"],
    },
    // ─── Champs pour les notes ───────────────────────
    note: {
      type: Number,
      min: 0,
      max: 20,
      default: null,
    },
    commentaire: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Devoir", devoirSchema);