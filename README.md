# 📚 CTRL-UPF - Système de Gestion Académique

Plateforme de gestion académique pour l'Université Privée Fès (UPF) avec authentification JWT et dashboards simplifiés.

---

## 📁 Structure du Projet

```
ctrl-upf/
├── backend/                 # API Express + MongoDB
│   ├── controllers/         # Logique métier
│   ├── models/             # Schémas MongoDB
│   ├── routes/             # Définition des routes API
│   ├── middleware/         # JWT, authentification
│   ├── .env.example        # Variables d'environnement (template)
│   ├── .env                # Variables d'environnement (local)
│   ├── server.js           # Point d'entrée du serveur
│   ├── package.json        # Dépendances Node
│   └── seed.js             # Script pour remplir la BD de test
│
├── frontend/               # React App
│   ├── src/
│   │   ├── pages/         # Pages (Login, Dashboards)
│   │   ├── api.js         # Configuration Axios
│   │   ├── App.js         # Composant racine
│   │   └── index.js       # Point d'entrée
│   ├── public/            # Fichiers statiques (icons, manifest)
│   ├── .env.example       # Variables d'environnement (template)
│   ├── package.json       # Dépendances React
│   └── package-lock.json
│
└── README.md              # Ce fichier
```

---

## 🚀 Installation et Configuration

### Prérequis

- **Node.js** ≥ 14.0
- **MongoDB** (local ou Atlas)
- **npm** ou **yarn**

### 1️⃣ Configuration du Backend

```bash
cd backend

# Copier le fichier template
cp .env.example .env

# Installer les dépendances
npm install

# Démarrer le serveur
npm run dev        # Avec nodemon (développement)
npm start          # Production
```

**Variables d'environnement requises** (dans `.env`) :

```dotenv
# Base de données
MONGO_URI=mongodb://localhost:27017/ctrl_upf

# Serveur
PORT=5001
NODE_ENV=development

# Authentification JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### 2️⃣ Configuration du Frontend

```bash
cd frontend

# Copier le fichier template (optionnel)
cp .env.example .env.local

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start          # http://localhost:3000

# Créer une version production
npm run build
```

**Variables d'environnement** (optionnelles, dans `.env.local`) :

```dotenv
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_ENV=development
```

---

## 🧪 Données de Test

Pour remplir la base de données avec des données de test :

```bash
cd backend
node seed.js
```

**Comptes de test créés** :

- **Admin**: `admin@upf.ma` / `admin123`
- **Professeur**: `prof1@upf.ma` / `prof123`
- **Étudiant**: `adnaneelmen@upf.ma` / `etud123`

---

## 📡 Architecture de l'API

### Authentification

```
POST /api/auth/login
- Body: { email, password }
- Response: { token, user: { id, nom, email, role } }

GET /api/auth/me (protégé)
- Headers: Authorization: Bearer <token>
- Response: { user: { id, nom, email, role } }
```

### Dashboards (simples)

```
GET /api/admin/dashboard (protégé, rôle: admin)
- Response: { success: true, message: "Bienvenue Admin" }

GET /api/professeur/dashboard (protégé, rôle: professeur)
- Response: { success: true, message: "Bienvenue Professeur" }

GET /api/etudiant/dashboard (protégé, rôle: etudiant)
- Response: { success: true, message: "Bienvenue Étudiant" }
```

---

## 🔐 Authentification JWT

L'API utilise des **JSON Web Tokens** pour sécuriser les routes.

### Flux d'authentification

1. Utilisateur se connecte avec email/password
2. Serveur retourne un token JWT
3. Token stocké dans `localStorage` (frontend)
4. Token envoyé dans le header `Authorization: Bearer <token>` pour chaque requête
5. Middleware `protect` valide le token
6. Middleware `authorize` vérifie le rôle utilisateur

### Rôles disponibles

- `admin` - Administrateur de la plateforme
- `professeur` - Enseignant
- `etudiant` - Étudiant

---

## 📦 Dépendances Principales

### Backend

- **express** - Framework web
- **mongoose** - ODM MongoDB
- **jsonwebtoken** - Gestion JWT
- **bcryptjs** - Hachage de mots de passe
- **cors** - Middle-end CORS
- **dotenv** - Variables d'environnement

### Frontend

- **react** - Framework UI
- **axios** - Client HTTP
- **react-router-dom** - Routage

---

## 🔄 Démarrage Rapide

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

L'application ouvrira automatiquement à http://localhost:3000

---

## 📝 Pages Disponibles

- **Login** (`/login`) - Connexion utilisateur
- **Admin Dashboard** (`/admin`) - Page de bienvenue admin
- **Professeur Dashboard** (`/professeur`) - Page de bienvenue professeur
- **Étudiant Dashboard** (`/etudiant`) - Page de bienvenue étudiant

---

## 🛠️ Scripts Disponibles

### Backend

```bash
npm start      # Démarrer en production
npm run dev    # Démarrer avec nodemon
node seed.js   # Remplir la BD de test
```

### Frontend

```bash
npm start      # Serveur de développement
npm test       # Lancer les tests
npm run build  # Créer une version production
npm run eject  # Éjecter du create-react-app
```

---

## 🐛 Troubleshooting

### Erreur MongoDB

```
MongoDBClient is not defined
```

→ Vérifiez que MongoDB est en cours d'exécution : `mongod`

### Erreur CORS

```
Access to XMLHttpRequest blocked by CORS
```

→ Vérifiez que le backend est en cours d'exécution sur le port 5001

### Erreur manifest.json 404

→ Le fichier `public/manifest.json` doit exister (créé automatiquement)

---

## 📄 Fichiers Importants

- `.env.example` - Template des variables d'environnement
- `seed.js` - Script de génération de données
- `package.json` - Dépendances et scripts
- `server.js` (backend) - Point d'entrée du serveur

---

## 👨‍💻 Développement

### Conventions de Code

- **Variables d'environnement** - Préfixe `REACT_APP_` (frontend)
- **Nommage** - camelCase pour les variables, PascalCase pour les composants
- **Dossiers** - Controllers, models, routes, middleware (backend)
- **Requêtes API** - Axios avec intercepteurs (frontend)

### ESLint & Prettier (optionnel)

```bash
npm install --save-dev eslint prettier
```

---

## 📞 Support

Pour toute question ou problème, consultez la documentation de :

- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [MongoDB](https://docs.mongodb.com/)
- [JWT](https://jwt.io/)

---

**Version**: 1.0.0  
**Dernière mise à jour**: Février 2026
