const mongoose = require("mongoose");

const seanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "La date de la séance est obligatoire"],
    },
    heureDebut: {
      type: String,
      required: [true, "L'heure de début est obligatoire"],
      match: [/^\d{2}:\d{2}$/, "Format attendu : HH:MM (ex: 08:30)"],
    },
    heureFin: {
      type: String,
      required: [true, "L'heure de fin est obligatoire"],
      match: [/^\d{2}:\d{2}$/, "Format attendu : HH:MM (ex: 10:30)"],
    },
    type: {
      type: String,
      required: [true, "Le type de séance est obligatoire"],
      enum: ["Cours", "TD", "TP"],
      default: "Cours",
    },
    cours: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cours",
      required: [true, "Le cours est obligatoire"],
    },
    salle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salle",
      required: [true, "La salle est obligatoire"],
    },
  },
  { timestamps: true }
);

// ✅ Empêcher deux séances dans la même salle au même moment
seanceSchema.index({ salle: 1, date: 1, heureDebut: 1 }, { unique: true });

module.exports = mongoose.model("Seance", seanceSchema);