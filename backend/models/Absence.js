const mongoose = require("mongoose");

const absenceSchema = new mongoose.Schema(
  {
    etudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Etudiant",
      required: [true, "L'étudiant est obligatoire"],
    },
    seance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seance",
      required: [true, "La séance est obligatoire"],
    },
    date: {
      type: Date,
      required: [true, "La date est obligatoire"],
      default: Date.now,
    },
    estJustifiee: {
      type: Boolean,
      default: false,
    },
    motif: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// ✅ Empêcher un étudiant d'avoir 2 absences pour la même séance
absenceSchema.index({ etudiant: 1, seance: 1 }, { unique: true });

module.exports = mongoose.model("Absence", absenceSchema);