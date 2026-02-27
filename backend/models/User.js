const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,          // ← pas deux users avec le même email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [6, "Le mot de passe doit avoir au moins 6 caractères"],
    },
    photoUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      // add "president" role; keep existing president_club for backward compatibility
      enum: ["admin", "professeur", "etudiant", "president_club", "president"],
      default: "etudiant",
      required: true,
    },
  },
  { timestamps: true }       // ← ajoute createdAt et updatedAt automatiquement
);

module.exports = mongoose.model("User", userSchema);