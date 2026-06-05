import { useState } from "react";
import { Link } from "react-router-dom";
import { trainModel } from "../api.js";

function TrainPage() {
    // stati del form
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [text, setText] = useState("");
    const [order, setOrder] = useState(1);

    // stati operazione
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Gestisce il caricamento del file txt per non incollare papiri
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

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            const data = await trainModel({ name, description, text, order });

            if (data.success) {
                setResult(data.model);
                // svuoto i campi dopo il successo
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
                <p className="page-subtitle">Incolla un testo o carica un file .txt per generare l'engramma.</p>
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
                    <label>Ordine (1 o 2)</label>
                    <select value={order} onChange={(e) => setOrder(Number(e.target.value))}>
                        <option value={1}>1 - Testi più casuali</option>
                        <option value={2}>2 - Testi più sensati</option>
                        <option value={3}>3 - Molto fedele al testo</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Testo sorgente *</label>
                    <div className="file-upload">
                        <input type="file" accept=".txt" onChange={handleFileUpload} />
                    </div>
                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} required />
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
