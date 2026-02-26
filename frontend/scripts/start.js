// AJOUT - Wrapper de démarrage pour contrôler WDS_ALLOWED_HOSTS
process.env.WDS_ALLOWED_HOSTS = "all"; // AJOUT

// Délègue ensuite au script de démarrage officiel de react-scripts
require("react-scripts/scripts/start"); // AJOUT

