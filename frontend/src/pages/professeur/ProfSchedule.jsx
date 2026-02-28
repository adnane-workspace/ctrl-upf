import React, { useState, useEffect, useCallback } from "react";
import { professeurAPI } from "../../api";

const DAYS = [
    { key: 1, label: "Lundi" },
    { key: 2, label: "Mardi" },
    { key: 3, label: "Mercredi" },
    { key: 4, label: "Jeudi" },
    { key: 5, label: "Vendredi" },
    { key: 6, label: "Samedi" },
];

export default function ProfSchedule() {
    const [seances, setSeances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const fetchSchedule = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // On récupère la semaine pour la date sélectionnée
            const res = await professeurAPI.getSeances("semaine", selectedDate.toISOString());
            setSeances(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur de chargement de l'emploi du temps");
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    // Filtrer les séances par jour (1=Lundi, ..., 6=Samedi)
    const getSeancesForDay = (dayKey) => {
        return seances.filter(s => {
            const date = new Date(s.date);
            let d = date.getDay(); // 0=Dim, 1=Lun...
            if (d === 0) d = 7; // Ajuster Dimanche si besoin
            return d === dayKey;
        }).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut));
    };

    const changeWeek = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (offset * 7));
        setSelectedDate(newDate);
    };

    const formatWeekRange = () => {
        const start = new Date(selectedDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);

        const end = new Date(start);
        end.setDate(start.getDate() + 5);

        return `Semaine du ${start.toLocaleDateString("fr-FR")} au ${end.toLocaleDateString("fr-FR")}`;
    };

    return (
        <div className="prof-page">
            <div className="prof-page-header">
                <div>
                    <h1>📅 Mon Emploi du Temps</h1>
                    <p>Visualisez vos cours, TD et TP de la semaine</p>
                </div>
                <div className="prof-view-tabs" style={{ background: "rgba(255,255,255,0.05)", padding: "4px" }}>
                    <button className="prof-view-tab" onClick={() => changeWeek(-1)}>← Précédente</button>
                    <span style={{ padding: "0 15px", fontSize: "0.85rem", color: "var(--text-m)", display: "flex", alignItems: "center" }}>
                        {formatWeekRange()}
                    </span>
                    <button className="prof-view-tab" onClick={() => setSelectedDate(new Date())}>Aujourd'hui</button>
                    <button className="prof-view-tab" onClick={() => changeWeek(1)}>Suivante →</button>
                </div>
            </div>

            {loading ? (
                <div className="prof-loading">
                    <div className="spinner" />
                    <p>Chargement de l'emploi du temps...</p>
                </div>
            ) : error ? (
                <div className="prof-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchSchedule}>Réessayer</button>
                </div>
            ) : (
                <div className="prof-schedule-grid-container">
                    <div className="prof-schedule-columns">
                        {DAYS.map((day) => {
                            const daySeances = getSeancesForDay(day.key);
                            return (
                                <div key={day.key} className="prof-schedule-column">
                                    <div className="prof-schedule-column-header">
                                        <span className="day-name">{day.label}</span>
                                    </div>
                                    <div className="prof-schedule-column-body">
                                        {daySeances.length > 0 ? (
                                            daySeances.map((s) => (
                                                <div key={s._id} className={`prof-schedule-item-card ${s.type}`}>
                                                    <div className="item-time">
                                                        {s.heureDebut} - {s.heureFin}
                                                    </div>
                                                    <div className="item-title">{s.cours?.nom}</div>
                                                    <div className="item-meta">
                                                        <span>📍 {s.salle?.numero}</span>
                                                        <span>🎓 {s.cours?.semestre}</span>
                                                    </div>
                                                    <div className="item-type-badge">{s.type}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="prof-schedule-empty-day">
                                                Aucun cours
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
