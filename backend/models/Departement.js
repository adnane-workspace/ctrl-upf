const mongoose = require("mongoose");

const departementSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom du département est obligatoire"],
      unique: true,
      trim: true,
    },
    chefDepartement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professeur",   // ← corrigé : un chef de département est un Professeur
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Departement", departementSchema);