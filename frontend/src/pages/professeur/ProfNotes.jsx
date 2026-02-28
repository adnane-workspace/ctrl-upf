import React, { useState, useEffect, useCallback } from "react";
import { professeurAPI } from "../../api";

const STATUT_LABELS = {
    corrige: { label: "Corrigé", cls: "corrige" },
    rendu: { label: "Rendu", cls: "rendu" },
    en_attente: { label: "En attente", cls: "en_attente" },
};

function getNoteClass(note) {
    if (note === null || note === undefined || note === "") return "empty";
    const n = parseFloat(note);
    if (n >= 16) return "excellent";
    if (n >= 12) return "bien";
    if (n >= 10) return "passable";
    return "insuffisant";
}

const EMPTY_FORM = {
    titre: "", coursId: "", etudiantId: "", dateLimite: "",
    note: "", commentaire: "", statut: "en_attente",
};

export default function ProfNotes() {
    const [notes, setNotes] = useState([]);
    const [cours, setCours] = useState([]);
    const [etudiants, setEtudiants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filterCours, setFilterCours] = useState("");
    const [search, setSearch] = useState("");

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showBatchModal, setShowBatchModal] = useState(false);

    // Success toast
    const [successMsg, setSuccessMsg] = useState("");

    // Single Entry State
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Batch Entry State
    const [batchCoursId, setBatchCoursId] = useState("");
    const [batchTitre, setBatchTitre] = useState("");
    const [batchDate, setBatchDate] = useState(new Date().toISOString().split("T")[0]);
    const [batchData, setBatchData] = useState([]); // List of { etudiantId, name, note, commentaire }
    const [batchError, setBatchError] = useState("");

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [notesRes, coursRes, etudsRes] = await Promise.all([
                professeurAPI.getNotes(filterCours ? { coursId: filterCours } : {}),
                professeurAPI.getCours(),
                professeurAPI.getEtudiants(),
            ]);
            setNotes(notesRes.data.data || []);
            setCours(coursRes.data.data || []);
            setEtudiants(etudsRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    }, [filterCours]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Update batchData when cours changes in batch modal
    useEffect(() => {
        if (batchCoursId) {
            setBatchData(etudiants.map(e => ({
                etudiantId: e._id,
                name: e.user?.nom || "Étudiant",
                matricule: e.matricule,
                note: "",
                commentaire: ""
            })));
            setBatchError("");
        }
    }, [batchCoursId, etudiants]);

    const displayed = notes.filter((n) => {
        const nom = n.etudiant?.user?.nom?.toLowerCase() || "";
        const titre = n.titre?.toLowerCase() || "";
        const q = search.toLowerCase();
        return (!q || nom.includes(q) || titre.includes(q));
    });

    const openAdd = () => {
        setEditItem(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setShowModal(true);
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3500);
    };

    const closeBatchModal = () => {
        setShowBatchModal(false);
        setBatchCoursId("");
        setBatchTitre("");
        setBatchDate(new Date().toISOString().split("T")[0]);
        setBatchData([]);
        setBatchError("");
    };

    const handleSaveBatch = async () => {
        if (!batchCoursId || !batchTitre) {
            setBatchError("Veuillez sélectionner un cours et un titre pour l'évaluation.");
            return;
        }

        const entries = batchData
            .filter(d => d.note !== "" && d.note !== null && d.note !== undefined)
            .map(d => ({
                etudiantId: d.etudiantId,
                coursId: batchCoursId,
                titre: batchTitre,
                note: parseFloat(d.note),
                commentaire: d.commentaire,
                dateLimite: batchDate
            }));

        if (entries.length === 0) {
            setBatchError("Aucune note saisie. Entrez au moins une note avant d'enregistrer.");
            return;
        }

        try {
            setSaving(true);
            setBatchError("");
            await professeurAPI.batchAjouterNotes({ notes: entries });
            closeBatchModal();
            fetchAll();
            showSuccess(`✅ ${entries.length} note(s) enregistrée(s) avec succès !`);
        } catch (err) {
            setBatchError(err.response?.data?.message || "Erreur lors de la saisie par lot.");
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            titre: item.titre || "",
            coursId: item.cours?._id || "",
            etudiantId: item.etudiant?._id || "",
            dateLimite: item.dateLimite ? item.dateLimite.slice(0, 10) : "",
            note: item.note ?? "",
            commentaire: item.commentaire || "",
            statut: item.statut || "en_attente",
        });
        setFormError("");
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.titre || !form.coursId || !form.etudiantId || !form.dateLimite) {
            setFormError("Veuillez remplir tous les champs obligatoires (*).");
            return;
        }
        try {
            setSaving(true);
            setFormError("");
            const payload = {
                titre: form.titre,
                coursId: form.coursId,
                etudiantId: form.etudiantId,
                dateLimite: form.dateLimite,
                note: form.note !== "" ? parseFloat(form.note) : null,
                commentaire: form.commentaire || "",
                statut: form.note !== "" ? "corrige" : form.statut,
            };
            if (editItem) {
                await professeurAPI.updateNote(editItem._id, payload);
                showSuccess("✅ Note modifiée avec succès !");
            } else {
                await professeurAPI.ajouterNote(payload);
                showSuccess("✅ Note ajoutée avec succès !");
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
        if (!window.confirm("Supprimer cette note/devoir ?")) return;
        try {
            await professeurAPI.supprimerNote(id);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || "Erreur de suppression.");
        }
    };

    const updateBatchItem = (idx, field, val) => {
        const newData = [...batchData];
        newData[idx][field] = val;
        setBatchData(newData);
    };

    const fc = (v) => setForm((f) => ({ ...f, ...v }));

    return (
        <div className="prof-page">
            {/* Toast succès */}
            {successMsg && (
                <div style={{
                    position: "fixed", top: 24, right: 24, zIndex: 9999,
                    background: "var(--success, #22c55e)", color: "#fff",
                    padding: "12px 24px", borderRadius: 10, fontWeight: 600,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    animation: "fadeIn 0.3s ease"
                }}>
                    {successMsg}
                </div>
            )}

            {/* Header */}
            <div className="prof-page-header">
                <div>
                    <h1>📝 Gestion des notes</h1>
                    <p>Saisir par module ou par étudiant les notes académiques</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => setShowBatchModal(true)} style={{ border: "1px solid var(--primary)" }}>
                        📑 Saisie par lot (Module)
                    </button>
                    <button className="btn btn-primary" onClick={openAdd}>
                        + Ajouter une note
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="prof-toolbar">
                <select className="prof-select" value={filterCours} onChange={(e) => setFilterCours(e.target.value)}>
                    <option value="">Tous les cours</option>
                    {cours.map((c) => (
                        <option key={c._id} value={c._id}>{c.nom} ({c.codeModule})</option>
                    ))}
                </select>
                <input className="prof-search" placeholder="🔍 Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <span style={{ marginLeft: "auto", color: "var(--text-s)", fontSize: "0.82rem" }}>
                    {displayed.length} résultat(s)
                </span>
            </div>

            {/* Main Table */}
            {loading ? (
                <div className="prof-loading"><div className="spinner" /><p>Chargement...</p></div>
            ) : error ? (
                <div className="prof-error"><span>⚠️</span><p>{error}</p></div>
            ) : (
                <div className="prof-table-card">
                    {displayed.length === 0 ? (
                        <div className="prof-empty">
                            <div className="prof-empty-icon">📭</div>
                            <p>Aucune note enregistrée. Utilisez les boutons ci-dessus pour en ajouter.</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Étudiant</th>
                                    <th>Évaluation</th>
                                    <th>Cours</th>
                                    <th>Note /20</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map((n) => (
                                    <tr key={n._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{n.etudiant?.user?.nom}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-s)" }}>{n.etudiant?.matricule}</div>
                                        </td>
                                        <td>{n.titre}</td>
                                        <td>{n.cours?.nom}</td>
                                        <td>
                                            <span className={`prof-note-chip ${getNoteClass(n.note)}`}>
                                                {n.note !== null && n.note !== undefined ? `${n.note}/20` : "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`prof-statut ${STATUT_LABELS[n.statut]?.cls || "en_attente"}`}>
                                                {STATUT_LABELS[n.statut]?.label || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="prof-action-btns">
                                                <button className="prof-btn-icon edit" onClick={() => openEdit(n)}>✏️</button>
                                                <button className="prof-btn-icon delete" onClick={() => handleDelete(n._id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* BATCH MODAL */}
            {showBatchModal && (
                <div className="prof-modal-overlay">
                    <div className="prof-modal" style={{ maxWidth: 900, width: "95%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                            <h3>📑 Saisie des notes par module</h3>
                            <button className="prof-btn-icon" onClick={closeBatchModal}>✕</button>
                        </div>

                        {batchError && (
                            <div className="alert alert-error" style={{ marginBottom: 14 }}>{batchError}</div>
                        )}

                        <div className="prof-modal-grid" style={{ marginBottom: 20 }}>
                            <div className="prof-form-group">
                                <label>Sélectionner le Cours *</label>
                                <select value={batchCoursId} onChange={(e) => setBatchCoursId(e.target.value)}>
                                    <option value="">— Choisir —</option>
                                    {cours.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
                                </select>
                            </div>
                            <div className="prof-form-group">
                                <label>Titre de l'évaluation *</label>
                                <input value={batchTitre} onChange={(e) => setBatchTitre(e.target.value)} placeholder="ex: Examen Final S3" />
                            </div>
                            <div className="prof-form-group">
                                <label>Date</label>
                                <input type="date" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} />
                            </div>
                        </div>

                        {batchCoursId && (
                            <div className="prof-table-card" style={{ maxHeight: 400, overflowY: "auto" }}>
                                <table className="batch-table">
                                    <thead>
                                        <tr>
                                            <th>Étudiant / Matricule</th>
                                            <th style={{ width: 100 }}>Note /20</th>
                                            <th>Commentaire</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {batchData.map((d, idx) => (
                                            <tr key={d.etudiantId}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                                                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>{d.matricule}</div>
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        step="0.25" min="0" max="20"
                                                        className="prof-input-small"
                                                        value={d.note}
                                                        onChange={(e) => updateBatchItem(idx, "note", e.target.value)}
                                                        placeholder="—"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        className="prof-input-small"
                                                        value={d.commentaire}
                                                        onChange={(e) => updateBatchItem(idx, "commentaire", e.target.value)}
                                                        placeholder="Observ."
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="prof-modal-footer" style={{ marginTop: 20 }}>
                            <button className="btn btn-ghost" onClick={closeBatchModal}>Annuler</button>
                            <button className="btn btn-primary" onClick={handleSaveBatch} disabled={saving || !batchCoursId || !batchTitre}>
                                {saving ? "Enregistrement..." : `💾 Enregistrer ${batchData.filter(d => d.note !== "" && d.note !== null && d.note !== undefined).length} note(s)`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SINGLE MODAL */}
            {showModal && (
                <div className="prof-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="prof-modal" onClick={e => e.stopPropagation()}>
                        <h3>{editItem ? "✏️ Modifier la note" : "➕ Ajouter une note"}</h3>
                        {formError && (
                            <div className="alert alert-error" style={{ marginBottom: 14 }}>{formError}</div>
                        )}
                        <div className="prof-modal-grid">
                            <div className="prof-form-group">
                                <label>Cours *</label>
                                <select value={form.coursId} onChange={(e) => fc({ coursId: e.target.value })}>
                                    <option value="">— Choisir —</option>
                                    {cours.map(c => <option key={c._id} value={c._id}>{c.nom}</option>)}
                                </select>
                            </div>
                            <div className="prof-form-group">
                                <label>Étudiant *</label>
                                <select value={form.etudiantId} onChange={(e) => fc({ etudiantId: e.target.value })}>
                                    <option value="">— Choisir —</option>
                                    {etudiants.map(e => <option key={e._id} value={e._id}>{e.user?.nom}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="prof-form-group">
                            <label>Titre *</label>
                            <input value={form.titre} onChange={(e) => fc({ titre: e.target.value })} placeholder="ex: Devoir 1, Examen mi-semestre..." />
                        </div>
                        <div className="prof-modal-grid">
                            <div className="prof-form-group">
                                <label>Date *</label>
                                <input type="date" value={form.dateLimite} onChange={(e) => fc({ dateLimite: e.target.value })} />
                            </div>
                            <div className="prof-form-group">
                                <label>Note /20</label>
                                <input type="number" step="0.25" min="0" max="20" value={form.note} onChange={(e) => fc({ note: e.target.value })} placeholder="Ex: 14.5" />
                            </div>
                        </div>
                        <div className="prof-form-group">
                            <label>Commentaire</label>
                            <input value={form.commentaire} onChange={(e) => fc({ commentaire: e.target.value })} placeholder="Observation, appréciation..." />
                        </div>
                        <div className="prof-modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Enregistrement..." : editItem ? "Mettre à jour" : "Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
