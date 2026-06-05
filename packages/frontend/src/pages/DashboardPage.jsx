import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getModels, deleteModel, generateText, updateModel } from "../api.js";

function DashboardPage() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [generatingId, setGeneratingId] = useState(null);
    const [generatedTexts, setGeneratedTexts] = useState({});
    const [genLength, setGenLength] = useState(50);
    const [genSeed, setGenSeed] = useState("");
    const [genTemp, setGenTemp] = useState(1.0);
    const [copied, setCopied] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    useEffect(() => { loadModels(); }, []);

    async function loadModels() {
        try {
            setError(null);
            const data = await getModels();
            if (data.success) setModels(data.models);
            else setError(data.error);
        } catch (err) {
            setError("Impossibile caricare i modelli. Il server è acceso?");
        } finally {
            setLoading(false);
        }
    }

    async function handleGenerate(modelId) {
        setGeneratingId(modelId);
        try {
            const data = await generateText({
                modelId, length: genLength, seed: genSeed || undefined, temperature: genTemp,
            });
            if (data.success) {
                setGeneratedTexts(prev => ({ ...prev, [modelId]: data.text }));
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
        const confirmed = window.confirm(`Sicuro di voler eliminare "${modelName}"?`);
        if (!confirmed) return;
        try {
            const data = await deleteModel(modelId);
            if (data.success) {
                setGeneratedTexts(prev => { const copy = { ...prev }; delete copy[modelId]; return copy; });
                loadModels();
            } else setError(data.error);
        } catch (err) { setError("Errore nell'eliminazione."); }
    }

    function formatDate(isoString) { return new Date(isoString).toLocaleDateString("it-IT"); }

    async function handleCopy(modelId) {
        const text = generatedTexts[modelId];
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(modelId);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) { setError("Errore negli appunti."); }
    }

    function handleEdit(model) {
        setEditingId(model._id); setEditName(model.name); setEditDesc(model.description || "");
    }

    function handleCancelEdit() {
        setEditingId(null); setEditName(""); setEditDesc("");
    }

    async function handleSaveEdit(modelId) {
        try {
            const data = await updateModel(modelId, { name: editName, description: editDesc });
            if (data.success) { setEditingId(null); loadModels(); }
            else setError(data.error);
        } catch (err) { setError("Errore aggiornamento."); }
    }

    if (loading) return <div className="loading-text">Caricamento modelli in corso...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Dashboard Modelli</h1>
                <p className="page-subtitle">Console di controllo e generazione Engrammi.</p>
            </div>

            {/* Controlli Generali */}
            <div className="gen-controls">
                <div className="gen-control-group">
                    <label>Lunghezza (parole)</label>
                    <input type="number" min={5} max={500} value={genLength} onChange={e => setGenLength(Number(e.target.value))} />
                </div>
                <div className="gen-control-group">
                    <label>Seed di partenza</label>
                    <input type="text" placeholder="Es. il gatto" value={genSeed} onChange={e => setGenSeed(e.target.value)} />
                </div>
                <div className="gen-control-group">
                    <label>Temperatura ({genTemp.toFixed(1)})</label>
                    <input type="range" min={0.1} max={3.0} step={0.1} value={genTemp} onChange={e => setGenTemp(Number(e.target.value))} />
                </div>
            </div>

            {error && <div className="message message-error">{error}</div>}
            
            {models.length === 0 && (
                <div className="empty-state">
                    <p>Nessun modello trovato.</p>
                    <Link to="/" className="btn btn-primary" style={{ display: "inline-block", marginTop: "1rem" }}>Crea il primo modello</Link>
                </div>
            )}

            <div className="models-grid">
                {models.map((model) => (
                    <div key={model._id} className="model-card">
                        <div className="model-card-header">
                            {editingId === model._id ? (
                                <input className="edit-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                            ) : (
                                <h3 className="model-card-title">{model.name}</h3>
                            )}
                        </div>

                        {editingId === model._id ? (
                            <input className="edit-input" type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descrizione..." />
                        ) : (
                            <p className="model-card-desc">{model.description}</p>
                        )}

                        <div className="model-card-stats">
                            <span>Ordine: {model.order}</span>
                            <span>Parole base: {model.sourceLength}</span>
                            <span>Data: {formatDate(model.createdAt)}</span>
                        </div>

                        <div className="model-card-actions" style={{ marginTop: "auto", paddingTop: "1rem" }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleGenerate(model._id)} disabled={generatingId === model._id}>
                                {generatingId === model._id ? "Generazione..." : "Genera Testo"}
                            </button>
                            {editingId === model._id ? (
                                <>
                                    <button className="btn btn-secondary" onClick={() => handleSaveEdit(model._id)}>Salva</button>
                                    <button className="btn btn-secondary" onClick={handleCancelEdit}>X</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn btn-secondary" onClick={() => handleEdit(model)}>Modifica</button>
                                    <button className="btn btn-danger" onClick={() => handleDelete(model._id, model.name)}>Elimina</button>
                                </>
                            )}
                        </div>

                        {generatedTexts[model._id] && (
                            <div className="generated-text">
                                <div className="generated-text-header">
                                    <strong style={{ color: "var(--accent)" }}>&gt;_ Output</strong>
                                    <button className="btn btn-secondary btn-small" onClick={() => handleCopy(model._id)}>
                                        {copied === model._id ? "Copiato!" : "Copia"}
                                    </button>
                                </div>
                                <p className="generated-text-content">{generatedTexts[model._id]}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DashboardPage;
