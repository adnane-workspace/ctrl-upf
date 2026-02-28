import React, { useState } from "react";


function StatCard({ icon, value, label, colorClass }) {
    return (
        <div className="prof-stat-card">
            <div className={`prof-stat-icon ${colorClass}`}>{icon}</div>
            <div className="prof-stat-value">{value}</div>
            <div className="prof-stat-label">{label}</div>
        </div>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric"
    });
}

export default function ProfDashboardHome({ data, user }) {
    const [scheduleView, setScheduleView] = useState("aujourd'hui");
    const [notifTab, setNotifTab] = useState("absences");

    if (!data) {
        return (
            <div className="prof-loading">
                <div className="spinner" />
                <p>Chargement...</p>
            </div>
        );
    }

    const { professeur, stats, seancesAujourdhui, seancesSemaine, absencesRecentes } = data;

    const seancesAffichees = scheduleView === "aujourd'hui" ? seancesAujourdhui : seancesSemaine;

    const initials = (professeur?.nom || user?.nom || "P")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="prof-home">
            {/* Profile card */}
            <div className="prof-profile-card">
                <div className="prof-profile-avatar">{initials}</div>
                <div className="prof-profile-info">
                    <h2>Dr. {professeur?.nom || user?.nom}</h2>
                    <div className="prof-profile-meta">
                        <div className="prof-meta-item">
                            <span className="meta-label">Département</span>
                            <span className="meta-value">Faculté de science d'ingénieur</span>
                        </div>
                        <div className="prof-meta-item">
                            <span className="meta-label">Spécialité</span>
                            <span className="meta-value">{professeur?.specialite || "—"}</span>
                        </div>
                        <div className="prof-meta-item">
                            <span className="meta-label">Bureau</span>
                            <span className="meta-value">{professeur?.bureau || "—"}</span>
                        </div>
                        <div className="prof-meta-item">
                            <span className="meta-label">Email</span>
                            <span className="meta-value">{professeur?.email || user?.email}</span>
                        </div>
                    </div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "2.5rem", opacity: 0.12 }}>🎓</div>
            </div>

            {/* Stats */}
            <div className="prof-stats-grid">
                <StatCard icon="📚" value={stats.coursAssignes} label="Cours assignés" colorClass="blue" />
                <StatCard icon="👥" value={stats.etudiantsTotaux} label="Étudiants totaux" colorClass="green" />
                <StatCard icon="✅" value={stats.seancesEffectuees} label="Séances effectuées" colorClass="purple" />
                <StatCard icon="📊" value={`${stats.tauxPresence}%`} label="Taux présence" colorClass="orange" />
                <StatCard icon="🕐" value={stats.seancesRestantes} label="Séances restantes" colorClass="red" />
            </div>

            {/* Bottom grid : schedule + notifications */}
            <div className="prof-bottom-grid">
                {/* Emploi du temps */}
                <div className="prof-schedule-card">
                    <div className="prof-card-header">
                        <span className="prof-card-title">📅 Emploi du temps</span>
                        <div className="prof-view-tabs">
                            <button
                                className={`prof-view-tab ${scheduleView === "aujourd'hui" ? "active" : ""}`}
                                onClick={() => setScheduleView("aujourd'hui")}
                            >Aujourd'hui</button>
                            <button
                                className={`prof-view-tab ${scheduleView === "semaine" ? "active" : ""}`}
                                onClick={() => setScheduleView("semaine")}
                            >Semaine</button>
                        </div>
                    </div>

                    {seancesAffichees && seancesAffichees.length > 0 ? (
                        <div className="prof-seances-list">
                            {seancesAffichees.map((s) => (
                                <div className="prof-seance-item" key={s._id}>
                                    <div className="prof-seance-time">
                                        <span className={`prof-seance-badge ${s.type}`}>{s.type}</span>
                                        <span className="prof-seance-hours">{s.heureDebut}<br />↓<br />{s.heureFin}</span>
                                    </div>
                                    <div className="prof-seance-body">
                                        <div className="prof-seance-name">
                                            {s.cours?.nom || "—"}
                                            <span style={{ color: "var(--text-s)", fontSize: "0.75rem", marginLeft: 8 }}>
                                                {s.cours?.semestre}
                                            </span>
                                        </div>
                                        <div className="prof-seance-meta">
                                            <span>📍 {s.salle?.numero || "—"}</span>
                                            {scheduleView === "semaine" && (
                                                <span>📅 {formatDate(s.date)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="prof-empty-seances">
                            <span>{scheduleView === "aujourd'hui" ? "🌙" : "📭"}</span>
                            <p>Aucune séance {scheduleView === "aujourd'hui" ? "aujourd'hui" : "cette semaine"}</p>
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="prof-notif-card">
                    <div className="prof-card-header">
                        <span className="prof-card-title">
                            🔔 Notifications
                            {absencesRecentes?.length > 0 && (
                                <span className="prof-notif-badge" style={{ marginLeft: 8 }}>
                                    {absencesRecentes.length}
                                </span>
                            )}
                        </span>
                    </div>

                    <div className="prof-notif-tabs">
                        <button
                            className={`prof-notif-tab ${notifTab === "absences" ? "active" : ""}`}
                            onClick={() => setNotifTab("absences")}
                        >Absences</button>
                        <button
                            className={`prof-notif-tab ${notifTab === "cours" ? "active" : ""}`}
                            onClick={() => setNotifTab("cours")}
                        >Cours</button>
                        <button
                            className={`prof-notif-tab ${notifTab === "annonces" ? "active" : ""}`}
                            onClick={() => setNotifTab("annonces")}
                        >Annonces</button>
                    </div>

                    {notifTab === "absences" && (
                        <div className="prof-absence-notif-list">
                            {absencesRecentes?.length > 0 ? (
                                absencesRecentes.map((a) => (
                                    <div
                                        key={a._id}
                                        className={`prof-absence-notif-item ${a.estJustifiee ? "justifiee" : "non-justifiee"}`}
                                    >
                                        <div className="prof-notif-etudiant">
                                            {a.etudiant?.user?.nom?.toUpperCase() || "Étudiant inconnu"}
                                        </div>
                                        <div className="prof-notif-cours">{a.seance?.cours?.nom || "—"}</div>
                                        <div className="prof-notif-footer">
                                            <span className="prof-notif-date">{formatDate(a.date)}</span>
                                            <span className={`prof-notif-status ${a.estJustifiee ? "justifiee" : "non-justifiee"}`}>
                                                {a.estJustifiee ? "Justifiée" : "Non justifiée"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="prof-empty">
                                    <div className="prof-empty-icon">✅</div>
                                    <p>Aucune absence récente</p>
                                </div>
                            )}
                        </div>
                    )}

                    {notifTab === "cours" && (
                        <div className="prof-absence-notif-list">
                            {data.cours?.map((c) => (
                                <div key={c._id} className="prof-absence-notif-item non-justifiee">
                                    <div className="prof-notif-etudiant">{c.nom}</div>
                                    <div className="prof-notif-cours">{c.codeModule} — Sem. {c.semestre}</div>
                                    <div className="prof-notif-footer">
                                        <span className="prof-notif-date">{c.credits} crédit(s)</span>
                                        <span className="prof-notif-status non-justifiee">Actif</span>
                                    </div>
                                </div>
                            ))}
                            {(!data.cours || data.cours.length === 0) && (
                                <div className="prof-empty">
                                    <div className="prof-empty-icon">📚</div>
                                    <p>Aucun cours assigné</p>
                                </div>
                            )}
                        </div>
                    )}

                    {notifTab === "annonces" && (
                        <div className="prof-empty">
                            <div className="prof-empty-icon">📢</div>
                            <p>Aucune annonce</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
