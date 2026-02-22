const mongoose = require("mongoose");

const etudiantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'utilisateur est obligatoire"],
      unique: true,   // ← un User ne peut pas être deux étudiants différents
    },
    matricule: {
      type: String,
      required: [true, "Le matricule est obligatoire"],
      unique: true,
      trim: true,
    },
    filiere: {
      type: String,
      required: [true, "La filière est obligatoire"],
    },
    anneeEtude: {
      type: Number,         // ← Number est plus propre que String pour "1", "2", "3"...
      required: true,
      min: 1,
      max: 5,
    },
    // tauxAbsence SUPPRIMÉ → on le calcule depuis la collection Absence
  },
  { timestamps: true }
);

module.exports = mongoose.model("Etudiant", etudiantSchema);