/**
 * 🌱 SCRIPT DE SEED — Crée des données de test dans MongoDB
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

        console.log("\n Création des utilisateurs...");
        const hashAdmin = await bcrypt.hash("admin123", 10);
        const hashProf = await bcrypt.hash("prof123", 10);
        const hashEtud = await bcrypt.hash("etud123", 10);
        const hashPresident = await bcrypt.hash("club123", 10);

        const userAdmin = await User.create({ nom: "Admin", email: "admin@upf.ma", password: hashAdmin, role: "admin" });
        const userProf1 = await User.create({ nom: "Mohammed Alami", email: "prof1@upf.ma", password: hashProf, role: "professeur" });
        const userProf2 = await User.create({ nom: "Fatima Zahrae", email: "prof2@upf.ma", password: hashProf, role: "professeur" });
        const userPresident = await User.create({ nom: "Youssef Club", email: "president@upf.ma", password: hashPresident, role: "president_club" });

        // Étudiants (7 au total)
        const userEtuds = await Promise.all([
            User.create({ nom: "Adnane Elmen", email: "adnaneelmen@upf.ma", password: hashEtud, role: "etudiant" }),
            User.create({ nom: "Kenza Boutarfass", email: "kenza@upf.ma", password: hashEtud, role: "etudiant" }),
            User.create({ nom: "Omar Tahiri", email: "omar@upf.ma", password: hashEtud, role: "etudiant" }),
            User.create({ nom: "Salma Mansour", email: "salma@upf.ma", password: hashEtud, role: "etudiant" }),
            User.create({ nom: "Yassine Bennani", email: "yassine@upf.ma", password: hashEtud, role: "etudiant" }),
            User.create({ nom: "Leila Haddad", email: "leila@upf.ma", password: hashEtud, role: "etudiant" }),
            User.create({ nom: "Amine Touimi", email: "amine@upf.ma", password: hashEtud, role: "etudiant" }),
        ]);

        console.log("Utilisateurs créés.");

        const prof1 = await Professeur.create({ user: userProf1._id, matriculeEmploye: "EMP-001", specialite: "Informatique", bureau: "B204" });
        const prof2 = await Professeur.create({ user: userProf2._id, matriculeEmploye: "EMP-002", specialite: "Mathématiques", bureau: "B310" });

        const dept = await Departement.create({ nom: "Informatique", chefDepartement: prof1._id });

        const etudiants = await Promise.all(userEtuds.map((u, i) =>
            Etudiant.create({
                user: u._id,
                matricule: `ETU-2024-00${i + 1}`,
                filiere: "Génie Informatique",
                anneeEtude: 2
            })
        ));

        const salle1 = await Salle.create({ numero: "A101", capacite: 30, type: "Salle de cours", estDisponible: true });
        const salle2 = await Salle.create({ numero: "LABO-01", capacite: 20, type: "Salle TP", estDisponible: true });

        const cours1 = await Cours.create({ codeModule: "INF301", nom: "Bases de données", credits: 4, semestre: "S3", professeur: prof1._id, departement: dept._id });
        const cours2 = await Cours.create({ codeModule: "INF302", nom: "Développement Web", credits: 3, semestre: "S3", professeur: prof1._id, departement: dept._id });

        // Dates dynamiques : séances dans la semaine courante
        const now = new Date();
        const monday = new Date(now);
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        monday.setDate(now.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const wednesday = new Date(monday);
        wednesday.setDate(monday.getDate() + 2);

        const thursday = new Date(monday);
        thursday.setDate(monday.getDate() + 3);

        // Séances cette semaine
        const seance1 = await Seance.create({ date: monday, heureDebut: "08:30", heureFin: "10:30", type: "Cours", cours: cours1._id, salle: salle1._id });
        const seance2 = await Seance.create({ date: wednesday, heureDebut: "10:30", heureFin: "12:30", type: "TP", cours: cours2._id, salle: salle2._id });
        const seance3 = await Seance.create({ date: thursday, heureDebut: "14:00", heureFin: "16:00", type: "TD", cours: cours1._id, salle: salle1._id });

        // Séances passées (pour les stats "séances effectuées")
        const lastWeekMonday = new Date(monday);
        lastWeekMonday.setDate(monday.getDate() - 7);
        const lastWeekWed = new Date(lastWeekMonday);
        lastWeekWed.setDate(lastWeekMonday.getDate() + 2);
        const seance4 = await Seance.create({ date: lastWeekMonday, heureDebut: "08:30", heureFin: "10:30", type: "Cours", cours: cours1._id, salle: salle2._id });
        const seance5 = await Seance.create({ date: lastWeekWed, heureDebut: "10:30", heureFin: "12:30", type: "TP", cours: cours2._id, salle: salle1._id });

        // Absences sur les séances passées
        await Absence.create({ etudiant: etudiants[0]._id, seance: seance4._id, date: lastWeekMonday, estJustifiee: false, motif: "Maladie" });
        await Absence.create({ etudiant: etudiants[1]._id, seance: seance5._id, date: lastWeekWed, estJustifiee: true, motif: "Raison académique" });

        // Devoirs notés et en attente
        const nextWeek = new Date(monday);
        nextWeek.setDate(monday.getDate() + 14);

        await Promise.all(etudiants.map((e, i) =>
            Devoir.create({
                titre: "TP MongoDB — Modélisation",
                cours: cours1._id,
                dateLimite: nextWeek,
                statut: i < 4 ? "corrige" : "en_attente",
                note: i < 4 ? [14, 16, 11, 18][i] : null,
                commentaire: i < 4 ? ["Bon travail", "Excellent !", "Peut mieux faire", "Parfait"][i] : "",
                etudiant: e._id
            })
        ));

        await Promise.all(etudiants.slice(0, 5).map((e, i) =>
            Devoir.create({
                titre: "Examen Développement Web",
                cours: cours2._id,
                dateLimite: nextWeek,
                statut: i < 3 ? "corrige" : "en_attente",
                note: i < 3 ? [13, 17, 9][i] : null,
                commentaire: i < 3 ? ["Bien", "Très bon", "Insuffisant"][i] : "",
                etudiant: e._id
            })
        ));

        const club = await Club.create({
            nom: "Club Informatique",
            description: "Club dédié aux passionnés de la tech et du code.",
            logo: "/photos/clubs/UIT.png",
            responsable: etudiants[0]._id,
            membres: etudiants.map(e => e._id),
        });

        await Evenement.create({
            titre: "Hackathon UIT 2024",
            description: "Concours de développement de 24h.",
            date: new Date("2024-04-10"),
            heure: "09:00",
            lieu: "Salle des conférences — Bâtiment A",
            image: "photos/events/hack.jpg",
            club: club._id,
            placesDisponibles: 50,
            participants: [etudiants[0]._id, etudiants[1]._id],
        });

        console.log(" Seed terminé avec succès !");
    } catch (err) {
        console.error(" Erreur lors du seed :", err.message);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Connexion MongoDB fermée.");
    }
};

seed();
