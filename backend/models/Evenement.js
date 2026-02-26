const mongoose = require("mongoose");

const evenementSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre de l'événement est obligatoire"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    details: {
      type: String,
      trim: true,
      default: "",
    }, // AJOUT
    date: {
      type: Date,
      required: [true, "La date de l'événement est obligatoire"],
    },
    heure: {
      type: String,
      required: [true, "L'heure de l'événement est obligatoire"],
      trim: true,
    }, // AJOUT
    lieu: {
      type: String,
      required: [true, "Le lieu est obligatoire"],
      trim: true,
    },
    photo: {
      type: String,
      default: "",
    }, // AJOUT
    interesses: {
      type: Number,
      default: 0,
    }, // AJOUT
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    }, // AJOUT
    placesDisponibles: {
      type: Number,
      required: [true, "Le nombre de places est obligatoire"],
      min: [0, "Le nombre de places ne peut pas être négatif"],
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Etudiant",
      },
    ],
  },
  { timestamps: true }
);

// ✅ Virtual : savoir si l'événement est complet
evenementSchema.virtual("estComplet").get(function () {
  return this.participants.length >= this.placesDisponibles;
});

module.exports = mongoose.model("Evenement", evenementSchema);