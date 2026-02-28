import React, { useState, useEffect, useCallback } from "react";
import { professeurAPI } from "../api";
import ProfDashboardHome from "./professeur/ProfDashboardHome";
import ProfNotes from "./professeur/ProfNotes";
import ProfAbsences from "./professeur/ProfAbsences";
import ProfSchedule from "./professeur/ProfSchedule";
import "./professeur/ProfDashboard.css";

const NAV_ITEMS = [
    { key: "home", icon: "🏠", label: "Tableau de bord" },
    { key: "schedule", icon: "📅", label: "Emploi du temps" },
    { key: "notes", icon: "📝", label: "Gestion des notes" },
    { key: "absences", icon: "📋", label: "Gestion des absences" },
];

export default function ProfesseurDashboard({ user, onLogout }) {
    const [activePage, setActivePage] = useState("home");
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await professeurAPI.getDashboard();
            setDashboardData(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const renderPage = () => {
        if (loading && activePage === "home") {
            return (
                <div className="prof-loading">
                    <div className="spinner" />
                    <p>Chargement du tableau de bord...</p>
                </div>
            );
        }
        if (error && activePage === "home") {
            return (
                <div className="prof-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchDashboard}>Réessayer</button>
                </div>
            );
        }
        switch (activePage) {
            case "home": return <ProfDashboardHome data={dashboardData} user={user} />;
            case "schedule": return <ProfSchedule />;
            case "notes": return <ProfNotes />;
            case "absences": return <ProfAbsences />;
            default: return <ProfDashboardHome data={dashboardData} user={user} />;
        }
    };

    const initials = (user?.nom || "P")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="prof-layout">
            {/* ── SIDEBAR ──────────────────────────────── */}
            <aside className="prof-sidebar">
                <div className="prof-sidebar-logo">
                    <span className="prof-logo-ctrl">CTRL</span>
                    <span className="prof-logo-upf">·UPF</span>
                </div>

                <div className="prof-sidebar-role-badge">
                    <span>👨‍🏫</span> Espace Professeur
                </div>

                <nav className="prof-sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            className={`prof-nav-item ${activePage === item.key ? "active" : ""}`}
                            onClick={() => setActivePage(item.key)}
                        >
                            <span className="prof-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                            {activePage === item.key && <span className="prof-nav-indicator" />}
                        </button>
                    ))}
                </nav>

                <div className="prof-sidebar-footer">
                    <div className="prof-user-info">
                        <div className="prof-avatar">{initials}</div>
                        <div className="prof-user-details">
                            <span className="prof-user-name">{user?.nom || "Professeur"}</span>
                            <span className="prof-user-email">{user?.email || ""}</span>
                        </div>
                    </div>
                    <button className="prof-logout-btn" onClick={onLogout}>
                        <span>🚪</span> Déconnexion
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────── */}
            <main className="prof-main">
                {/* Top bar */}
                <header className="prof-topbar">
                    <div className="prof-topbar-left">
                        <h2 className="prof-topbar-title">
                            {NAV_ITEMS.find(n => n.key === activePage)?.icon}{" "}
                            {NAV_ITEMS.find(n => n.key === activePage)?.label}
                        </h2>
                    </div>
                    <div className="prof-topbar-right">
                        <span className="prof-date-badge">
                            📅 {new Date().toLocaleDateString("fr-FR", {
                                weekday: "long", day: "numeric", month: "long", year: "numeric"
                            })}
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <div className="prof-content">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}
