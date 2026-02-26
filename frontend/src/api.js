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
};

export const etudiantAPI = {
    getDashboard: () => API.get("/etudiant/dashboard"),
};

// AJOUT - Clubs & Événements
export const clubsAPI = {
    fetchClubs: () => API.get("/admin/clubs"), // AJOUT
    fetchClubById: (id) => API.get(`/admin/clubs/${id}`), // AJOUT
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
