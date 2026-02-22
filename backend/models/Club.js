const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom du club est obligatoire"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    responsable: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Etudiant",
      default: null,
    },
    membres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Etudiant",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Club", clubSchema);