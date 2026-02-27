const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── CRÉER LES DOSSIERS S'ILS N'EXISTENT PAS ─────────────────
const uploadsDir = path.join(__dirname, "..", "uploads");
const clubsDir = path.join(uploadsDir, "clubs");
const eventsDir = path.join(uploadsDir, "events");

[uploadsDir, clubsDir, eventsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ─── CONFIGURATION DU STOCKAGE ────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Détermine le dossier selon le type d'upload
    let uploadPath = uploadsDir;
    
    if (req.path.includes("clubs")) {
      uploadPath = clubsDir;
    } else if (req.path.includes("evenements")) {
      uploadPath = eventsDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Crée un nom de fichier unique avec timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// ─── FILTRE DES FICHIERS (IMAGES UNIQUEMENT) ──────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images (JPEG, PNG, GIF, WEBP) sont acceptées"), false);
  }
};

// ─── CRÉER LES UPLOAD INSTANCES ────────────────────────────────
const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = {
  uploadLogo,
  uploadPhoto,
};
