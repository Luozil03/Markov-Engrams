import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getModels, deleteModel, generateText, updateModel } from "../api.js";

function DashboardPage() {

    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stato generazione
    const [generatingId, setGeneratingId] = useState(null);
    const [generatedTexts, setGeneratedTexts] = useState({});
    const [genLength, setGenLength] = useState(50);
    const [genSeed, setGenSeed] = useState("");
    const [genTemp, setGenTemp] = useState(1.0);
    const [copied, setCopied] = useState(null);

    // Stato modifica (Edit)
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");


    // Carica i modelli all'avvio
    useEffect(() => {
        loadModels();
    }, []);

    async function loadModels() {
        try {
            setError(null);
            const data = await getModels();
            if (data.success) {
                setModels(data.models);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Non riesco a contattare il server");
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerate(modelId) {
        setGeneratingId(modelId);
        try {
            const data = await generateText({
                modelId,
                length: genLength,
                seed: genSeed || undefined,
                temperature: genTemp,
            });

            if (data.success) {
                setGeneratedTexts((prev) => ({
                    ...prev,
                    [modelId]: data.text,
                }));
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Errore nella generazione del testo.");
        } finally {
            setGeneratingId(null);
        }
    }

    async function handleDelete(modelId, modelName) {
        // TODO: window.confirm è un po' brutto graficamente, magari in futuro fare un modal custom
        const confirmed = window.confirm(`Sicuro di voler eliminare "${modelName}"?`);
        if (!confirmed) return;

        try {
            const data = await deleteModel(modelId);
            if (data.success) {
                setGeneratedTexts((prev) => {
                    const copy = { ...prev };
                    delete copy[modelId];
                    return copy;
                });
                loadModels();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Errore nell'eliminazione.");
        }
    }

    function formatDate(isoString) {
        return new Date(isoString).toLocaleDateString("it-IT");
    }

    async function handleCopy(modelId) {
        const text = generatedTexts[modelId];
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(modelId);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            setError("Errore negli appunti.");
        }
    }

    // Funzioni per aggiornamento
    function handleEdit(model) {
        setEditingId(model._id);
        setEditName(model.name);
        setEditDesc(model.description || "");
    }

    function handleCancelEdit() {
        setEditingId(null);
        setEditName("");
        setEditDesc("");
    }

    async function handleSaveEdit(modelId) {
        try {
            const data = await updateModel(modelId, {
                name: editName,
                description: editDesc,
            });

            if (data.success) {
                setEditingId(null);
                loadModels();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Errore aggiornamento.");
        }
    }

    if (loading) return <p>Caricamento modelli in corso...</p>;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2>Dashboard Modelli</h2>

            {/* controlli generali (brutti ma funzionali per ora) */}
            <div style={{ background: "#f0f0f0", padding: "1rem", marginBottom: "1rem", borderRadius: "5px" }}>
                <h4>Impostazioni Generazione</h4>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <label>Lunghezza: <input type="number" min={5} max={500} value={genLength} onChange={e => setGenLength(Number(e.target.value))} /></label>
                    <label>Seed: <input type="text" placeholder="Es. il gatto" value={genSeed} onChange={e => setGenSeed(e.target.value)} /></label>
                    <label>Temp ({genTemp.toFixed(1)}): <input type="range" min={0.1} max={3.0} step={0.1} value={genTemp} onChange={e => setGenTemp(Number(e.target.value))} /></label>
                </div>
            </div>

            {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

            {models.length === 0 && (
                <p>Nessun modello trovato. Vai su <Link to="/">Addestra</Link> per crearne uno.</p>
            )}

            {/* Lista Modelli */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {models.map((model) => (
                    <div key={model._id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            
                            {editingId === model._id ? (
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                            ) : (
                                <h3 style={{ margin: 0 }}>{model.name}</h3>
                            )}

                            <div>
                                {editingId === model._id ? (
                                    <>
                                        <button onClick={() => handleSaveEdit(model._id)}>Salva</button>
                                        <button onClick={handleCancelEdit}>Annulla</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(model)}>Modifica</button>
                                        <button onClick={() => handleDelete(model._id, model.name)} style={{ color: "red" }}>Elimina</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {editingId === model._id ? (
                            <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descrizione..." style={{ marginTop: "0.5rem" }} />
                        ) : (
                            <p style={{ color: "#666", fontSize: "0.9rem" }}>{model.description}</p>
                        )}

                        <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "1rem" }}>
                            Ordine: {model.order} | Parole originali: {model.sourceLength} | Creato: {formatDate(model.createdAt)}
                        </div>

                        <button onClick={() => handleGenerate(model._id)} disabled={generatingId === model._id}>
                            {generatingId === model._id ? "Generazione in corso..." : "Genera Testo"}
                        </button>

                        {/* Risultato della generazione */}
                        {generatedTexts[model._id] && (
                            <div style={{ marginTop: "1rem", padding: "1rem", background: "#e8f4f8", borderRadius: "5px" }}>
                                <strong>Testo Generato: </strong>
                                <p>{generatedTexts[model._id]}</p>
                                <button onClick={() => handleCopy(model._id)}>
                                    {copied === model._id ? "Copiato!" : "Copia testo"}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;
