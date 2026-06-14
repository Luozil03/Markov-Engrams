import { useState } from "react";
import { Link } from "react-router-dom";
import { trainModel } from "../api.js";

function TrainPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [text, setText] = useState("");
    const [order, setOrder] = useState(1);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Form Wikipedia 
    const [wikiTitle, setWikiTitle] = useState("");
    const [wikiLoading, setWikiLoading] = useState(false);

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".txt")) {
            setError("Devi caricare un file .txt!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setText(event.target.result);
            setError(null);
        };
        reader.readAsText(file);
    }

    // Scarica pagina Wikipedia
    async function handleWikiFetch() {
        if (!wikiTitle.trim()) {
            setError("Inserisci il titolo di una pagina Wikipedia.");
            return;
        }

        setWikiLoading(true);
        setError(null);

        try {
            const url = `https://it.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&titles=${encodeURIComponent(wikiTitle)}&origin=*`;
            const response = await fetch(url);
            const data = await response.json();
            
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];

            if (pageId === "-1") {
                setError("Pagina Wikipedia non trovata. Prova un altro titolo.");
            } else {
                setText(pages[pageId].extract);
                // Suggerimento automatico nome modello
                if (!name) setName(`Wikipedia: ${pages[pageId].title}`);
                if (!description) setDescription(`Modello generato dalla pagina Wikipedia di ${pages[pageId].title}`);
            }
        } catch (err) {
            setError("Errore durante il download da Wikipedia.");
        } finally {
            setWikiLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const data = await trainModel({ name, description, text, order });

            if (data.success) {
                setResult(data.model);
                setName("");
                setDescription("");
                setText("");
                setOrder(1);
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.error(err);
            setError("Errore di connessione al server... è acceso?");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1>Addestra Modello</h1>
                <p className="page-subtitle">Incolla un testo, carica un file .txt, oppure usa Wikipedia per generare l'engramma.</p>
            </div>

            <form onSubmit={handleSubmit} className="train-form">
                <div className="form-group">
                    <label>Nome del modello *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Descrizione</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Ordine della catena (1-3)</label>
                    <select value={order} onChange={(e) => setOrder(Number(e.target.value))}>
                        <option value={1}>1 - Testi più casuali (Bigrammi)</option>
                        <option value={2}>2 - Testi più sensati (Trigrammi)</option>
                        <option value={3}>3 - Molto fedele al testo</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Testo sorgente *</label>
                    
                    {/* File o Wikipedia */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: "0.5rem", padding: "1rem", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                        
                        <div className="file-upload" style={{ margin: 0 }}>
                            <input type="file" accept=".txt" onChange={handleFileUpload} />
                        </div>
                        
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>oppure</span>
                        
                        <div style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: "250px" }}>
                            <input 
                                type="text" 
                                placeholder="Es: Gatto, Roma, Linux..." 
                                value={wikiTitle} 
                                onChange={(e) => setWikiTitle(e.target.value)} 
                                style={{ flex: 1, padding: "0.5rem" }}
                            />
                            <button type="button" className="btn btn-secondary" onClick={handleWikiFetch} disabled={wikiLoading} style={{ padding: "0.5rem 1rem" }}>
                                {wikiLoading ? "Caricamento..." : "Scarica da Wiki"}
                            </button>
                        </div>
                    </div>

                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} required placeholder="Il testo apparirà qui..." />
                    <span className="char-count">
                        {text.split(/\s+/).filter(Boolean).length} parole contate
                    </span>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? "Addestramento in corso..." : "Avvia Addestramento"}
                </button>
            </form>

            {error && (
                <div className="message message-error">
                    <strong>Errore:</strong> {error}
                </div>
            )}

            {result && (
                <div className="message message-success">
                    <h3>Modello salvato!</h3>
                    <p>ID: {result._id}</p>
                    <p>Stati creati: {result.states}</p>
                    <p className="message-hint">
                        Vai alla <Link to="/dashboard">Dashboard</Link> per generare il testo.
                    </p>
                </div>
            )}
        </div>
    );
}

export default TrainPage;
