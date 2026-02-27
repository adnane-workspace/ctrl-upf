import React, { useEffect, useMemo, useState } from "react"; // AJOUT
import { clubsAPI } from "../api"; // AJOUT

const containerStyle = { // AJOUT
  minHeight: "100vh",
  backgroundColor: "#f5f5f7",
  padding: "24px 40px",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}; // AJOUT

const sectionCardStyle = { // AJOUT
  backgroundColor: "#ffffff",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  marginBottom: 24,
}; // AJOUT

const buttonPrimaryStyle = { // AJOUT
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  backgroundColor: "#111827",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
}; // AJOUT

const inputStyle = { // AJOUT
  width: "100%",
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  fontSize: 14,
  outline: "none",
}; // AJOUT

const chipButtonStyle = (active) => ({ // AJOUT
  padding: "6px 14px",
  borderRadius: 999,
  border: active ? "1px solid #111827" : "1px solid #e5e7eb",
  backgroundColor: active ? "#111827" : "#ffffff",
  color: active ? "#ffffff" : "#111827",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
}); // AJOUT

const modalBackdropStyle = { // AJOUT
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 40,
}; // AJOUT

const modalCardStyle = { // AJOUT
  width: "100%",
  maxWidth: 560,
  background: "#ffffff",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.25)",
}; // AJOUT

const errorTextStyle = { // AJOUT
  color: "#b91c1c",
  fontSize: 12,
  marginTop: 4,
}; // AJOUT

export default function ClubsPage() { // AJOUT
  const [clubs, setClubs] = useState([]); // AJOUT
  const [events, setEvents] = useState([]); // AJOUT
  const [filteredEvents, setFilteredEvents] = useState([]); // AJOUT
  const [selectedClubId, setSelectedClubId] = useState(null); // AJOUT
  const [searchTerm, setSearchTerm] = useState(""); // AJOUT
  const [loading, setLoading] = useState(true); // AJOUT
  const [error, setError] = useState(null); // AJOUT

  const [isModalOpen, setIsModalOpen] = useState(false); // AJOUT
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null); // AJOUT
  const [form, setForm] = useState({ // AJOUT
    titre: "",
    clubId: "",
    date: "",
    heure: "",
    lieu: "",
   details: "",
    photoFile: null,
  }); // AJOUT
  const [formErrors, setFormErrors] = useState({}); // AJOUT
  const [previewUrl, setPreviewUrl] = useState(null); // AJOUT
  const [submitting, setSubmitting] = useState(false); // AJOUT

  useEffect(() => { // AJOUT
    let isMounted = true;
    const loadInitial = async () => {
      try {
        setLoading(true);
        const [clubsRes, eventsRes] = await Promise.all([
          clubsAPI.fetchClubs(),
          clubsAPI.fetchEvenements(),
        ]);
        if (!isMounted) return;
        setClubs(clubsRes.data.clubs || []);
        const evts = eventsRes.data.evenements || [];
        setEvents(evts);
        setFilteredEvents(evts);
      } catch (err) {
        if (!isMounted) return;
        setError("Impossible de charger les clubs et événements.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => { // AJOUT
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredEvents(events);
      return;
    }
    setFilteredEvents(
      events.filter((evt) =>
        (evt.titre || "").toLowerCase().includes(term)
      )
    );
  }, [events, searchTerm]);

  const handleSelectClub = async (clubId) => { // AJOUT
    try {
      setSelectedClubId(clubId);
      setLoading(true);
      const res = await clubsAPI.fetchEvenements(clubId);
      const evts = res.data.evenements || [];
      setEvents(evts);
      setFilteredEvents(
        evts.filter((evt) =>
          (evt.titre || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
        )
      );
    } catch (err) {
      setError("Impossible de charger les événements du club sélectionné.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = async () => { // AJOUT
    try {
      setSelectedClubId(null);
      setLoading(true);
      const res = await clubsAPI.fetchEvenements();
      const evts = res.data.evenements || [];
      setEvents(evts);
      setFilteredEvents(
        evts.filter((evt) =>
          (evt.titre || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
        )
      );
    } catch (err) {
      setError("Impossible de recharger les événements.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => { // AJOUT
    setForm({
      titre: "",
      clubId: selectedClubId || "",
      date: "",
      heure: "",
      lieu: "",
      details: "",
      photoFile: null,
    });
    setFormErrors({});
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { // AJOUT
    setIsModalOpen(false);
  };

  const handleFormChange = (e) => { // AJOUT
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files && files[0];
      setForm((prev) => ({ ...prev, photoFile: file || null }));
      setFormErrors((prev) => ({ ...prev, photoFile: undefined }));
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => { // AJOUT
    const errors = {};
    if (!form.titre.trim()) errors.titre = "Le titre est obligatoire";
    if (!form.clubId) errors.clubId = "Le club est obligatoire";
    if (!form.date) errors.date = "La date est obligatoire";
    if (!form.heure) errors.heure = "L'heure est obligatoire";
    if (!form.lieu.trim()) errors.lieu = "Le lieu est obligatoire";
    if (!form.details.trim()) errors.details = "Les détails sont obligatoires";
    if (!form.photoFile) errors.photoFile = "La photo est obligatoire";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => { // AJOUT
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("titre", form.titre);
      formData.append("clubId", form.clubId);
      formData.append("date", form.date);
      formData.append("heure", form.heure);
      formData.append("lieu", form.lieu);
      formData.append("details", form.details);
      if (form.photoFile) {
        formData.append("photo", form.photoFile);
      }

      await clubsAPI.createEvenement(formData);

      const res = await clubsAPI.fetchEvenements(selectedClubId);
      const evts = res.data.evenements || [];
      setEvents(evts);
      setFilteredEvents(
        evts.filter((evt) =>
          (evt.titre || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
        )
      );

      setIsModalOpen(false);
    } catch (err) {
      setError("Erreur lors de la création de l'événement.");
    } finally {
      setSubmitting(false);
    }
  };

  const eventsGrid = useMemo( // AJOUT
    () =>
      filteredEvents.map((evt) => {
        const clubName =
          evt.club && typeof evt.club === "object"
            ? evt.club.nom
            : (clubs.find((c) => c._id === evt.club)?.nom || "");
        return { ...evt, _clubName: clubName };
      }),
    [filteredEvents, clubs]
  );

  return ( // AJOUT
    <div style={containerStyle}>
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#111827",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            UPF
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              Clubs & Événements
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Vie étudiante & activités
            </div>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 520 }}>
          <input
            type="text"
            placeholder="Rechercher des événements, des ateliers, des activités..."
            style={inputStyle}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <button style={buttonPrimaryStyle} onClick={handleOpenModal}>
            <span style={{ fontSize: 18 }}>+</span>
            <span>List Event</span>
          </button>
        </div>
      </header>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 12,
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* SECTION CLUBS */}
      <section style={sectionCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Parcourir les clubs UPF
            </h2>
            <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: "#6b7280" }}>
              Découvrez les clubs, associations et communautés de l&apos;UPF.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilter}
            style={chipButtonStyle(selectedClubId === null)}
          >
            Tous
          </button>
        </div>

        {loading && clubs.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>Chargement des clubs...</p>
        ) : clubs.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            Aucun club n&apos;est encore enregistré.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 16,
            }}
          >
            {clubs.map((club) => (
              <button
                key={club._id}
                type="button"
                onClick={() => handleSelectClub(club._id)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 16,
                  border:
                    selectedClubId === club._id
                      ? "1px solid #111827"
                      : "1px solid #e5e7eb",
                  backgroundColor:
                    selectedClubId === club._id ? "#111827" : "#ffffff",
                  color: selectedClubId === club._id ? "#f9fafb" : "#111827",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  cursor: "pointer",
                  boxShadow:
                    selectedClubId === club._id
                      ? "0 10px 25px rgba(15, 23, 42, 0.25)"
                      : "0 4px 12px rgba(15, 23, 42, 0.06)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f9fafb",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {club.logo ? (
                    <img
                      src={club.logo}
                      alt={club.nom}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    (club.nom || "?")
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                  )}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {club.nom}
                </div>
                <div style={{ fontSize: 12, color: selectedClubId === club._id ? "#e5e7eb" : "#6b7280" }}>
                  {(club.eventsCount ?? 0) || 0} events
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* SECTION AGENDA */}
      <section style={sectionCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Agenda des Clubs & Événements
            </h2>
            <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: "#6b7280" }}>
              Restez informé des ateliers, conférences et activités à venir.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilter}
            style={{
              background: "transparent",
              border: "none",
              color: "#4b5563",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            View All &rarr;
          </button>
        </div>

        {loading && events.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>Chargement de l&apos;agenda...</p>
        ) : eventsGrid.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280" }}>
            Aucun événement ne correspond à la recherche ou au filtre.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {eventsGrid.map((evt) => (
              <div
                key={evt._id}
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  background: "#ffffff",
                  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ height: 160, background: "#111827" }}>
                  {evt.image ? (
                    <img
                      src={evt.image}
                      alt={evt.titre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : evt.photo ? (
                    <img
                      src={evt.photo}
                      alt={evt.titre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: 12,
                        background:
                          "linear-gradient(135deg, #111827 0%, #374151 50%, #111827 100%)",
                      }}
                    >
                      Aucune image
                    </div>
                  )}
                </div>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#4b5563",
                      textTransform: "uppercase",
                      letterSpacing: 0.08,
                    }}
                  >
                    {evt._clubName || "Club UPF"}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#111827",
                      lineHeight: 1.3,
                    }}
                  >
                    {evt.titre}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                      <span style={{ fontWeight: 600 }}>Date</span>
                      <span>
                        {evt.date
                          ? new Date(evt.date).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                      <span style={{ fontWeight: 600 }}>Heure</span>
                      <span>{evt.heure || "-"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                      <span style={{ fontWeight: 600 }}>Lieu</span>
                      <span>{evt.lieu || "-"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                      <span style={{ fontWeight: 600 }}>Intéressés</span>
                      <span>{evt.interesses ?? 0}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedEventForDetails(evt)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "1px solid #111827",
                        background: "#ffffff",
                        color: "#111827",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View Details
                    </button>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      {evt.details || ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL CRÉATION ÉVÉNEMENT */}
      {isModalOpen && (
        <div style={modalBackdropStyle}>
          <div style={modalCardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Publier un nouvel événement
                </h3>
                <p
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  Renseignez les informations de l&apos;événement à mettre en avant.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  borderRadius: 999,
                  border: "none",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: "#f3f4f6",
                  color: "#111827",
                  fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    Titre de l&apos;événement
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={form.titre}
                    onChange={handleFormChange}
                    style={{
                      marginTop: 4,
                      width: "100%",
                      padding: "9px 10px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      fontSize: 14,
                    }}
                  />
                  {formErrors.titre && <div style={errorTextStyle}>{formErrors.titre}</div>}
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    Club
                  </label>
                  <select
                    name="clubId"
                    value={form.clubId}
                    onChange={handleFormChange}
                    style={{
                      marginTop: 4,
                      width: "100%",
                      padding: "9px 10px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      fontSize: 14,
                      background: "#ffffff",
                    }}
                  >
                    <option value="">Sélectionner un club</option>
                    {clubs.map((club) => (
                      <option key={club._id} value={club._id}>
                        {club.nom}
                      </option>
                    ))}
                  </select>
                  {formErrors.clubId && <div style={errorTextStyle}>{formErrors.clubId}</div>}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                      style={{
                        marginTop: 4,
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        fontSize: 14,
                      }}
                    />
                    {formErrors.date && <div style={errorTextStyle}>{formErrors.date}</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                      Heure
                    </label>
                    <input
                      type="time"
                      name="heure"
                      value={form.heure}
                      onChange={handleFormChange}
                      style={{
                        marginTop: 4,
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        fontSize: 14,
                      }}
                    />
                    {formErrors.heure && <div style={errorTextStyle}>{formErrors.heure}</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                      Lieu
                    </label>
                    <input
                      type="text"
                      name="lieu"
                      value={form.lieu}
                      onChange={handleFormChange}
                      style={{
                        marginTop: 4,
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        fontSize: 14,
                      }}
                    />
                    {formErrors.lieu && <div style={errorTextStyle}>{formErrors.lieu}</div>}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    Détails / Description
                  </label>
                  <textarea
                    name="details"
                    value={form.details}
                    onChange={handleFormChange}
                    rows={3}
                    style={{
                      marginTop: 4,
                      width: "100%",
                      padding: "9px 10px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      fontSize: 14,
                      resize: "vertical",
                    }}
                  />
                  {formErrors.details && <div style={errorTextStyle}>{formErrors.details}</div>}
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                    Photo de l&apos;événement
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFormChange}
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                    }}
                  />
                  {formErrors.photoFile && (
                    <div style={errorTextStyle}>{formErrors.photoFile}</div>
                  )}
                  {previewUrl && (
                    <div
                      style={{
                        marginTop: 8,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="Prévisualisation"
                        style={{ width: "100%", maxHeight: 220, objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonPrimaryStyle,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? "default" : "pointer",
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Publication..." : "Publier l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS ÉVÉNEMENT */}
      {selectedEventForDetails && (
        <div
          style={modalBackdropStyle}
          onClick={() => setSelectedEventForDetails(null)}
        >
          <div
            style={modalCardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fermer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Détails de l'événement
              </h2>
              <button
                type="button"
                onClick={() => setSelectedEventForDetails(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Image */}
            {(selectedEventForDetails.image || selectedEventForDetails.photo) && (
              <div
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  overflow: "hidden",
                  maxHeight: 280,
                }}
              >
                <img
                  src={selectedEventForDetails.image || selectedEventForDetails.photo}
                  alt={selectedEventForDetails.titre}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            {/* Titre */}
            <div style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                {selectedEventForDetails.titre}
              </h3>
            </div>

            {/* Club */}
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                Club organisateur :
              </span>
              <span style={{ fontSize: 13, color: "#111827", marginLeft: 6 }}>
                {selectedEventForDetails.club && typeof selectedEventForDetails.club === "object"
                  ? selectedEventForDetails.club.nom
                  : selectedEventForDetails.club || "Clubs UPF"}
              </span>
            </div>

            {/* Date et Heure */}
            <div style={{ marginBottom: 8, display: "flex", gap: 24 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                  Date :
                </span>
                <span style={{ fontSize: 13, color: "#111827", marginLeft: 6 }}>
                  {selectedEventForDetails.date
                    ? new Date(selectedEventForDetails.date).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                  Heure :
                </span>
                <span style={{ fontSize: 13, color: "#111827", marginLeft: 6 }}>
                  {selectedEventForDetails.heure || "-"}
                </span>
              </div>
            </div>

            {/* Lieu */}
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                Lieu :
              </span>
              <span style={{ fontSize: 13, color: "#111827", marginLeft: 6 }}>
                {selectedEventForDetails.lieu || "-"}
              </span>
            </div>

            {/* Intéressés */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
                Nombre d'intéressés :
              </span>
              <span style={{ fontSize: 13, color: "#111827", marginLeft: 6 }}>
                {selectedEventForDetails.interesses ?? 0}
              </span>
            </div>

            {/* Description */}
            {selectedEventForDetails.description && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Description
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#111827", lineHeight: 1.5 }}>
                  {selectedEventForDetails.description}
                </p>
              </div>
            )}

            {/* Détails */}
            {selectedEventForDetails.details && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
                  Détails
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#111827", lineHeight: 1.5 }}>
                  {selectedEventForDetails.details}
                </p>
              </div>
            )}

            {/* Boutons */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                style={buttonPrimaryStyle}
              >
                Je suis intéressé
              </button>
              <button
                type="button"
                onClick={() => setSelectedEventForDetails(null)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#111827",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

