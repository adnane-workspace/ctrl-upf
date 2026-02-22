const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema(
  {
    codeModule: {
      type: String,
      required: [true, "Le code du module est obligatoire"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nom: {
      type: String,
      required: [true, "Le nom du cours est obligatoire"],
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, "Le nombre de crédits est obligatoire"],
      min: [1, "Minimum 1 crédit"],
      max: [10, "Maximum 10 crédits"],
    },
    semestre: {
      type: String,
      required: [true, "Le semestre est obligatoire"],
      enum: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"],
    },
    professeur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professeur",
      required: [true, "Le professeur est obligatoire"],
    },
    departement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Departement",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cours", coursSchema);