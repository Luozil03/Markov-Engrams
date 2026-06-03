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
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Addestra un nuovo Modello</h2>
            <p>Incolla un testo oppure carica un .txt per creare l'engramma di Markov.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label>Nome del modello *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label>Descrizione</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label>Ordine (1 o 2)</label>
                    <select value={order} onChange={(e) => setOrder(Number(e.target.value))}>
                        <option value={1}>1 - Testi più casuali</option>
                        <option value={2}>2 - Testi più sensati</option>
                        <option value={3}>3 - Molto fedele al testo</option>
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label>Testo sorgente *</label>
                    <input
                        type="file"
                        accept=".txt"
                        onChange={handleFileUpload}
                        style={{ marginBottom: "0.5rem" }}
                    />
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        required
                    />
                    <small>{text.split(/\s+/).filter(Boolean).length} parole contate</small>
                </div>

                <button type="submit" disabled={loading} style={{ padding: "0.5rem", marginTop: "1rem" }}>
                    {loading ? "Addestramento in corso..." : "Addestra Modello"}
                </button>
            </form>

            {error && (
                <div style={{ color: "red", marginTop: "1rem" }}>
                    <strong>Errore:</strong> {error}
                </div>
            )}

            {result && (
                <div style={{ color: "green", marginTop: "1rem", border: "1px solid green", padding: "1rem" }}>
                    <h3>Modello salvato!</h3>
                    <p>ID: {result._id}</p>
                    <p>Stati creati: {result.states}</p>
                    <p>
                        Vai alla <Link to="/dashboard">Dashboard</Link> per generare il testo.
                    </p>
                </div>
            )}
        </div>
    );
}

export default TrainPage;
