import { BrowserRouter, Routes, Route } from "react-router-dom";
// TODO: importare i componenti man mano che li sviluppo

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                {/* TODO: Inserire la Navbar qui */}
                <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
                    <h2>MarkovGen - Work in Progress</h2>
                </header>

                <main style={{ padding: "2rem" }}>
                    <Routes>
                        <Route path="/" element={<p>Qui ci andrà la pagina di Training (TrainPage)</p>} />
                        <Route path="/dashboard" element={<p>Qui ci andrà la Dashboard</p>} />
                        <Route path="/about" element={<p>Pagina About provvisoria</p>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
