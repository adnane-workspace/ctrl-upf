const mongoose = require("mongoose");

const professeurSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est obligatoire"],
      unique: true,   // ← un User = un Professeur max
    },
    matriculeEmploye: {
      type: String,
      required: [true, "Le matricule employé est obligatoire"],
      unique: true,
      trim: true,
    },
    specialite: {
      type: String,
      required: [true, "La spécialité est obligatoire"],
    },
    bureau: {
      type: String,
      default: "Non assigné",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Professeur", professeurSchema);