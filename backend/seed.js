/**
 * 🌱 SCRIPT DE SEED — Crée des données de test dans MongoDB
 * 
 * Pour l'exécuter :  node seed.js
 * 
 * Ce script va créer automatiquement toutes les collections
 * et les remplir avec des données de démonstration.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import de tous les modèles
const User = require("./models/User");
const Etudiant = require("./models/Etudiant");
const Professeur = require("./models/Professeur");
const Departement = require("./models/Departement");
const Cours = require("./models/Cours");
const Salle = require("./models/Salle");
const Seance = require("./models/Seance");
const Absence = require("./models/Absence");
const Devoir = require("./models/Devoir");
const Club = require("./models/Club");
const Evenement = require("./models/Evenement");

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(" Connecté à MongoDB :", process.env.MONGO_URI);

        console.log("\n  Suppression des anciennes données...");
        await Promise.all([
            User.deleteMany({}),
            Etudiant.deleteMany({}),
            Professeur.deleteMany({}),
            Departement.deleteMany({}),
            Cours.deleteMany({}),
            Salle.deleteMany({}),
            Seance.deleteMany({}),
            Absence.deleteMany({}),
            Devoir.deleteMany({}),
            Club.deleteMany({}),
            Evenement.deleteMany({}),
        ]);
        console.log(" Base de données vidée.");

        // ─────────────────────────────────────────────────────────
        // 3️⃣ CRÉATION DES USERS
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des utilisateurs...");

        // ✅ Les mots de passe sont hashés avec bcrypt (sécurité)
        const hashAdmin = await bcrypt.hash("admin123", 10);
        const hashProf = await bcrypt.hash("prof123", 10);
        const hashEtud = await bcrypt.hash("etud123", 10);

        const userAdmin = await User.create({
            nom: "Admin",
            email: "admin@upf.ma",
            password: hashAdmin,
            role: "admin",
        });

        const userProf1 = await User.create({
            nom: "Mohammed Alami",
            email: "prof1@upf.ma",
            password: hashProf,
            role: "professeur",
        });

        const userProf2 = await User.create({
            nom: "Fatima Zahrae",
            email: "prof2@upf.ma",
            password: hashProf,
            role: "professeur",
        });

        const userEtud1 = await User.create({
            nom: "Adnane elmen",
            email: "adnaneelmen@upf.ma",
            password: hashEtud,
            role: "etudiant",
        });

        const userEtud2 = await User.create({
            nom: "kenza boutarfass",
            email: "kenza@upf.ma",
            password: hashEtud,
            role: "etudiant",
        });

        console.log(`${await User.countDocuments()} utilisateurs créés.`);

        // ─────────────────────────────────────────────────────────
        // 4️⃣ CRÉATION DES PROFESSEURS
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des professeurs...");

        const prof1 = await Professeur.create({
            user: userProf1._id,
            matriculeEmploye: "EMP-001",
            specialite: "Informatique",
            bureau: "B204",
        });

        const prof2 = await Professeur.create({
            user: userProf2._id,
            matriculeEmploye: "EMP-002",
            specialite: "Mathématiques",
            bureau: "B310",
        });

        console.log(`${await Professeur.countDocuments()} professeurs créés.`);

        // ─────────────────────────────────────────────────────────
        // 5️⃣ CRÉATION DES DÉPARTEMENTS
        // ─────────────────────────────────────────────────────────
        console.log("\n  Création des départements...");

        const dept = await Departement.create({
            nom: "Informatique",
            chefDepartement: prof1._id,
        });

        console.log(`${await Departement.countDocuments()} département créé.`);

        // ─────────────────────────────────────────────────────────
        // 6️⃣ CRÉATION DES ÉTUDIANTS
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des étudiants...");

        const etud1 = await Etudiant.create({
            user: userEtud1._id,
            matricule: "ETU-2024-001",
            filiere: "Génie Informatique",
            anneeEtude: 2,
        });

        const etud2 = await Etudiant.create({
            user: userEtud2._id,
            matricule: "ETU-2024-002",
            filiere: "Génie Informatique",
            anneeEtude: 2,
        });

        console.log(`${await Etudiant.countDocuments()} étudiants créés.`);

        // ─────────────────────────────────────────────────────────
        // 7️⃣ CRÉATION DES SALLES
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des salles...");

        const salle1 = await Salle.create({
            numero: "A101",
            capacite: 30,
            type: "Salle de cours",
            estDisponible: true,
        });

        const salle2 = await Salle.create({
            numero: "LABO-01",
            capacite: 20,
            type: "Salle TP",
            estDisponible: true,
        });

        console.log(`${await Salle.countDocuments()} salles créées.`);

        // ─────────────────────────────────────────────────────────
        // 8️⃣ CRÉATION DES COURS
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des cours...");

        const cours1 = await Cours.create({
            codeModule: "INF301",
            nom: "Bases de données",
            credits: 4,
            semestre: "S3",
            professeur: prof1._id,
            departement: dept._id,
        });

        const cours2 = await Cours.create({
            codeModule: "INF302",
            nom: "Développement Web",
            credits: 3,
            semestre: "S3",
            professeur: prof1._id,
            departement: dept._id,
        });

        console.log(`${await Cours.countDocuments()} cours créés.`);

        // ─────────────────────────────────────────────────────────
        // 9️⃣ CRÉATION DES SÉANCES
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des séances...");

        const seance1 = await Seance.create({
            date: new Date("2024-03-04"),
            heureDebut: "08:30",
            heureFin: "10:30",
            type: "Cours",
            cours: cours1._id,
            salle: salle1._id,
        });

        const seance2 = await Seance.create({
            date: new Date("2024-03-04"),
            heureDebut: "10:30",
            heureFin: "12:30",
            type: "TP",
            cours: cours2._id,
            salle: salle2._id,
        });

        console.log(`${await Seance.countDocuments()} séances créées.`);

        // ─────────────────────────────────────────────────────────
        // 🔟 CRÉATION DES ABSENCES
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des absences...");

        await Absence.create({
            etudiant: etud1._id,
            seance: seance1._id,
            date: new Date("2024-03-04"),
            estJustifiee: false,
            motif: "",
        });

        console.log(`${await Absence.countDocuments()} absence créée.`);

        // ─────────────────────────────────────────────────────────
        // 1️⃣1️⃣ CRÉATION DES DEVOIRS
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des devoirs...");

        await Devoir.create({
            titre: "TP MongoDB — Modélisation",
            cours: cours1._id,
            dateLimite: new Date("2024-03-15"),
            statut: "en_attente",
            etudiant: etud1._id,
        });

        await Devoir.create({
            titre: "Projet Express.js",
            cours: cours2._id,
            dateLimite: new Date("2024-03-20"),
            statut: "en_attente",
            etudiant: etud2._id,
        });

        console.log(`${await Devoir.countDocuments()} devoirs créés.`);

        // ─────────────────────────────────────────────────────────
        // 1️⃣2️⃣ CRÉATION DES CLUBS
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des clubs...");

        const club = await Club.create({
            nom: "Club Informatique",
            description: "Club dédié aux passionnés de la tech et du code.",
            responsable: etud1._id,
            membres: [etud1._id, etud2._id],
        });

        console.log(`${await Club.countDocuments()} club créé.`);

        // ─────────────────────────────────────────────────────────
        // 1️⃣3️⃣ CRÉATION DES ÉVÉNEMENTS
        // ─────────────────────────────────────────────────────────
        console.log("\n Création des événements...");

        await Evenement.create({
            titre: "Hackathon UIT 2024",
            description: "Concours de développement de 24h.",
            details: "Concours de développement de 24h avec prix à la clé.",
            date: new Date("2024-04-10"),
            heure: "09:00",
            lieu: "Salle des conférences — Bâtiment A",
            club: club._id,
            placesDisponibles: 50,
            participants: [etud1._id, etud2._id],
        });

        console.log(`${await Evenement.countDocuments()} événement créé.`);
    } catch (err) {
        console.error("\n Erreur lors du seed :", err.message);
        if (err.code === 11000) {
            console.error(" Erreur de duplication — Les données existent déjà.");
            console.error("   Conseil : Relance le script, il nettoie automatiquement.");
        }
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Connexion MongoDB fermée.");
    }
};

seed();
