// Impostazioni globali del documento
#set document(
  title: "Relazione Progetto: Markov-Engrams",
  author: "Luca Luosi",
)

#set page(
  paper: "a4",
  margin: (top: 3cm, bottom: 2.5cm, left: 3cm, right: 2.5cm),
  header: align(right)[#text(size: 9pt, fill: gray)[Progetto di Tecnologie Internet]],
  footer: context align(center)[
    #text(size: 9pt, fill: gray)[#counter(page).display() / #counter(page).final().first()]
  ],
)

// Serif per leggibilità testo, Monospace solo per codice
#set text(
  font: ("Libertinus Serif", "Times New Roman", "Arial"),
  size: 11pt,
  lang: "it",
)

#set par(justify: true, leading: 1.25em) // Interlinea corretta per la lettura
#set heading(numbering: "1.1")

// Frontespizio
#align(center)[
  #v(1.5cm)
  #text(size: 24pt, weight: "bold")[Markov-Engrams] \
  #v(0.5cm)
  #text(size: 14pt, style: "italic")[Generatore procedurale di testo basato su Catene di Markov] \
  #v(2.5cm)

  #text(size: 12pt)[*Corso:* Tecnologie Internet] \
  #text(size: 12pt)[*Docente:* Prof. Michele Amoretti] \
  #v(1.5cm)
  #text(size: 12pt)[*Candidato:* Luca Luosi] \
  #text(size: 12pt)[*Matricola:* 334178] \
  #v(3cm)
]

#pagebreak()

// Indice
#outline(title: "Indice", depth: 2)
#pagebreak()

// Main
= Specifica dei requisiti
Il progetto consiste nello sviluppo di una Web Application client-server denominata "Markov-Engrams". L'obiettivo principale è permettere la generazione procedurale di testi (definiti _engrammi_) addestrando un modello probabilistico su testi sorgente forniti dall'utente.

I *requisiti funzionali* del sistema includono:
- Caricamento di un testo sorgente tramite tre modalità: copia-incolla manuale, upload di file `.txt`, oppure download diretto da Wikipedia tramite le sue API RESTful pubbliche.
- Costruzione di un modello basato su Catene di Markov di ordine 1, 2 o 3.
- Gestione completa (CRUD) dei modelli salvati: lettura, modifica parziale (nome e descrizione) ed eliminazione.
- Generazione parametrica di testo a partire dai modelli, permettendo di variare la lunghezza, il _seed_ iniziale e la _temperatura_ matematica per influenzare il livello di casualità.

I *requisiti non funzionali* impongono l'utilizzo di una Single Page Application (SPA) per l'interfaccia, di backend in grado di esporre servizi RESTful e dell'utilizzo di uno storage persistente per i dati.

#v(2em)

= Progettazione del sistema
Per soddisfare i requisiti, il sistema è stato progettato secondo un'architettura a *microservizi*, separando nettamente i carichi di lavoro computazionali (training) da quelli di consultazione (generation).

== Tecnologie utilizzate

#align(center)[
  #table(
    columns: (auto, 1fr),
    stroke: none,
    inset: 8pt,
    align: left,

    table.hline(stroke: 1.2pt),
    [*Tecnologia*], [*Motivazione*],
    table.hline(stroke: 0.5pt),

    [React 19], [Libreria per la costruzione di interfacce reattive tramite componenti e stato],
    [Vite 6], [Build tool e dev server con Hot Module Replacement per sviluppo rapido],
    [Express 4], [Framework minimale per esporre i microservizi come API RESTful],
    [MongoDB / Mongoose], [Database NoSQL ideale per salvare documenti JSON dinamici come le matrici sparse],
    [pnpm Workspaces], [Gestore di pacchetti con supporto Monorepo per condividere codice tra i servizi],
    [react-router-dom], [Routing client-side per la navigazione SPA senza ricaricare la pagina],

    table.hline(stroke: 1.2pt),
  )
]

== Scelta del Database
La scelta dello storage è ricaduta su un database NoSQL, nello specifico *MongoDB*. L'algoritmo di Markov produce matrici di transizione che risultano essere array associativi altamente annidati e sparsi (es. `Stato -> { Parola_A: prob, Parola_B: prob }`). Mappare queste strutture in tabelle SQL relazionali risulterebbe inefficiente; al contrario, il formato BSON orientato ai documenti di MongoDB permette di serializzare e salvare l'intera matrice nativamente in un singolo documento.

== Design delle API REST
La comunicazione tra client e server avviene esclusivamente tramite payload JSON su architettura RESTful. Le principali rotte implementate sono:

#align(center)[
  #table(
    columns: (auto, auto, 1fr),
    stroke: none,
    inset: 8pt,
    align: (x, y) => if x == 0 { center } else { left },

    table.hline(stroke: 1.2pt),
    [*Metodo*], [*Endpoint*], [*Descrizione*],
    table.hline(stroke: 0.5pt),

    [`POST`], [`/api/train`], [Analizza il testo, genera la matrice di Markov e salva il modello],
    [`GET`], [`/api/models`], [Recupera i metadati di tutti i modelli (escludendo la matrice per efficienza)],
    [`PATCH`], [`/api/models/:id`], [Aggiorna parzialmente il modello (nome o descrizione)],
    [`DELETE`], [`/api/models/:id`], [Elimina permanentemente un modello dal database],
    [`POST`], [`/api/generate`], [Esegue il Random Walk su un modello specifico per generare l'engramma],

    table.hline(stroke: 1.2pt),
  )
]

#v(2em)

= Implementazione del sistema
L'implementazione sfrutta un moderno stack basato su JavaScript/Node.js, organizzato in un *Monorepo* gestito tramite i workspace di `pnpm`.

== Struttura del Monorepo
Il codice è suddiviso in 4 pacchetti indipendenti ma interconnessi:
- `@mvgc/shared`: Contiene la logica matematica pura (tokenizzazione, normalizzazione delle frequenze in probabilità, random walk con campionamento pesato basato sulla temperatura), oltre agli schemi dell'ODM _Mongoose_ e ai middleware Express condivisi.
- `@mvgc/service-training`: Microservizio backend (Express) sulla porta `4001`, dedicato all'elaborazione intensiva per la creazione dei modelli. Accetta payload JSON fino a 5MB per consentire il caricamento di testi estesi.
- `@mvgc/service-generation`: Microservizio backend (Express) sulla porta `4002`, dedicato all'interrogazione del database e alla generazione di testi in tempo reale. Nella rotta `GET /api/models`, la matrice viene esclusa dalla query per non saturare la banda.
- `@mvgc/frontend`: Applicazione React configurata con il bundler _Vite_. Impiega `react-router-dom` per la navigazione client-side e gestisce il proxying locale verso i microservizi per prevenire blocchi CORS durante lo sviluppo.

== Interfaccia utente
La SPA è composta da tre viste principali, accessibili tramite una barra di navigazione persistente:

- *Addestra Modello* (`TrainPage`): Pagina principale che permette di inserire il testo sorgente in tre modi: digitazione manuale nella textarea, upload di un file `.txt` dal filesystem, oppure download automatico da Wikipedia Italia tramite una chiamata `fetch` alle API RESTful di Wikimedia (`action=query`, `prop=extracts`). L'utente seleziona l'ordine della catena (1, 2 o 3) e avvia l'addestramento.

- *Dashboard* (`DashboardPage`): Console di controllo che elenca tutti i modelli salvati sotto forma di card. Per ciascun modello è possibile: generare un engramma configurando lunghezza, seed e temperatura tramite controlli globali; modificare nome e descrizione con editing inline (PATCH); eliminare il modello con conferma (DELETE); copiare il testo generato negli appunti.

- *Info* (`AboutPage`): Pagina didattica che illustra il funzionamento teorico delle Catene di Markov, il significato dei parametri (ordine, temperatura) e l'architettura a microservizi del sistema.

#v(2em)

= Testing
Lo sviluppo ha seguito un approccio metodologico _Bottom-Up_, garantendo il collaudo di ogni componente prima dell'integrazione:

+ *Test Logico-Matematico:* L'algoritmo di Markov e il layer di salvataggio Mongoose sono stati collaudati tramite script Node.js eseguiti direttamente da terminale (es. `test-db.js`), validando la coerenza delle somme probabilistiche (che devono equivalere a `1.0`) e la corretta deserializzazione delle `Map` JavaScript da e verso il formato BSON di MongoDB.

+ *Test di Integrazione API:* I microservizi RESTful sono stati testati individualmente tramite `curl`. Ad esempio, per verificare la rotta di training:

  ```bash
  curl -X POST http://localhost:4001/api/train \
    -H "Content-Type: application/json" \
    -d '{"name": "Test", "text": "il gatto mangia il pesce", "order": 1}'
  ```

  Sono stati verificati i codici di stato HTTP (`201 Created`, `400 Bad Request` per richieste malformate, `404 Not Found` per ID inesistenti) e l'efficacia del middleware centralizzato di Error Handling, che intercetta errori di tipo `CastError` e `ValidationError` di Mongoose restituendo risposte JSON uniformi.

+ *Test End-to-End:* Infine, le funzionalità sono state validate direttamente dall'interfaccia utente, testando il flusso completo: upload di file `.txt`, download da Wikipedia, manipolazione dei parametri di generazione (lunghezza, seed, temperatura) e operazioni CRUD sui modelli dalla Dashboard.

#v(2em)

= Conclusioni
Il progetto "Markov-Engrams" soddisfa i requisiti del corso, offrendo un'implementazione solida di un generatore procedurale supportato da un'infrastruttura web scalabile e moderna.

== Difficoltà incontrate
Durante lo sviluppo sono emerse alcune problematiche significative:
- *Gestione degli stati assorbenti:* durante la fase di generazione, il random walk poteva arrestarsi prematuramente incontrando stati della matrice privi di transizioni in uscita (tipici della fine del testo sorgente). Il problema è stato risolto implementando un meccanismo di _fallback_ che riparte da uno stato casuale, garantendo che l'output raggiunga sempre la lunghezza richiesta.
- *Limite dei file watchers in Linux:* il dev server Vite crashava per via del limite di default di `inotify` watchers nel kernel Linux, insufficiente per monitorare i file di un progetto Node.js con molte dipendenze. La soluzione ha richiesto l'incremento del parametro `fs.inotify.max_user_watches` a livello di sistema.

== Possibili sviluppi futuri
Al fine di migliorare ulteriormente il sistema, in futuro si potrebbe:
- Introdurre un layer di caching (es. _Redis_) per mantenere in memoria i modelli maggiormente richiesti, riducendo i tempi di caricamento da MongoDB per le matrici di enormi dimensioni.
- Implementare l'autenticazione tramite _JSON Web Token_ (JWT) per associare i modelli addestrati a specifici account utente.
- Supportare fonti di testo aggiuntive (es. Project Gutenberg, feed RSS) per semplificare ulteriormente il reperimento di corpora testuali di grandi dimensioni.

== Nota metodologica
Nel rispetto dell'integrità e della trasparenza accademica, si segnala
che durante lo sviluppo di questo progetto sono stati utilizzati
strumenti basati su LLM (Large Language Models) in veste di
"pair programmer" e tutor.

Tali strumenti sono stati impiegati per:
- Velocizzare la stesura di codice boilerplate (configurazione
  React/Vite, Express, middleware standard)
- Ottimizzare l'impaginazione del CSS e migliorare la leggibilità
- Assistenza nel debugging (es. risoluzione di configurazioni di Vite e pnpm)
- Esplorare approcci architetturali e discutere alternative
  progettuali come "sparring partner" concettuale

Le scelte finali (stack tecnologico, struttura dell'algoritmo di
Markov, schema del database) sono state validate e adattate da me
dopo studio personale dei concetti teorici sottostanti (catene di
Markov, matrici di transizione, algoritmi di Random Walk) e
sperimentazione pratica. Il codice generato con l'ausilio di LLM
è stato successivamente analizzato, compreso e modificato secondo
le esigenze del progetto.
