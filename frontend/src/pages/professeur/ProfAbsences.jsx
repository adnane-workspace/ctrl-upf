import React, { useState, useEffect, useCallback } from "react";
import { professeurAPI } from "../../api";

const EMPTY_FORM = {
    etudiantId: "", seanceId: "", motif: "", estJustifiee: false,
};

export default function ProfAbsences() {
    const [absences, setAbsences] = useState([]);
    const [cours, setCours] = useState([]);
    const [seances, setSeances] = useState([]);
    const [etudiants, setEtudiants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filterCours, setFilterCours] = useState("");
    const [filterStatut, setFilterStatut] = useState(""); // "justifiee" | "non-justifiee" | ""
    const [search, setSearch] = useState("");

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (filterCours) params.coursId = filterCours;

            const [absRes, coursRes, etudsRes, seancesRes] = await Promise.all([
                professeurAPI.getAbsences(params),
                professeurAPI.getCours(),
                professeurAPI.getEtudiants(),
                professeurAPI.getSeances("semaine", null),
            ]);
            setAbsences(absRes.data.data || []);
            setCours(coursRes.data.data || []);
            setEtudiants(etudsRes.data.data || []);
            setSeances(seancesRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, [filterCours]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Filter display
    const displayed = absences.filter((a) => {
        const nom = a.etudiant?.user?.nom?.toLowerCase() || "";
        const cours = a.seance?.cours?.nom?.toLowerCase() || "";
        const q = search.toLowerCase();
        const matchSearch = !q || nom.includes(q) || cours.includes(q);
        const matchStatut =
            !filterStatut ||
            (filterStatut === "justifiee" && a.estJustifiee) ||
            (filterStatut === "non-justifiee" && !a.estJustifiee);
        return matchSearch && matchStatut;
    });

    const stats = {
        total: absences.length,
        justifiees: absences.filter(a => a.estJustifiee).length,
        nonJustifiees: absences.filter(a => !a.estJustifiee).length,
    };

    const openAdd = () => {
        setEditItem(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            etudiantId: item.etudiant?._id || "",
            seanceId: item.seance?._id || "",
            motif: item.motif || "",
            estJustifiee: item.estJustifiee || false,
        });
        setFormError("");
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.etudiantId || !form.seanceId) {
            setFormError("L'étudiant et la séance sont obligatoires.");
            return;
        }
        try {
            setSaving(true);
            setFormError("");
            if (editItem) {
                await professeurAPI.updateAbsence(editItem._id, {
                    estJustifiee: form.estJustifiee,
                    motif: form.motif,
                });
            } else {
                await professeurAPI.signalerAbsence({
                    etudiantId: form.etudiantId,
                    seanceId: form.seanceId,
                    motif: form.motif,
                    estJustifiee: form.estJustifiee,
                });
            }
            setShowModal(false);
            fetchAll();
        } catch (err) {
            setFormError(err.response?.data?.message || "Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette absence ?")) return;
        try {
            await professeurAPI.supprimerAbsence(id);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur de suppression.");
        }
    };

    const handleToggleJustify = async (item) => {
        try {
            await professeurAPI.updateAbsence(item._id, {
                estJustifiee: !item.estJustifiee,
                motif: item.motif,
            });
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur.");
        }
    };

    const fc = (v) => setForm((f) => ({ ...f, ...v }));

    return (
        <div className="prof-page">
            {/* Header */}
            <div className="prof-page-header">
                <div>
                    <h1>📋 Gestion des absences</h1>
                    <p>Signaler, justifier et suivre les absences de vos étudiants</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Signaler une absence</button>
            </div>

            {/* Mini stats */}
            <div style={{ display: "flex", gap: 14 }}>
                <div className="prof-stat-card" style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <div className="prof-stat-icon purple" style={{ flexShrink: 0 }}>📋</div>
                    <div>
                        <div className="prof-stat-value">{stats.total}</div>
                        <div className="prof-stat-label">Total absences</div>
                    </div>
                </div>
                <div className="prof-stat-card" style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <div className="prof-stat-icon green" style={{ flexShrink: 0 }}>✅</div>
                    <div>
                        <div className="prof-stat-value">{stats.justifiees}</div>
                        <div className="prof-stat-label">Justifiées</div>
                    </div>
                </div>
                <div className="prof-stat-card" style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <div className="prof-stat-icon orange" style={{ flexShrink: 0 }}>⚠️</div>
                    <div>
                        <div className="prof-stat-value">{stats.nonJustifiees}</div>
                        <div className="prof-stat-label">Non justifiées</div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="prof-toolbar">
                <select
                    className="prof-select"
                    value={filterCours}
                    onChange={(e) => setFilterCours(e.target.value)}
                >
                    <option value="">Tous les cours</option>
                    {cours.map((c) => (
                        <option key={c._id} value={c._id}>{c.nom} ({c.codeModule})</option>
                    ))}
                </select>
                <select
                    className="prof-select"
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                >
                    <option value="">Tous les statuts</option>
                    <option value="justifiee">Justifiées</option>
                    <option value="non-justifiee">Non justifiées</option>
                </select>
                <input
                    className="prof-search"
                    placeholder="🔍 Rechercher un étudiant, un cours..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <span style={{ marginLeft: "auto", color: "var(--text-s)", fontSize: "0.82rem" }}>
                    {displayed.length} résultat(s)
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <div className="prof-loading"><div className="spinner" /><p>Chargement...</p></div>
            ) : error ? (
                <div className="prof-error"><span>⚠️</span><p>{error}</p></div>
            ) : (
                <div className="prof-table-card">
                    {displayed.length === 0 ? (
                        <div className="prof-empty">
                            <div className="prof-empty-icon">📭</div>
                            <p>Aucune absence trouvée. Utilisez le bouton &laquo; + Signaler &raquo; pour en ajouter.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Étudiant</th>
                                    <th>Cours</th>
                                    <th>Séance</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Motif</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map((a) => (
                                    <tr key={a._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{a.etudiant?.user?.nom || "—"}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-s)" }}>
                                                {a.etudiant?.matricule}
                                            </div>
                                        </td>
                                        <td>
                                            <div>{a.seance?.cours?.nom || "—"}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-s)" }}>
                                                {a.seance?.cours?.codeModule}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: "0.82rem" }}>
                                                {a.seance?.heureDebut} – {a.seance?.heureFin}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-s)" }}>
                                                {a.seance?.type}
                                            </div>
                                        </td>
                                        <td>
                                            {a.date ? new Date(a.date).toLocaleDateString("fr-FR") : "—"}
                                        </td>
                                        <td>
                                            <span className={`prof-abs-status ${a.estJustifiee ? "justifiee" : "non-justifiee"}`}>
                                                {a.estJustifiee ? "✅ Justifiée" : "⚠️ Non justifiée"}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {a.motif || <span style={{ color: "var(--text-s)" }}>—</span>}
                                        </td>
                                        <td>
                                            <div className="prof-action-btns">
                                                <button
                                                    className="prof-btn-icon edit"
                                                    title={a.estJustifiee ? "Marquer non justifiée" : "Marquer justifiée"}
                                                    onClick={() => handleToggleJustify(a)}
                                                    style={{ fontSize: "0.9rem" }}
                                                >
                                                    {a.estJustifiee ? "❌" : "✅"}
                                                </button>
                                                <button
                                                    className="prof-btn-icon edit"
                                                    onClick={() => openEdit(a)}
                                                    title="Modifier"
                                                >✏️</button>
                                                <button
                                                    className="prof-btn-icon delete"
                                                    onClick={() => handleDelete(a._id)}
                                                    title="Supprimer"
                                                >🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="prof-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="prof-modal">
                        <h3>{editItem ? "✏️ Modifier l'absence" : "➕ Signaler une absence"}</h3>

                        {formError && (
                            <div className="alert alert-error" style={{ marginBottom: 14 }}>{formError}</div>
                        )}

                        {!editItem && (
                            <>
                                <div className="prof-modal-grid">
                                    {/* Étudiant */}
                                    <div className="prof-form-group">
                                        <label>Étudiant *</label>
                                        <select value={form.etudiantId} onChange={(e) => fc({ etudiantId: e.target.value })}>
                                            <option value="">— Choisir —</option>
                                            {etudiants.map((e) => (
                                                <option key={e._id} value={e._id}>{e.user?.nom} ({e.matricule})</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Séance */}
                                    <div className="prof-form-group">
                                        <label>Séance *</label>
                                        <select value={form.seanceId} onChange={(e) => fc({ seanceId: e.target.value })}>
                                            <option value="">— Choisir une séance —</option>
                                            {seances.map((s) => (
                                                <option key={s._id} value={s._id}>
                                                    {s.cours?.nom} — {s.heureDebut}-{s.heureFin} ({new Date(s.date).toLocaleDateString("fr-FR")})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Motif */}
                        <div className="prof-form-group">
                            <label>Motif de l'absence</label>
                            <textarea
                                rows={2}
                                value={form.motif}
                                onChange={(e) => fc({ motif: e.target.value })}
                                placeholder="Maladie, problème personnel, raison académique..."
                            />
                        </div>

                        {/* Justifiée */}
                        <div className="prof-form-group" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <input
                                id="justifiee-check"
                                type="checkbox"
                                checked={form.estJustifiee}
                                onChange={(e) => fc({ estJustifiee: e.target.checked })}
                                style={{ width: 18, height: 18, accentColor: "var(--primary)", cursor: "pointer" }}
                            />
                            <label htmlFor="justifiee-check" style={{ cursor: "pointer", marginBottom: 0 }}>
                                Absence justifiée
                            </label>
                        </div>

                        <div className="prof-modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Enregistrement..." : editItem ? "Mettre à jour" : "Signaler"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
