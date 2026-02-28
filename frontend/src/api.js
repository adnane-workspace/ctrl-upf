import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001/api",
});

// Injecter automatiquement le token JWT dans chaque requête
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Gestion globale des erreurs (ex: token expiré → déconnexion)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (email, password) => API.post("/auth/login", { email, password }),
    getMe: () => API.get("/auth/me"),
};

export const adminAPI = {
    getDashboard: () => API.get("/admin/dashboard"),
    getUsers: () => API.get("/admin/users"),
};

export const professeurAPI = {
    getDashboard: () => API.get("/professeur/dashboard"),
    getCours: () => API.get("/professeur/cours"),
    getSeances: (vue, date) => API.get("/professeur/seances", { params: { vue, date } }),
    getAbsences: (params) => API.get("/professeur/absences", { params }),
    signalerAbsence: (data) => API.post("/professeur/absences", data),
    updateAbsence: (id, data) => API.patch(`/professeur/absences/${id}`, data),
    supprimerAbsence: (id) => API.delete(`/professeur/absences/${id}`),
    getNotes: (params) => API.get("/professeur/notes", { params }),
    ajouterNote: (data) => API.post("/professeur/notes", data),
    batchAjouterNotes: (data) => API.post("/professeur/notes/batch", data),
    updateNote: (id, data) => API.patch(`/professeur/notes/${id}`, data),
    supprimerNote: (id) => API.delete(`/professeur/notes/${id}`),
    getEtudiants: () => API.get("/professeur/etudiants"),
    getEtudiantsParCours: (coursId) => API.get(`/professeur/etudiants-par-cours/${coursId}`),
};

export const etudiantAPI = {
    getDashboard: () => API.get("/etudiant/dashboard"),
};

// AJOUT - Clubs & Événements
export const clubsAPI = {
    fetchClubs: () => API.get("/admin/clubs"), // AJOUT
    fetchClubById: (id) => API.get(`/admin/clubs/${id}`), // AJOUT
    createClub: (formData) => // NOUVEAU
        API.post("/admin/clubs", formData, { // NOUVEAU
            headers: { "Content-Type": "multipart/form-data" }, // NOUVEAU
        }), // NOUVEAU
    updateClub: (id, formData) => // NOUVEAU
        API.put(`/admin/clubs/${id}`, formData, { // NOUVEAU
            headers: { "Content-Type": "multipart/form-data" }, // NOUVEAU
        }), // NOUVEAU
    fetchEvenements: (clubId = null) => { // AJOUT
        const params = {}; // AJOUT
        if (clubId) { // AJOUT
            params.clubId = clubId; // AJOUT
        } // AJOUT
        return API.get("/admin/evenements", { params }); // AJOUT
    }, // AJOUT
    createEvenement: (formData) => // AJOUT
        API.post("/admin/evenements", formData, { // AJOUT
            headers: { "Content-Type": "multipart/form-data" }, // AJOUT
        }), // AJOUT
};

export default API;
