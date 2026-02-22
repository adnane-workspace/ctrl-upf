import React, { useState } from "react";
import { authAPI } from "../api";

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await authAPI.login(email, password);
            const { token, user } = res.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            onLogin(user);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de connexion. Vérifiez vos identifiants.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 60%), var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
        }}>
            <div style={{ width: "100%", maxWidth: "420px" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 64, height: 64,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, var(--primary), var(--primary-l))",
                        fontSize: "1.8rem",
                        marginBottom: 16,
                        boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
                    }}>🎓</div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>CTRL-UPF</h1>
                    <p style={{ color: "var(--text-m)", fontSize: "0.9rem" }}>
                        Plateforme de gestion universitaire
                    </p>
                </div>

                {/* Formulaire */}
                <div className="card" style={{ padding: "32px" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>Connexion</h2>
                    <p style={{ color: "var(--text-m)", fontSize: "0.85rem", marginBottom: 24 }}>
                        Entrez votre email et mot de passe
                    </p>

                    {error && <div className="alert alert-error">⚠ {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Adresse email</label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="vous@upf.ma"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 8 }}
                            disabled={loading}
                        >
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </button>
                    </form>
                </div>

                {/* Aide comptes de test */}
                <div className="card" style={{ marginTop: 16, padding: "16px 20px" }}>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-m)", marginBottom: 10, fontWeight: 600 }}>
                        COMPTES DE TEST
                    </p>
                    {[
                        { role: "Admin", email: "admin@upf.ma", pwd: "admin123", cls: "badge-admin" },
                        { role: "Professeur", email: "prof1@upf.ma", pwd: "prof123", cls: "badge-professeur" },
                        { role: "Étudiant", email: "adnaneelmen@upf.ma", pwd: "etud123", cls: "badge-etudiant" },
                    ].map((c) => (
                        <div
                            key={c.email}
                            onClick={() => { setEmail(c.email); setPassword(c.pwd); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10, marginBottom: 8,
                                cursor: "pointer", padding: "6px 8px", borderRadius: 8,
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <span className={`badge ${c.cls}`}>{c.role}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-m)" }}>{c.email}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-s)", marginLeft: "auto" }}>{c.pwd}</span>
                        </div>
                    ))}
                    <p style={{ fontSize: "0.75rem", color: "var(--text-s)", marginTop: 6 }}>
                        ↑ Cliquez pour remplir automatiquement
                    </p>
                </div>
            </div>
        </div>
    );
}
