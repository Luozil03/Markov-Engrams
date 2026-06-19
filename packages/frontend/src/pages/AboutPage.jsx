function AboutPage() {
    return (
        <div className="page">
            <div className="page-header">
                <h1>Engrammi di Markov</h1>
                <p className="page-subtitle">
                    Generatore di testo procedurale basato sulle Catene di Markov e architettura a Microservizi.
                </p>
            </div>

            <section className="about-section">
                <h2>Cos'è una Catena di Markov?</h2>
                <p>
                    Una catena di Markov è un modello probabilistico che prevede
                    il prossimo evento basandosi <strong>solo sullo stato corrente</strong>,
                    senza considerare la memoria degli stati precedenti. 
                </p>
                <p>
                    In questo progetto, l'algoritmo divide un testo sorgente in token (parole). 
                    Per ogni parola, calcola la frequenza e la probabilità con cui le altre parole la seguono, 
                    costruendo una matrice di transizione (l'Engramma) che viene poi salvata nel database.
                </p>
            </section>

            <section className="about-section">
                <h2>I Parametri di Generazione</h2>
                <h3>Ordine della catena</h3>
                <ul className="about-list">
                    <li><strong>Ordine 1</strong> (Bigrammi): lo stato è composto da 1 sola parola. Genera testi molto surreali.</li>
                    <li><strong>Ordine 2</strong> (Trigrammi): lo stato è composto da 2 parole. Genera frasi sintatticamente più corrette.</li>
                    <li><strong>Ordine 3</strong> (Quadrigrammi): lo stato è composto da 3 parole. Genera testi estremamente fedeli all'originale, quasi un copia-incolla (richiede testi sorgente enormi per avere variazioni).</li>
                </ul>

                <h3>Temperatura</h3>
                <p>
                    La temperatura interviene sul calcolo delle probabilità durante il Random Walk:
                </p>
                <ul className="about-list">
                    <li><strong>T &lt; 1.0</strong>: Sceglie le parole più probabili (testo ripetitivo).</li>
                    <li><strong>T = 1.0</strong>: Distribuzione originale.</li>
                    <li><strong>T &gt; 1.0</strong>: Dà più chance alle parole rare (testo caotico).</li>
                </ul>
            </section>

            <section className="about-section">
                <h2>Architettura di Sistema</h2>
                <p>
                    L'applicazione è strutturata a microservizi:
                </p>
                <ul className="about-list">
                    <li><strong>Frontend (Porta 5173):</strong> Sviluppato in React tramite Vite. Comunica con i backend tramite API RESTful (metodi GET, POST, PATCH, DELETE).</li>
                    <li><strong>Training Service (Porta 4001):</strong> Microservizio Node.js/Express. Riceve il testo, esegue l'algoritmo matematico pesante e salva la matrice.</li>
                    <li><strong>Generation Service (Porta 4002):</strong> Microservizio Node.js/Express. Legge i modelli dal DB, esclude la matrice nelle liste per non saturare la banda, e genera gli engrammi.</li>
                    <li><strong>Database (Porta 27017):</strong> MongoDB. Ideale per salvare documenti JSON dinamici come le matrici sparse di Markov.</li>
                </ul>
            </section>
        </div>
    );
}

export default AboutPage;
