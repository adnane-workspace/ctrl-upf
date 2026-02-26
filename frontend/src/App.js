import React, { useState, useEffect } from "react";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfesseurDashboard from "./pages/ProfesseurDashboard";
import EtudiantDashboard from "./pages/EtudiantDashboard";
import { authAPI } from "./api";
import ClubsPage from "./pages/ClubsPage"; // AJOUT

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true); // vérifie le token au démarrage

  // Au démarrage : si un token existe, récupérer le profil automatiquement
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setChecking(false);
      return;
    }
    authAPI.getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token invalide/expiré → nettoyer et afficher le login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const pathname = window.location.pathname; // AJOUT
  if (pathname === "/clubs") { // AJOUT
    return <ClubsPage />; // AJOUT
  } // AJOUT

  // Pendant la vérification du token
  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        background: "var(--bg)",
      }}>
        <div className="spinner" />
        <p style={{ color: "var(--text-m)", fontSize: "0.9rem" }}>Vérification de la session...</p>
      </div>
    );
  }

  // Pas connecté → page de login
  if (!user) return <LoginPage onLogin={handleLogin} />;

  // Connecté → dashboard selon le rôle
  switch (user.role) {
    case "admin":
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    case "professeur":
      return <ProfesseurDashboard user={user} onLogout={handleLogout} />;
    case "etudiant":
      return <EtudiantDashboard user={user} onLogout={handleLogout} />;
    default:
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2>Rôle inconnu : {user.role}</h2>
          <button className="btn btn-danger" onClick={handleLogout}>Déconnexion</button>
        </div>
      );
  }
}