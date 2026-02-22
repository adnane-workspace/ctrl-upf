import React from "react";

export default function EtudiantDashboard({ user, onLogout }) {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "2rem",
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#333"
        }}>
            <div>Vous êtes étudiant</div>
            <button
                onClick={onLogout}
                style={{
                    padding: "10px 20px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background-color 0.3s"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
            >
                🚪 Déconnexion
            </button>
        </div>
    );
}
