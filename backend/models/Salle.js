const mongoose = require("mongoose");

const salleSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: [true, "Le numéro de la salle est obligatoire"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    capacite: {
      type: Number,
      required: [true, "La capacité est obligatoire"],
      min: [1, "La capacité doit être d'au moins 1 personne"],
    },
    type: {
      type: String,
      required: [true, "Le type de salle est obligatoire"],
      enum: ["Amphi", "Salle de cours", "Salle TP", "Salle TD"],
      default: "Salle de cours",
    },
    estDisponible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salle", salleSchema);