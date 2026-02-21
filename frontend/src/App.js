import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    axios
      .get("/api/test")
      .then((res) => {
        console.log(" Réponse backend :", res.data);
        setMessage(res.data.message);
        setTimestamp(res.data.timestamp);
        setStatus("success");
      })
      .catch((err) => {
        console.error(" Erreur de communication :", err);
        setMessage("Impossible de contacter le serveur.");
        setStatus("error");
      });
  }, []);

  return (
    <div className="app-container">
      <div className="card">
        <h1>Test Communication</h1>

        {status === "loading" && (
          <div className="status loading">
            <span className="spinner"></span>
            <p>Connexion au backend...</p>
          </div>
        )}

        {status === "success" && (
          <div className="status success">
            <p className="message">{message}</p>
            {timestamp && (
              <small className="timestamp">
                Réponse reçue à : {new Date(timestamp).toLocaleTimeString("fr-FR")}
              </small>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="status error">
            <p className="message">{message}</p>
            <small>Vérifiez que le backend est démarré sur le port 5000.</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;